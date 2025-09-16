"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DonationWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationWebhookService = void 0;
const common_1 = require("@nestjs/common");
const donation_processing_service_1 = require("./donation-processing.service");
const donations_service_1 = require("./donations.service");
const payments_service_1 = require("../payments/payments.service");
const config_service_1 = require("../config/config.service");
const webhook_management_service_1 = require("./webhook-management.service");
const obs_settings_service_1 = require("../obs-settings/obs-settings.service");
const crypto_1 = require("crypto");
const mongoose_1 = require("mongoose");
const donations_gateway_1 = require("../donations/donations.gateway");
const users_service_1 = require("../users/users.service");
let DonationWebhookService = DonationWebhookService_1 = class DonationWebhookService {
    constructor(donationProcessingService, donationsService, paymentsService, configService, webhookManagementService, obsSettingsService, donationsGateway, usersService) {
        this.donationProcessingService = donationProcessingService;
        this.donationsService = donationsService;
        this.paymentsService = paymentsService;
        this.configService = configService;
        this.webhookManagementService = webhookManagementService;
        this.obsSettingsService = obsSettingsService;
        this.donationsGateway = donationsGateway;
        this.usersService = usersService;
        this.logger = new common_1.Logger(DonationWebhookService_1.name);
    }
    async handleWebhook(payload, context) {
        const startTime = Date.now();
        this.logger.log(`Processing webhook: ${payload.type} for ${payload.id}`);
        try {
            const webhookEvent = await this.webhookManagementService.storeWebhookEvent({
                eventId: payload.id,
                provider: 'unknown',
                eventType: payload.type,
                status: 'processing',
                payload: payload,
                signature: payload.signature,
                signatureValid: false,
                ipAddress: context?.ipAddress,
                userAgent: context?.userAgent,
                metadata: { headers: context?.headers },
            });
            let result;
            switch (payload.type) {
                case 'payment_intent.succeeded':
                    result = await this.handlePaymentSuccess(payload);
                    break;
                case 'payment_intent.payment_failed':
                    result = await this.handlePaymentFailure(payload);
                    break;
                case 'charge.refunded':
                    result = await this.handlePaymentRefund(payload);
                    break;
                case 'donation.created':
                    result = await this.handleDonationCreated(payload);
                    break;
                case 'donation.completed':
                    result = await this.handleDonationCompleted(payload);
                    break;
                default:
                    this.logger.warn(`Unhandled webhook type: ${payload.type}`);
                    result = { success: false, message: 'Unhandled webhook type' };
            }
            const processingTime = Date.now() - startTime;
            await this.webhookManagementService.storeWebhookEvent({
                eventId: webhookEvent.eventId,
                provider: webhookEvent.provider,
                eventType: webhookEvent.eventType,
                status: result.success ? 'completed' : 'failed',
                payload: webhookEvent.payload,
                processedData: result,
                processingTimeMs: processingTime,
                signature: webhookEvent.signature,
                signatureValid: webhookEvent.signatureValid,
                relatedDonationId: result.donationId
                    ? new mongoose_1.Types.ObjectId(result.donationId)
                    : undefined,
                errorMessage: result.success ? undefined : result.message,
            });
            this.logger.log(`Webhook processed successfully: ${payload.type} in ${processingTime}ms`);
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            this.logger.error(`Failed to process webhook ${payload.type}: ${error.message}`);
            await this.webhookManagementService.storeWebhookEvent({
                eventId: payload.id,
                provider: 'unknown',
                eventType: payload.type,
                status: 'failed',
                payload: payload,
                errorMessage: error.message,
                processingTimeMs: processingTime,
                signature: payload.signature,
                signatureValid: false,
            });
            throw error;
        }
    }
    async handleStripeWebhook(payload, signature, context) {
        const signatureValid = this.verifyStripeSignature(payload, signature);
        if (!signatureValid) {
            throw new common_1.BadRequestException('Invalid Stripe webhook signature');
        }
        const webhookPayload = {
            id: payload.id,
            type: payload.type,
            data: payload.data,
            created: payload.created,
            signature,
        };
        await this.webhookManagementService.storeWebhookEvent({
            eventId: payload.id,
            provider: 'stripe',
            eventType: payload.type,
            status: 'processing',
            payload: payload,
            signature: signature,
            signatureValid: true,
            ipAddress: context?.ipAddress,
            userAgent: context?.userAgent,
            metadata: { headers: context?.headers },
        });
        await this.handleWebhook(webhookPayload, context);
    }
    async handlePayPalWebhook(payload, signature, context) {
        const signatureValid = this.verifyPayPalSignature(payload, signature);
        if (!signatureValid) {
            throw new common_1.BadRequestException('Invalid PayPal webhook signature');
        }
        const webhookPayload = {
            id: payload.id,
            type: payload.event_type,
            data: payload.resource,
            created: Math.floor(Date.now() / 1000),
            signature,
        };
        await this.webhookManagementService.storeWebhookEvent({
            eventId: payload.id,
            provider: 'paypal',
            eventType: payload.event_type,
            status: 'processing',
            payload: payload,
            signature: signature,
            signatureValid: true,
            ipAddress: context?.ipAddress,
            userAgent: context?.userAgent,
            metadata: { headers: context?.headers },
        });
        await this.handleWebhook(webhookPayload, context);
    }
    async handleCustomDonationWebhook(payload, secret, context) {
        const signatureValid = this.verifyCustomWebhookSecret(payload, secret);
        if (!signatureValid) {
            throw new common_1.BadRequestException('Invalid webhook secret');
        }
        const webhookPayload = {
            id: payload.id || Date.now().toString(),
            type: payload.type || 'donation.created',
            data: payload.data || payload,
            created: payload.created || Math.floor(Date.now() / 1000),
        };
        await this.webhookManagementService.storeWebhookEvent({
            eventId: webhookPayload.id,
            provider: 'custom',
            eventType: webhookPayload.type,
            status: 'processing',
            payload: payload,
            signature: secret,
            signatureValid: true,
            ipAddress: context?.ipAddress,
            userAgent: context?.userAgent,
            metadata: { headers: context?.headers },
        });
        await this.handleWebhook(webhookPayload, context);
    }
    async handlePaymentSuccess(payload) {
        const paymentIntentId = payload.data.object?.id || payload.data.id;
        if (!paymentIntentId) {
            throw new common_1.BadRequestException('Payment intent ID not found in webhook');
        }
        const donation = await this.donationsService.findDonationByPaymentIntent(paymentIntentId);
        if (!donation) {
            this.logger.warn(`Donation not found for payment intent: ${paymentIntentId}`);
            return {
                success: false,
                message: 'Donation not found',
                donationId: null,
            };
        }
        await this.donationProcessingService.confirmExternalPayment(donation._id.toString(), paymentIntentId);
        try {
            await this.triggerOBSDonationAlert(donation);
        }
        catch (error) {
            this.logger.error(`Failed to trigger OBS alert for donation ${donation._id}: ${error.message}`);
        }
        try {
            let donorName = 'Anonymous';
            if (!donation.isAnonymous && donation.donorId) {
                try {
                    const donor = await this.usersService.findById(donation.donorId.toString());
                    donorName = donor.username || `${donor.firstName} ${donor.lastName}`.trim() || 'Anonymous';
                }
                catch (error) {
                    this.logger.warn(`Failed to get donor name for donation ${donation._id}: ${error.message}`);
                }
            }
            this.donationsGateway.sendDonationAlert(donation.streamerId.toString(), donation, donorName);
        }
        catch (error) {
            this.logger.error(`Failed to send general donation notification for donation ${donation._id}: ${error.message}`);
        }
        this.logger.log(`Payment confirmed and donation completed: ${donation._id}`);
        return {
            success: true,
            message: 'Payment confirmed',
            donationId: donation._id.toString(),
        };
    }
    async handlePaymentFailure(payload) {
        const paymentIntentId = payload.data.object?.id || payload.data.id;
        if (!paymentIntentId) {
            throw new common_1.BadRequestException('Payment intent ID not found in webhook');
        }
        const donation = await this.donationsService.findDonationByPaymentIntent(paymentIntentId);
        if (!donation) {
            this.logger.warn(`Donation not found for payment intent: ${paymentIntentId}`);
            return {
                success: false,
                message: 'Donation not found',
                donationId: null,
            };
        }
        await this.donationsService.processDonationStatusChange(donation._id.toString(), 'failed', {
            failureReason: 'Payment failed',
            webhookData: payload.data,
        });
        this.logger.log(`Payment failed for donation: ${donation._id}`);
        return {
            success: true,
            message: 'Payment failed',
            donationId: donation._id.toString(),
        };
    }
    async handlePaymentRefund(payload) {
        const paymentIntentId = payload.data.object?.payment_intent || payload.data.payment_intent;
        if (!paymentIntentId) {
            throw new common_1.BadRequestException('Payment intent ID not found in webhook');
        }
        const donation = await this.donationsService.findDonationByPaymentIntent(paymentIntentId);
        if (!donation) {
            this.logger.warn(`Donation not found for payment intent: ${paymentIntentId}`);
            return {
                success: false,
                message: 'Donation not found',
                donationId: null,
            };
        }
        await this.donationsService.processDonationStatusChange(donation._id.toString(), 'cancelled', {
            refundReason: 'Payment refunded',
            webhookData: payload.data,
            isRefunded: true,
            refundedAt: new Date(),
        });
        this.logger.log(`Payment refunded for donation: ${donation._id}`);
        return {
            success: true,
            message: 'Payment refunded',
            donationId: donation._id.toString(),
        };
    }
    async handleDonationCreated(payload) {
        this.logger.log(`Donation created webhook received: ${payload.id}`);
        return { success: true, message: 'Donation created', donationId: null };
    }
    async handleDonationCompleted(payload) {
        this.logger.log(`Donation completed webhook received: ${payload.id}`);
        return { success: true, message: 'Donation completed', donationId: null };
    }
    async triggerOBSDonationAlert(donation) {
        try {
            const obsSettings = await this.obsSettingsService.findByStreamerId(donation.streamerId.toString());
            if (!obsSettings || !obsSettings.alertToken) {
                this.logger.warn(`No OBS settings found for streamer ${donation.streamerId}`);
                return;
            }
            let donorName = 'Anonymous';
            if (!donation.isAnonymous && donation.donorId) {
                donorName = 'Donor';
            }
            const donationAlertData = {
                donorName: donorName,
                amount: donation.amount.toString(),
                currency: donation.currency,
                message: donation.message || 'Thank you for your donation!',
                donationId: donation._id.toString(),
                paymentMethod: donation.paymentMethod,
                isAnonymous: donation.isAnonymous,
                transactionId: donation.transactionId,
                metadata: donation.metadata,
            };
            await this.obsSettingsService.triggerDonationAlert(obsSettings.alertToken, donationAlertData);
            this.logger.log(`OBS donation alert triggered for donation ${donation._id}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger OBS donation alert: ${error.message}`);
            throw error;
        }
    }
    verifyStripeSignature(payload, signature) {
        try {
            const stripeSecret = this.configService.stripeWebhookSecret;
            if (!stripeSecret) {
                this.logger.warn('STRIPE_WEBHOOK_SECRET not configured');
                return false;
            }
            const timestamp = signature.split(',')[0].split('=')[1];
            const signedPayload = `${timestamp}.${JSON.stringify(payload)}`;
            const expectedSignature = (0, crypto_1.createHmac)('sha256', stripeSecret)
                .update(signedPayload, 'utf8')
                .digest('hex');
            const receivedSignature = signature.split(',')[1].split('=')[1];
            return expectedSignature === receivedSignature;
        }
        catch (error) {
            this.logger.error(`Failed to verify Stripe signature: ${error.message}`);
            return false;
        }
    }
    verifyPayPalSignature(payload, signature) {
        try {
            const paypalSecret = this.configService.paypalClientSecret;
            if (!paypalSecret) {
                this.logger.warn('PAYPAL_CLIENT_SECRET not configured');
                return false;
            }
            return signature && signature.length > 0;
        }
        catch (error) {
            this.logger.error(`Failed to verify PayPal signature: ${error.message}`);
            return false;
        }
    }
    verifyCustomWebhookSecret(payload, secret) {
        try {
            const expectedSecret = 'custom-webhook-secret-2024';
            if (!expectedSecret) {
                this.logger.warn('CUSTOM_WEBHOOK_SECRET not configured');
                return false;
            }
            return secret === expectedSecret;
        }
        catch (error) {
            this.logger.error(`Failed to verify custom webhook secret: ${error.message}`);
            return false;
        }
    }
    async registerWebhookEndpoints() {
        try {
            const stripeWebhookUrl = `${this.configService.frontendUrl}/api/donations/webhooks/stripe`;
            this.logger.log(`Stripe webhook endpoint: ${stripeWebhookUrl}`);
            const paypalWebhookUrl = `${this.configService.frontendUrl}/api/donations/webhooks/paypal`;
            this.logger.log(`PayPal webhook endpoint: ${paypalWebhookUrl}`);
            const customWebhookUrl = `${this.configService.frontendUrl}/api/donations/webhooks/custom`;
            this.logger.log(`Custom webhook endpoint: ${customWebhookUrl}`);
        }
        catch (error) {
            this.logger.error(`Failed to register webhook endpoints: ${error.message}`);
        }
    }
    async getWebhookStats() {
        return {
            totalWebhooks: 0,
            successfulWebhooks: 0,
            failedWebhooks: 0,
            averageProcessingTime: 0,
        };
    }
    async processDonationCompletedWebhook(signature, webhookData, context) {
        await this.handleCustomDonationWebhook(webhookData, signature, context);
    }
    async processDonationStartedWebhook(signature, webhookData, context) {
        await this.handleCustomDonationWebhook(webhookData, signature, context);
    }
    async processQRScannedWebhook(signature, webhookData, context) {
        await this.handleCustomDonationWebhook(webhookData, signature, context);
    }
    async processSocialShareWebhook(signature, webhookData, context) {
        await this.handleCustomDonationWebhook(webhookData, signature, context);
    }
    async processLinkClickWebhook(signature, webhookData, context) {
        await this.handleCustomDonationWebhook(webhookData, signature, context);
    }
};
exports.DonationWebhookService = DonationWebhookService;
exports.DonationWebhookService = DonationWebhookService = DonationWebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [donation_processing_service_1.DonationProcessingService,
        donations_service_1.DonationsService,
        payments_service_1.PaymentsService,
        config_service_1.ConfigService,
        webhook_management_service_1.WebhookManagementService,
        obs_settings_service_1.OBSSettingsService,
        donations_gateway_1.DonationsGateway,
        users_service_1.UsersService])
], DonationWebhookService);
//# sourceMappingURL=donation-webhook.service.js.map