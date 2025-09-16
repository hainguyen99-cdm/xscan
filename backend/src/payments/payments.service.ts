import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PaypalService } from './paypal.service';
import {
  PaymentGatewayInterface,
  PaymentIntent,
  PaymentMethod,
  PaymentWebhookData,
} from './interfaces/payment-gateway.interface';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreatePayoutDto } from './dto/create-payout.dto';

export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly paypalService: PaypalService,
  ) {}

  private getPaymentGateway(
    provider: PaymentProvider,
  ): PaymentGatewayInterface {
    switch (provider) {
      case PaymentProvider.STRIPE:
        if (!this.stripeService.isStripeEnabled()) {
          throw new BadRequestException(
            'Stripe service is not configured or disabled. Please configure STRIPE_SECRET_KEY in your environment variables.',
          );
        }
        return this.stripeService;
      case PaymentProvider.PAYPAL:
        if (!this.paypalService.isPayPalEnabled()) {
          throw new BadRequestException(
            'PayPal service is not configured or disabled. Please configure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your environment variables.',
          );
        }
        return this.paypalService;
      default:
        throw new BadRequestException(
          `Unsupported payment provider: ${provider}`,
        );
    }
  }

  async createPaymentIntent(
    provider: PaymentProvider,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<PaymentIntent> {
    this.logger.log(
      `Creating payment intent with ${provider} for amount: ${createPaymentIntentDto.amount}`,
    );

    const gateway = this.getPaymentGateway(provider);
    return await gateway.createPaymentIntent(
      createPaymentIntentDto.amount,
      createPaymentIntentDto.currency,
      createPaymentIntentDto.metadata,
    );
  }

  async confirmPayment(
    provider: PaymentProvider,
    confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<PaymentIntent> {
    this.logger.log(
      `Confirming payment with ${provider}: ${confirmPaymentDto.paymentIntentId}`,
    );

    const gateway = this.getPaymentGateway(provider);
    return await gateway.confirmPayment(
      confirmPaymentDto.paymentIntentId,
      confirmPaymentDto.paymentMethodId,
    );
  }

  async refundPayment(
    provider: PaymentProvider,
    paymentIntentId: string,
    amount?: number,
  ): Promise<PaymentIntent> {
    this.logger.log(`Refunding payment with ${provider}: ${paymentIntentId}`);

    const gateway = this.getPaymentGateway(provider);
    return await gateway.refundPayment(paymentIntentId, amount);
  }

  async getPaymentIntent(
    provider: PaymentProvider,
    paymentIntentId: string,
  ): Promise<PaymentIntent> {
    this.logger.log(
      `Getting payment intent with ${provider}: ${paymentIntentId}`,
    );

    const gateway = this.getPaymentGateway(provider);
    return await gateway.getPaymentIntent(paymentIntentId);
  }

  async createPayout(
    provider: PaymentProvider,
    createPayoutDto: CreatePayoutDto,
  ): Promise<any> {
    this.logger.log(
      `Creating payout with ${provider} for amount: ${createPayoutDto.amount}`,
    );

    const gateway = this.getPaymentGateway(provider);
    return await gateway.createPayout(
      createPayoutDto.amount,
      createPayoutDto.currency,
      createPayoutDto.destination,
      createPayoutDto.metadata,
    );
  }

  async handleWebhook(
    provider: PaymentProvider,
    event: PaymentWebhookData,
  ): Promise<void> {
    this.logger.log(`Handling webhook from ${provider}: ${event.type}`);

    switch (provider) {
      case PaymentProvider.STRIPE:
        await this.stripeService.handleWebhook(event);
        break;
      case PaymentProvider.PAYPAL:
        await this.paypalService.handleWebhook(event);
        break;
      default:
        throw new BadRequestException(
          `Unsupported payment provider: ${provider}`,
        );
    }
  }

  async createStripePaymentMethod(
    paymentMethodData: any,
  ): Promise<PaymentMethod> {
    if (!this.stripeService.isStripeEnabled()) {
      throw new BadRequestException(
        'Stripe service is not configured or disabled. Please configure STRIPE_SECRET_KEY in your environment variables.',
      );
    }
    return await this.stripeService.createPaymentMethod(paymentMethodData);
  }

  async attachStripePaymentMethod(
    paymentMethodId: string,
    customerId: string,
  ): Promise<void> {
    if (!this.stripeService.isStripeEnabled()) {
      throw new BadRequestException(
        'Stripe service is not configured or disabled. Please configure STRIPE_SECRET_KEY in your environment variables.',
      );
    }
    await this.stripeService.attachPaymentMethod(paymentMethodId, customerId);
  }

  async createStripeCustomer(email: string, name?: string): Promise<string> {
    if (!this.stripeService.isStripeEnabled()) {
      throw new BadRequestException(
        'Stripe service is not configured or disabled. Please configure STRIPE_SECRET_KEY in your environment variables.',
      );
    }
    return await this.stripeService.createCustomer(email, name);
  }

  async verifyPayPalWebhookSignature(
    body: string,
    headers: Record<string, string>,
    webhookId: string,
  ): Promise<boolean> {
    return await this.paypalService.verifyWebhookSignature(
      body,
      headers,
      webhookId,
    );
  }

  async getPayPalAccessToken(): Promise<string> {
    return await this.paypalService.getAccessToken();
  }

  // Helper method to determine the best payment provider based on amount and currency
  async getRecommendedProvider(
    amount: number,
    currency: string,
  ): Promise<PaymentProvider> {
    // This is a simple implementation - in a real application, you might want to:
    // 1. Check which providers support the currency
    // 2. Compare fees
    // 3. Check user preferences
    // 4. Consider regional availability

    const supportedCurrencies = {
      [PaymentProvider.STRIPE]: ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy'],
      [PaymentProvider.PAYPAL]: [
        'usd',
        'eur',
        'gbp',
        'cad',
        'aud',
        'jpy',
        'mxn',
        'brl',
      ],
    };

    const currencyLower = currency.toLowerCase();

    // Check if providers are enabled before recommending them
    const isStripeEnabled = this.stripeService.isStripeEnabled();
    const isPayPalEnabled = this.paypalService.isPayPalEnabled();

    if (
      supportedCurrencies[PaymentProvider.PAYPAL].includes(currencyLower) &&
      isPayPalEnabled
    ) {
      return PaymentProvider.PAYPAL;
    } else if (
      supportedCurrencies[PaymentProvider.STRIPE].includes(currencyLower) &&
      isStripeEnabled
    ) {
      return PaymentProvider.STRIPE;
    }

    // If neither provider is enabled or supports the currency, throw error
    throw new BadRequestException(
      `No payment provider available for currency: ${currency}. Both Stripe and PayPal are either disabled or don't support this currency.`,
    );
  }

  // Method to get supported currencies for each provider
  getSupportedCurrencies(provider: PaymentProvider): string[] {
    switch (provider) {
      case PaymentProvider.STRIPE:
        // Return empty array if Stripe is not enabled
        return this.stripeService.isStripeEnabled()
          ? ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy']
          : [];
      case PaymentProvider.PAYPAL:
        // Return empty array if PayPal is not enabled
        return this.paypalService.isPayPalEnabled()
          ? ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'mxn', 'brl']
          : [];
      default:
        return [];
    }
  }

  // Method to get fee information for each provider
  async getFeeEstimate(
    provider: PaymentProvider,
    amount: number,
    currency: string,
  ): Promise<{
    provider: PaymentProvider;
    amount: number;
    currency: string;
    fee: number;
    totalAmount: number;
  }> {
    // This is a simplified fee calculation - in a real application, you would:
    // 1. Call the provider's API to get accurate fee information
    // 2. Consider different fee structures (percentage + fixed, etc.)
    // 3. Account for currency conversion fees

    let fee = 0;

    switch (provider) {
      case PaymentProvider.STRIPE:
        // Stripe: 2.9% + 30 cents for US cards
        fee = Math.round(amount * 0.029 + 30);
        break;
      case PaymentProvider.PAYPAL:
        // PayPal: 2.9% + fixed fee (varies by currency)
        const fixedFee = currency.toLowerCase() === 'usd' ? 30 : 35;
        fee = Math.round(amount * 0.029 + fixedFee);
        break;
    }

    return {
      provider,
      amount,
      currency,
      fee,
      totalAmount: amount + fee,
    };
  }
}
