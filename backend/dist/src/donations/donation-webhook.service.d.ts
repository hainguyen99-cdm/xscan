import { DonationProcessingService } from './donation-processing.service';
import { DonationsService } from './donations.service';
import { PaymentsService } from '../payments/payments.service';
import { ConfigService } from '../config/config.service';
import { WebhookManagementService } from './webhook-management.service';
import { OBSSettingsService } from '../obs-settings/obs-settings.service';
import { DonationsGateway } from '../donations/donations.gateway';
import { UsersService } from '../users/users.service';
export interface WebhookPayload {
    id: string;
    type: string;
    data: any;
    created: number;
    signature?: string;
}
export interface WebhookHandler {
    handleWebhook(payload: WebhookPayload): Promise<void>;
}
export interface WebhookContext {
    ipAddress?: string;
    userAgent?: string;
    headers?: Record<string, string>;
}
export declare class DonationWebhookService implements WebhookHandler {
    private readonly donationProcessingService;
    private readonly donationsService;
    private readonly paymentsService;
    private readonly configService;
    private readonly webhookManagementService;
    private readonly obsSettingsService;
    private readonly donationsGateway;
    private readonly usersService;
    private readonly logger;
    constructor(donationProcessingService: DonationProcessingService, donationsService: DonationsService, paymentsService: PaymentsService, configService: ConfigService, webhookManagementService: WebhookManagementService, obsSettingsService: OBSSettingsService, donationsGateway: DonationsGateway, usersService: UsersService);
    handleWebhook(payload: WebhookPayload, context?: WebhookContext): Promise<void>;
    handleStripeWebhook(payload: any, signature: string, context?: WebhookContext): Promise<void>;
    handlePayPalWebhook(payload: any, signature: string, context?: WebhookContext): Promise<void>;
    handleCustomDonationWebhook(payload: any, secret: string, context?: WebhookContext): Promise<void>;
    private handlePaymentSuccess;
    private handlePaymentFailure;
    private handlePaymentRefund;
    private handleDonationCreated;
    private handleDonationCompleted;
    private triggerOBSDonationAlert;
    private verifyStripeSignature;
    private verifyPayPalSignature;
    private verifyCustomWebhookSecret;
    registerWebhookEndpoints(): Promise<void>;
    getWebhookStats(): Promise<any>;
    processDonationCompletedWebhook(signature: string, webhookData: any, context?: WebhookContext): Promise<void>;
    processDonationStartedWebhook(signature: string, webhookData: any, context?: WebhookContext): Promise<void>;
    processQRScannedWebhook(signature: string, webhookData: any, context?: WebhookContext): Promise<void>;
    processSocialShareWebhook(signature: string, webhookData: any, context?: WebhookContext): Promise<void>;
    processLinkClickWebhook(signature: string, webhookData: any, context?: WebhookContext): Promise<void>;
}
