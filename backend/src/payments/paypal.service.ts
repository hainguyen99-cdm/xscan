import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import {
  PaymentGatewayInterface,
  PaymentIntent,
  PaymentMethod,
  PaymentWebhookData,
  PaymentWebhookHandler,
} from './interfaces/payment-gateway.interface';

@Injectable()
export class PaypalService
  implements PaymentGatewayInterface, PaymentWebhookHandler
{
  private readonly logger = new Logger(PaypalService.name);
  private paypal: any = null;
  private isEnabled: boolean = false;

  constructor(private configService: ConfigService) {
    this.initializePayPal();
  }

  private initializePayPal(): void {
    const clientId = this.configService.paypalClientId;
    const clientSecret = this.configService.paypalClientSecret;

    if (
      clientId &&
      clientSecret &&
      clientId.trim() !== '' &&
      clientSecret.trim() !== ''
    ) {
      try {
        // Initialize PayPal SDK
        const paypal = require('@paypal/paypal-server-sdk');

        const environment =
          this.configService.paypalMode === 'live'
            ? new paypal.core.LiveEnvironment(clientId, clientSecret)
            : new paypal.core.SandboxEnvironment(clientId, clientSecret);

        this.paypal = new paypal.core.PayPalHttpClient(environment);
        this.isEnabled = true;
        this.logger.log('PayPal service initialized successfully');
      } catch (error) {
        this.logger.warn('Failed to initialize PayPal service:', error.message);
        this.isEnabled = false;
      }
    } else {
      this.logger.warn(
        'PayPal credentials not provided, PayPal service will be disabled',
      );
      this.isEnabled = false;
    }
  }

  private checkPayPalEnabled(): void {
    if (!this.isEnabled || !this.paypal) {
      throw new BadRequestException(
        'PayPal service is not configured or disabled',
      );
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentIntent> {
    this.checkPayPalEnabled();
    try {
      const request =
        new (require('@paypal/paypal-server-sdk').orders.OrdersCreateRequest)();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency.toUpperCase(),
              value: (amount / 100).toFixed(2), // Convert cents to dollars
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
    } catch (error) {
      this.logger.error('Error creating PayPal order:', error);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async confirmPayment(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<PaymentIntent> {
    this.checkPayPalEnabled();
    try {
      const request =
        new (require('@paypal/paypal-server-sdk').orders.OrdersCaptureRequest)(
          paymentIntentId,
        );
      request.requestBody({});

      const capture = await this.paypal.execute(request);

      return {
        id: capture.result.id,
        amount: Math.round(
          parseFloat(capture.result.purchase_units[0].amount.value) * 100,
        ), // Convert to cents
        currency: capture.result.purchase_units[0].amount.currency_code,
        status: capture.result.status,
        metadata: {
          paypalOrderId: paymentIntentId,
          paypalCaptureId: capture.result.id,
        },
      };
    } catch (error) {
      this.logger.error('Error capturing PayPal payment:', error);
      throw new BadRequestException('Failed to confirm payment');
    }
  }

  async refundPayment(
    paymentIntentId: string,
    amount?: number,
  ): Promise<PaymentIntent> {
    this.checkPayPalEnabled();
    try {
      const request =
        new (require('@paypal/paypal-server-sdk').payments.CapturesRefundRequest)(
          paymentIntentId,
        );

      if (amount) {
        request.requestBody({
          amount: {
            value: (amount / 100).toFixed(2),
            currency_code: 'USD', // You might want to get this from the original payment
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
    } catch (error) {
      this.logger.error('Error refunding PayPal payment:', error);
      throw new BadRequestException('Failed to refund payment');
    }
  }

  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    this.checkPayPalEnabled();
    try {
      const request =
        new (require('@paypal/paypal-server-sdk').orders.OrdersGetRequest)(
          paymentIntentId,
        );
      const order = await this.paypal.execute(request);

      return {
        id: order.result.id,
        amount: Math.round(
          parseFloat(order.result.purchase_units[0].amount.value) * 100,
        ),
        currency: order.result.purchase_units[0].amount.currency_code,
        status: order.result.status,
        metadata: {
          paypalOrderId: order.result.id,
        },
      };
    } catch (error) {
      this.logger.error('Error retrieving PayPal order:', error);
      throw new BadRequestException('Failed to retrieve payment intent');
    }
  }

  async createPayout(
    amount: number,
    currency: string,
    destination: string,
    metadata?: Record<string, any>,
  ): Promise<any> {
    this.checkPayPalEnabled();
    try {
      const request =
        new (require('@paypal/paypal-server-sdk').payouts.PayoutsPostRequest)();
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
    } catch (error) {
      this.logger.error('Error creating PayPal payout:', error);
      throw new BadRequestException('Failed to create payout');
    }
  }

  async handleWebhook(event: PaymentWebhookData): Promise<void> {
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
    } catch (error) {
      this.logger.error('Error handling PayPal webhook:', error);
      throw error;
    }
  }

  private async handlePaymentCompleted(data: any): Promise<void> {
    this.logger.log(`PayPal payment completed: ${data.id}`);
    // TODO: Update wallet balance and transaction status
  }

  private async handlePaymentDenied(data: any): Promise<void> {
    this.logger.log(`PayPal payment denied: ${data.id}`);
    // TODO: Update transaction status and notify user
  }

  private async handlePayoutSucceeded(data: any): Promise<void> {
    this.logger.log(`PayPal payout succeeded: ${data.payout_item_id}`);
    // TODO: Update withdrawal status
  }

  private async handlePayoutFailed(data: any): Promise<void> {
    this.logger.log(`PayPal payout failed: ${data.payout_item_id}`);
    // TODO: Update withdrawal status and notify user
  }

  async createPaymentMethod(paymentMethodData: any): Promise<PaymentMethod> {
    // PayPal doesn't have the same concept of payment methods as Stripe
    // This would typically involve creating a PayPal account or using saved payment methods
    throw new BadRequestException(
      'PayPal payment methods are handled differently',
    );
  }

  async getAccessToken(): Promise<string> {
    this.checkPayPalEnabled();
    try {
      const request =
        new (require('@paypal/paypal-server-sdk').core.GenerateAccessTokenRequest)();
      const response = await this.paypal.execute(request);
      return response.result.access_token;
    } catch (error) {
      this.logger.error('Error getting PayPal access token:', error);
      throw new BadRequestException('Failed to get access token');
    }
  }

  async verifyWebhookSignature(
    body: string,
    headers: Record<string, string>,
    webhookId: string,
  ): Promise<boolean> {
    this.checkPayPalEnabled();
    try {
      const request =
        new (require('@paypal/paypal-server-sdk').notifications.WebhooksVerifySignatureRequest)();
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
    } catch (error) {
      this.logger.error('Error verifying PayPal webhook signature:', error);
      return false;
    }
  }

  // Add a method to check if PayPal is enabled
  isPayPalEnabled(): boolean {
    return this.isEnabled;
  }
}
