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
var PaypalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaypalService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../config/config.service");
let PaypalService = PaypalService_1 = class PaypalService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PaypalService_1.name);
        this.paypal = null;
        this.isEnabled = false;
        this.initializePayPal();
    }
    initializePayPal() {
        const clientId = this.configService.paypalClientId;
        const clientSecret = this.configService.paypalClientSecret;
        if (clientId &&
            clientSecret &&
            clientId.trim() !== '' &&
            clientSecret.trim() !== '') {
            try {
                const paypal = require('@paypal/paypal-server-sdk');
                const environment = this.configService.paypalMode === 'live'
                    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
                    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
                this.paypal = new paypal.core.PayPalHttpClient(environment);
                this.isEnabled = true;
                this.logger.log('PayPal service initialized successfully');
            }
            catch (error) {
                this.logger.warn('Failed to initialize PayPal service:', error.message);
                this.isEnabled = false;
            }
        }
        else {
            this.logger.warn('PayPal credentials not provided, PayPal service will be disabled');
            this.isEnabled = false;
        }
    }
    checkPayPalEnabled() {
        if (!this.isEnabled || !this.paypal) {
            throw new common_1.BadRequestException('PayPal service is not configured or disabled');
        }
    }
    async createPaymentIntent(amount, currency, metadata) {
        this.checkPayPalEnabled();
        try {
            const request = new (require('@paypal/paypal-server-sdk').orders.OrdersCreateRequest)();
            request.prefer('return=representation');
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: currency.toUpperCase(),
                            value: (amount / 100).toFixed(2),
                        },
                        custom_id: metadata?.walletId || 'wallet_deposit',
                    },
                ],
            });
            const order = await this.paypal.execute(request);
            return {
                id: order.result.id,
                amount,
                currency,
                status: order.result.status,
                metadata: {
                    ...metadata,
                    paypalOrderId: order.result.id,
                },
            };
        }
        catch (error) {
            this.logger.error('Error creating PayPal order:', error);
            throw new common_1.BadRequestException('Failed to create payment intent');
        }
    }
    async confirmPayment(paymentIntentId, paymentMethodId) {
        this.checkPayPalEnabled();
        try {
            const request = new (require('@paypal/paypal-server-sdk').orders.OrdersCaptureRequest)(paymentIntentId);
            request.requestBody({});
            const capture = await this.paypal.execute(request);
            return {
                id: capture.result.id,
                amount: Math.round(parseFloat(capture.result.purchase_units[0].amount.value) * 100),
                currency: capture.result.purchase_units[0].amount.currency_code,
                status: capture.result.status,
                metadata: {
                    paypalOrderId: paymentIntentId,
                    paypalCaptureId: capture.result.id,
                },
            };
        }
        catch (error) {
            this.logger.error('Error capturing PayPal payment:', error);
            throw new common_1.BadRequestException('Failed to confirm payment');
        }
    }
    async refundPayment(paymentIntentId, amount) {
        this.checkPayPalEnabled();
        try {
            const request = new (require('@paypal/paypal-server-sdk').payments.CapturesRefundRequest)(paymentIntentId);
            if (amount) {
                request.requestBody({
                    amount: {
                        value: (amount / 100).toFixed(2),
                        currency_code: 'USD',
                    },
                });
            }
            const refund = await this.paypal.execute(request);
            return {
                id: refund.result.id,
                amount: amount || 0,
                currency: 'USD',
                status: refund.result.status,
                metadata: {
                    paypalRefundId: refund.result.id,
                    originalPaymentId: paymentIntentId,
                },
            };
        }
        catch (error) {
            this.logger.error('Error refunding PayPal payment:', error);
            throw new common_1.BadRequestException('Failed to refund payment');
        }
    }
    async getPaymentIntent(paymentIntentId) {
        this.checkPayPalEnabled();
        try {
            const request = new (require('@paypal/paypal-server-sdk').orders.OrdersGetRequest)(paymentIntentId);
            const order = await this.paypal.execute(request);
            return {
                id: order.result.id,
                amount: Math.round(parseFloat(order.result.purchase_units[0].amount.value) * 100),
                currency: order.result.purchase_units[0].amount.currency_code,
                status: order.result.status,
                metadata: {
                    paypalOrderId: order.result.id,
                },
            };
        }
        catch (error) {
            this.logger.error('Error retrieving PayPal order:', error);
            throw new common_1.BadRequestException('Failed to retrieve payment intent');
        }
    }
    async createPayout(amount, currency, destination, metadata) {
        this.checkPayPalEnabled();
        try {
            const request = new (require('@paypal/paypal-server-sdk').payouts.PayoutsPostRequest)();
            request.requestBody({
                sender_batch_header: {
                    sender_batch_id: `batch_${Date.now()}`,
                    email_subject: 'You have a payout!',
                },
                items: [
                    {
                        recipient_type: 'EMAIL',
                        amount: {
                            value: (amount / 100).toFixed(2),
                            currency: currency.toUpperCase(),
                        },
                        receiver: destination,
                        note: metadata?.description || 'Withdrawal from wallet',
                        sender_item_id: `item_${Date.now()}`,
                    },
                ],
            });
            const payout = await this.paypal.execute(request);
            return {
                id: payout.result.batch_header.payout_batch_id,
                amount,
                currency,
                status: payout.result.batch_header.batch_status,
                destination,
                metadata: {
                    ...metadata,
                    paypalPayoutBatchId: payout.result.batch_header.payout_batch_id,
                },
            };
        }
        catch (error) {
            this.logger.error('Error creating PayPal payout:', error);
            throw new common_1.BadRequestException('Failed to create payout');
        }
    }
    async handleWebhook(event) {
        try {
            switch (event.type) {
                case 'PAYMENT.CAPTURE.COMPLETED':
                    await this.handlePaymentCompleted(event.data);
                    break;
                case 'PAYMENT.CAPTURE.DENIED':
                    await this.handlePaymentDenied(event.data);
                    break;
                case 'PAYOUTS-ITEM.SUCCEEDED':
                    await this.handlePayoutSucceeded(event.data);
                    break;
                case 'PAYOUTS-ITEM.FAILED':
                    await this.handlePayoutFailed(event.data);
                    break;
                default:
                    this.logger.log(`Unhandled PayPal event type: ${event.type}`);
            }
        }
        catch (error) {
            this.logger.error('Error handling PayPal webhook:', error);
            throw error;
        }
    }
    async handlePaymentCompleted(data) {
        this.logger.log(`PayPal payment completed: ${data.id}`);
    }
    async handlePaymentDenied(data) {
        this.logger.log(`PayPal payment denied: ${data.id}`);
    }
    async handlePayoutSucceeded(data) {
        this.logger.log(`PayPal payout succeeded: ${data.payout_item_id}`);
    }
    async handlePayoutFailed(data) {
        this.logger.log(`PayPal payout failed: ${data.payout_item_id}`);
    }
    async createPaymentMethod(paymentMethodData) {
        throw new common_1.BadRequestException('PayPal payment methods are handled differently');
    }
    async getAccessToken() {
        this.checkPayPalEnabled();
        try {
            const request = new (require('@paypal/paypal-server-sdk').core.GenerateAccessTokenRequest)();
            const response = await this.paypal.execute(request);
            return response.result.access_token;
        }
        catch (error) {
            this.logger.error('Error getting PayPal access token:', error);
            throw new common_1.BadRequestException('Failed to get access token');
        }
    }
    async verifyWebhookSignature(body, headers, webhookId) {
        this.checkPayPalEnabled();
        try {
            const request = new (require('@paypal/paypal-server-sdk').notifications.WebhooksVerifySignatureRequest)();
            request.requestBody({
                auth_algo: headers['paypal-auth-algo'],
                cert_url: headers['paypal-cert-url'],
                transmission_id: headers['paypal-transmission-id'],
                transmission_sig: headers['paypal-transmission-sig'],
                transmission_time: headers['paypal-transmission-time'],
                webhook_id: webhookId,
                webhook_event: JSON.parse(body),
            });
            const response = await this.paypal.execute(request);
            return response.result.verification_status === 'SUCCESS';
        }
        catch (error) {
            this.logger.error('Error verifying PayPal webhook signature:', error);
            return false;
        }
    }
    isPayPalEnabled() {
        return this.isEnabled;
    }
};
exports.PaypalService = PaypalService;
exports.PaypalService = PaypalService = PaypalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], PaypalService);
//# sourceMappingURL=paypal.service.js.map