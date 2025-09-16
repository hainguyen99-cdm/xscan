import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DonationProcessingService } from './donation-processing.service';
import { DonationsService } from './donations.service';
import { PaymentsService } from '../payments/payments.service';
import { ConfigService } from '../config/config.service';
import { WebhookManagementService } from './webhook-management.service';
import { OBSSettingsService } from '../obs-settings/obs-settings.service';
import { createHmac } from 'crypto';
import { Types } from 'mongoose';
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

@Injectable()
export class DonationWebhookService implements WebhookHandler {
  private readonly logger = new Logger(DonationWebhookService.name);

  constructor(
    private readonly donationProcessingService: DonationProcessingService,
    private readonly donationsService: DonationsService,
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
    private readonly webhookManagementService: WebhookManagementService,
    private readonly obsSettingsService: OBSSettingsService,
    private readonly donationsGateway: DonationsGateway,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Handle incoming webhook from payment providers
   */
  async handleWebhook(
    payload: WebhookPayload,
    context?: WebhookContext,
  ): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`Processing webhook: ${payload.type} for ${payload.id}`);

    try {
      // Store webhook event
      const webhookEvent =
        await this.webhookManagementService.storeWebhookEvent({
          eventId: payload.id,
          provider: 'unknown', // Will be determined by the specific handler
          eventType: payload.type,
          status: 'processing',
          payload: payload,
          signature: payload.signature,
          signatureValid: false, // Will be validated by specific handlers
          ipAddress: context?.ipAddress,
          userAgent: context?.userAgent,
          metadata: { headers: context?.headers },
        });

      let result: any;
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

      // Update webhook event with result
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
          ? new Types.ObjectId(result.donationId)
          : undefined,
        errorMessage: result.success ? undefined : result.message,
      });

      this.logger.log(
        `Webhook processed successfully: ${payload.type} in ${processingTime}ms`,
      );
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `Failed to process webhook ${payload.type}: ${error.message}`,
      );

      // Update webhook event with error
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

  /**
   * Handle Stripe webhook
   */
  async handleStripeWebhook(
    payload: any,
    signature: string,
    context?: WebhookContext,
  ): Promise<void> {
    // Verify webhook signature
    const signatureValid = this.verifyStripeSignature(payload, signature);
    if (!signatureValid) {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    const webhookPayload: WebhookPayload = {
      id: payload.id,
      type: payload.type,
      data: payload.data,
      created: payload.created,
      signature,
    };

    // Store webhook event with Stripe provider info
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

  /**
   * Handle PayPal webhook
   */
  async handlePayPalWebhook(
    payload: any,
    signature: string,
    context?: WebhookContext,
  ): Promise<void> {
    // Verify webhook signature
    const signatureValid = this.verifyPayPalSignature(payload, signature);
    if (!signatureValid) {
      throw new BadRequestException('Invalid PayPal webhook signature');
    }

    const webhookPayload: WebhookPayload = {
      id: payload.id,
      type: payload.event_type,
      data: payload.resource,
      created: Math.floor(Date.now() / 1000),
      signature,
    };

    // Store webhook event with PayPal provider info
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

  /**
   * Handle custom donation webhook
   */
  async handleCustomDonationWebhook(
    payload: any,
    secret: string,
    context?: WebhookContext,
  ): Promise<void> {
    // Verify webhook secret
    const signatureValid = this.verifyCustomWebhookSecret(payload, secret);
    if (!signatureValid) {
      throw new BadRequestException('Invalid webhook secret');
    }

    const webhookPayload: WebhookPayload = {
      id: payload.id || Date.now().toString(),
      type: payload.type || 'donation.created',
      data: payload.data || payload,
      created: payload.created || Math.floor(Date.now() / 1000),
    };

    // Store webhook event with custom provider info
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

  /**
   * Handle payment success webhook
   */
  private async handlePaymentSuccess(payload: WebhookPayload): Promise<any> {
    const paymentIntentId = payload.data.object?.id || payload.data.id;
    if (!paymentIntentId) {
      throw new BadRequestException('Payment intent ID not found in webhook');
    }

    // Find donation by payment intent ID
    const donation =
      await this.donationsService.findDonationByPaymentIntent(paymentIntentId);
    if (!donation) {
      this.logger.warn(
        `Donation not found for payment intent: ${paymentIntentId}`,
      );
      return {
        success: false,
        message: 'Donation not found',
        donationId: null,
      };
    }

    // Confirm the payment and complete the donation
    await this.donationProcessingService.confirmExternalPayment(
      donation._id.toString(),
      paymentIntentId,
    );

    // Trigger OBS alert for the completed donation
    try {
      await this.triggerOBSDonationAlert(donation);
    } catch (error) {
      this.logger.error(`Failed to trigger OBS alert for donation ${donation._id}: ${error.message}`);
      // Don't fail the webhook if OBS alert fails
    }

    // Send general donation notification via WebSocket
    try {
      let donorName = 'Anonymous';
      if (!donation.isAnonymous && donation.donorId) {
        try {
          const donor = await this.usersService.findById(donation.donorId.toString());
          donorName = donor.username || `${donor.firstName} ${donor.lastName}`.trim() || 'Anonymous';
        } catch (error) {
          this.logger.warn(`Failed to get donor name for donation ${donation._id}: ${error.message}`);
        }
      }
      
      this.donationsGateway.sendDonationAlert(
        donation.streamerId.toString(),
        donation,
        donorName
      );
    } catch (error) {
      this.logger.error(`Failed to send general donation notification for donation ${donation._id}: ${error.message}`);
      // Don't fail the webhook if general notification fails
    }

    this.logger.log(
      `Payment confirmed and donation completed: ${donation._id}`,
    );
    return {
      success: true,
      message: 'Payment confirmed',
      donationId: donation._id.toString(),
    };
  }

  /**
   * Handle payment failure webhook
   */
  private async handlePaymentFailure(payload: WebhookPayload): Promise<any> {
    const paymentIntentId = payload.data.object?.id || payload.data.id;
    if (!paymentIntentId) {
      throw new BadRequestException('Payment intent ID not found in webhook');
    }

    // Find donation by payment intent ID
    const donation =
      await this.donationsService.findDonationByPaymentIntent(paymentIntentId);
    if (!donation) {
      this.logger.warn(
        `Donation not found for payment intent: ${paymentIntentId}`,
      );
      return {
        success: false,
        message: 'Donation not found',
        donationId: null,
      };
    }

    // Mark donation as failed
    await this.donationsService.processDonationStatusChange(
      donation._id.toString(),
      'failed',
      {
        failureReason: 'Payment failed',
        webhookData: payload.data,
      },
    );

    this.logger.log(`Payment failed for donation: ${donation._id}`);
    return {
      success: true,
      message: 'Payment failed',
      donationId: donation._id.toString(),
    };
  }

  /**
   * Handle payment refund webhook
   */
  private async handlePaymentRefund(payload: WebhookPayload): Promise<any> {
    const paymentIntentId =
      payload.data.object?.payment_intent || payload.data.payment_intent;
    if (!paymentIntentId) {
      throw new BadRequestException('Payment intent ID not found in webhook');
    }

    // Find donation by payment intent ID
    const donation =
      await this.donationsService.findDonationByPaymentIntent(paymentIntentId);
    if (!donation) {
      this.logger.warn(
        `Donation not found for payment intent: ${paymentIntentId}`,
      );
      return {
        success: false,
        message: 'Donation not found',
        donationId: null,
      };
    }

    // Mark donation as refunded
    await this.donationsService.processDonationStatusChange(
      donation._id.toString(),
      'cancelled',
      {
        refundReason: 'Payment refunded',
        webhookData: payload.data,
        isRefunded: true,
        refundedAt: new Date(),
      },
    );

    this.logger.log(`Payment refunded for donation: ${donation._id}`);
    return {
      success: true,
      message: 'Payment refunded',
      donationId: donation._id.toString(),
    };
  }

  /**
   * Handle donation created webhook
   */
  private async handleDonationCreated(payload: WebhookPayload): Promise<any> {
    this.logger.log(`Donation created webhook received: ${payload.id}`);
    // This could be used for external integrations that want to be notified
    // when donations are created in the system
    return { success: true, message: 'Donation created', donationId: null };
  }

  /**
   * Handle donation completed webhook
   */
  private async handleDonationCompleted(payload: WebhookPayload): Promise<any> {
    this.logger.log(`Donation completed webhook received: ${payload.id}`);
    // This could be used for external integrations that want to be notified
    // when donations are completed
    return { success: true, message: 'Donation completed', donationId: null };
  }

  /**
   * Trigger OBS donation alert
   */
  private async triggerOBSDonationAlert(donation: any): Promise<void> {
    try {
      // Get OBS settings for the streamer
      const obsSettings = await this.obsSettingsService.findByStreamerId(donation.streamerId.toString());
      
      if (!obsSettings || !obsSettings.alertToken) {
        this.logger.warn(`No OBS settings found for streamer ${donation.streamerId}`);
        return;
      }

      // Get donor information
      let donorName = 'Anonymous';
      if (!donation.isAnonymous && donation.donorId) {
        // In a real implementation, you might want to fetch user details here
        // For now, we'll use a placeholder
        donorName = 'Donor';
      }

      // Prepare donation alert data
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

      // Trigger the OBS alert
      await this.obsSettingsService.triggerDonationAlert(
        obsSettings.alertToken,
        donationAlertData
      );

      this.logger.log(`OBS donation alert triggered for donation ${donation._id}`);
    } catch (error) {
      this.logger.error(`Failed to trigger OBS donation alert: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  private verifyStripeSignature(payload: any, signature: string): boolean {
    try {
      const stripeSecret = this.configService.stripeWebhookSecret;
      if (!stripeSecret) {
        this.logger.warn('STRIPE_WEBHOOK_SECRET not configured');
        return false;
      }

      const timestamp = signature.split(',')[0].split('=')[1];
      const signedPayload = `${timestamp}.${JSON.stringify(payload)}`;
      const expectedSignature = createHmac('sha256', stripeSecret)
        .update(signedPayload, 'utf8')
        .digest('hex');

      const receivedSignature = signature.split(',')[1].split('=')[1];
      return expectedSignature === receivedSignature;
    } catch (error) {
      this.logger.error(`Failed to verify Stripe signature: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify PayPal webhook signature
   */
  private verifyPayPalSignature(payload: any, signature: string): boolean {
    try {
      const paypalSecret = this.configService.paypalClientSecret;
      if (!paypalSecret) {
        this.logger.warn('PAYPAL_CLIENT_SECRET not configured');
        return false;
      }

      // PayPal webhook verification is more complex and typically involves
      // making a request to PayPal's verification endpoint
      // For now, we'll do basic validation
      return signature && signature.length > 0;
    } catch (error) {
      this.logger.error(`Failed to verify PayPal signature: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify custom webhook secret
   */
  private verifyCustomWebhookSecret(payload: any, secret: string): boolean {
    try {
      // For now, we'll use a simple secret check
      // In production, you might want to store this in environment variables
      const expectedSecret = 'custom-webhook-secret-2024';
      if (!expectedSecret) {
        this.logger.warn('CUSTOM_WEBHOOK_SECRET not configured');
        return false;
      }

      return secret === expectedSecret;
    } catch (error) {
      this.logger.error(
        `Failed to verify custom webhook secret: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Register webhook endpoint with payment providers
   */
  async registerWebhookEndpoints(): Promise<void> {
    try {
      // Register with Stripe
      const stripeWebhookUrl = `${this.configService.frontendUrl}/api/donations/webhooks/stripe`;
      this.logger.log(`Stripe webhook endpoint: ${stripeWebhookUrl}`);

      // Register with PayPal
      const paypalWebhookUrl = `${this.configService.frontendUrl}/api/donations/webhooks/paypal`;
      this.logger.log(`PayPal webhook endpoint: ${paypalWebhookUrl}`);

      // Register custom webhook endpoints
      const customWebhookUrl = `${this.configService.frontendUrl}/api/donations/webhooks/custom`;
      this.logger.log(`Custom webhook endpoint: ${customWebhookUrl}`);
    } catch (error) {
      this.logger.error(
        `Failed to register webhook endpoints: ${error.message}`,
      );
    }
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(): Promise<any> {
    // This could return statistics about webhook processing
    // such as success/failure rates, processing times, etc.
    return {
      totalWebhooks: 0,
      successfulWebhooks: 0,
      failedWebhooks: 0,
      averageProcessingTime: 0,
    };
  }

  /**
   * Process donation completed webhook
   */
  async processDonationCompletedWebhook(
    signature: string,
    webhookData: any,
    context?: WebhookContext,
  ): Promise<void> {
    await this.handleCustomDonationWebhook(webhookData, signature, context);
  }

  /**
   * Process donation started webhook
   */
  async processDonationStartedWebhook(
    signature: string,
    webhookData: any,
    context?: WebhookContext,
  ): Promise<void> {
    await this.handleCustomDonationWebhook(webhookData, signature, context);
  }

  /**
   * Process QR code scanned webhook
   */
  async processQRScannedWebhook(
    signature: string,
    webhookData: any,
    context?: WebhookContext,
  ): Promise<void> {
    await this.handleCustomDonationWebhook(webhookData, signature, context);
  }

  /**
   * Process social media share webhook
   */
  async processSocialShareWebhook(
    signature: string,
    webhookData: any,
    context?: WebhookContext,
  ): Promise<void> {
    await this.handleCustomDonationWebhook(webhookData, signature, context);
  }

  /**
   * Process link click webhook
   */
  async processLinkClickWebhook(
    signature: string,
    webhookData: any,
    context?: WebhookContext,
  ): Promise<void> {
    await this.handleCustomDonationWebhook(webhookData, signature, context);
  }
}
