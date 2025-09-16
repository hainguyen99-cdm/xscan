import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '../config/config.service';
import {
  PaymentGatewayInterface,
  PaymentIntent,
  PaymentMethod,
  PaymentWebhookData,
  PaymentWebhookHandler,
} from './interfaces/payment-gateway.interface';

@Injectable()
export class StripeService
  implements PaymentGatewayInterface, PaymentWebhookHandler
{
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe | null = null;
  private isEnabled: boolean = false;

  constructor(private configService: ConfigService) {
    this.initializeStripe();
  }

  private initializeStripe(): void {
    const secretKey = this.configService.stripeSecretKey;
    if (secretKey && secretKey.trim() !== '') {
      try {
        this.stripe = new Stripe(secretKey, {
          apiVersion: '2025-07-30.basil',
        });
        this.isEnabled = true;
        this.logger.log('Stripe service initialized successfully');
      } catch (error) {
        this.logger.warn('Failed to initialize Stripe service:', error.message);
        this.isEnabled = false;
      }
    } else {
      this.logger.warn(
        'Stripe secret key not provided, Stripe service will be disabled',
      );
      this.isEnabled = false;
    }
  }

  private checkStripeEnabled(): void {
    if (!this.isEnabled || !this.stripe) {
      throw new BadRequestException(
        'Stripe service is not configured or disabled',
      );
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentIntent> {
    this.checkStripeEnabled();

    try {
      const paymentIntent = await this.stripe!.paymentIntents.create({
        amount,
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      this.logger.error('Error creating Stripe payment intent:', error);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async confirmPayment(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<PaymentIntent> {
    this.checkStripeEnabled();

    try {
      let paymentIntent: Stripe.PaymentIntent;

      if (paymentMethodId) {
        paymentIntent = await this.stripe!.paymentIntents.confirm(
          paymentIntentId,
          {
            payment_method: paymentMethodId,
          },
        );
      } else {
        paymentIntent =
          await this.stripe!.paymentIntents.retrieve(paymentIntentId);
      }

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      this.logger.error('Error confirming Stripe payment:', error);
      throw new BadRequestException('Failed to confirm payment');
    }
  }

  async refundPayment(
    paymentIntentId: string,
    amount?: number,
  ): Promise<PaymentIntent> {
    this.checkStripeEnabled();

    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundParams.amount = amount;
      }

      const refund = await this.stripe!.refunds.create(refundParams);
      const paymentIntent =
        await this.stripe!.paymentIntents.retrieve(paymentIntentId);

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      this.logger.error('Error refunding Stripe payment:', error);
      throw new BadRequestException('Failed to refund payment');
    }
  }

  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    this.checkStripeEnabled();

    try {
      const paymentIntent =
        await this.stripe!.paymentIntents.retrieve(paymentIntentId);

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      this.logger.error('Error retrieving Stripe payment intent:', error);
      throw new BadRequestException('Failed to retrieve payment intent');
    }
  }

  async createPayout(
    amount: number,
    currency: string,
    destination: string,
    metadata?: Record<string, any>,
  ): Promise<any> {
    this.checkStripeEnabled();

    try {
      const payout = await this.stripe!.transfers.create({
        amount,
        currency: currency.toLowerCase(),
        destination,
        metadata,
      });

      return {
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        status: 'pending', // Stripe transfers don't have a status property in the response
        destination: payout.destination,
        metadata: payout.metadata,
      };
    } catch (error) {
      this.logger.error('Error creating Stripe payout:', error);
      throw new BadRequestException('Failed to create payout');
    }
  }

  async handleWebhook(event: PaymentWebhookData): Promise<void> {
    this.checkStripeEnabled();

    try {
      const stripeEvent = event as Stripe.Event;

      switch (stripeEvent.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(
            stripeEvent.data.object as Stripe.PaymentIntent,
          );
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(
            stripeEvent.data.object as Stripe.PaymentIntent,
          );
          break;
        case 'transfer.created':
          await this.handleTransferCreated(
            stripeEvent.data.object as Stripe.Transfer,
          );
          break;
        default:
          this.logger.log(`Unhandled Stripe event type: ${stripeEvent.type}`);
      }
    } catch (error) {
      this.logger.error('Error handling Stripe webhook:', error);
      throw new BadRequestException('Failed to handle webhook');
    }
  }

  private async handlePaymentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
    // Implement your payment success logic here
  }

  private async handlePaymentFailed(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    this.logger.log(`Payment failed: ${paymentIntent.id}`);
    // Implement your payment failure logic here
  }

  private async handleTransferCreated(
    transfer: Stripe.Transfer,
  ): Promise<void> {
    this.logger.log(`Transfer created: ${transfer.id}`);
    // Implement your transfer success logic here
  }

  private async handleTransferFailed(transfer: Stripe.Transfer): Promise<void> {
    this.logger.log(`Transfer failed: ${transfer.id}`);
    // Implement your transfer failure logic here
  }

  async createPaymentMethod(paymentMethodData: any): Promise<PaymentMethod> {
    this.checkStripeEnabled();

    try {
      const paymentMethod =
        await this.stripe!.paymentMethods.create(paymentMethodData);

      return {
        id: paymentMethod.id,
        type: paymentMethod.type,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        expMonth: paymentMethod.card?.exp_month,
        expYear: paymentMethod.card?.exp_year,
        country: paymentMethod.card?.country,
      };
    } catch (error) {
      this.logger.error('Error creating Stripe payment method:', error);
      throw new BadRequestException('Failed to create payment method');
    }
  }

  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string,
  ): Promise<void> {
    this.checkStripeEnabled();

    try {
      await this.stripe!.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      this.logger.error('Error attaching Stripe payment method:', error);
      throw new BadRequestException('Failed to attach payment method');
    }
  }

  async createCustomer(email: string, name?: string): Promise<string> {
    this.checkStripeEnabled();

    try {
      const customer = await this.stripe!.customers.create({
        email,
        name,
      });

      return customer.id;
    } catch (error) {
      this.logger.error('Error creating Stripe customer:', error);
      throw new BadRequestException('Failed to create customer');
    }
  }

  // Add a method to check if Stripe is enabled
  isStripeEnabled(): boolean {
    return this.isEnabled;
  }
}
