import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService, PaymentProvider } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { Request } from 'express';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('stripe/payment-intent')
  @ApiOperation({ summary: 'Create a Stripe payment intent' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createStripePaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    return await this.paymentsService.createPaymentIntent(
      PaymentProvider.STRIPE,
      createPaymentIntentDto,
    );
  }

  @Post('paypal/payment-intent')
  @ApiOperation({ summary: 'Create a PayPal payment intent' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPayPalPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    return await this.paymentsService.createPaymentIntent(
      PaymentProvider.PAYPAL,
      createPaymentIntentDto,
    );
  }

  @Post('stripe/confirm')
  @ApiOperation({ summary: 'Confirm a Stripe payment' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async confirmStripePayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
    return await this.paymentsService.confirmPayment(
      PaymentProvider.STRIPE,
      confirmPaymentDto,
    );
  }

  @Post('paypal/confirm')
  @ApiOperation({ summary: 'Confirm a PayPal payment' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async confirmPayPalPayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
    return await this.paymentsService.confirmPayment(
      PaymentProvider.PAYPAL,
      confirmPaymentDto,
    );
  }

  @Post('stripe/refund/:paymentIntentId')
  @ApiOperation({ summary: 'Refund a Stripe payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async refundStripePayment(
    @Param('paymentIntentId') paymentIntentId: string,
    @Body() body: { amount?: number },
  ) {
    return await this.paymentsService.refundPayment(
      PaymentProvider.STRIPE,
      paymentIntentId,
      body.amount,
    );
  }

  @Post('paypal/refund/:paymentIntentId')
  @ApiOperation({ summary: 'Refund a PayPal payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async refundPayPalPayment(
    @Param('paymentIntentId') paymentIntentId: string,
    @Body() body: { amount?: number },
  ) {
    return await this.paymentsService.refundPayment(
      PaymentProvider.PAYPAL,
      paymentIntentId,
      body.amount,
    );
  }

  @Get('stripe/payment-intent/:paymentIntentId')
  @ApiOperation({ summary: 'Get a Stripe payment intent' })
  @ApiResponse({
    status: 200,
    description: 'Payment intent retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment intent not found' })
  async getStripePaymentIntent(
    @Param('paymentIntentId') paymentIntentId: string,
  ) {
    return await this.paymentsService.getPaymentIntent(
      PaymentProvider.STRIPE,
      paymentIntentId,
    );
  }

  @Get('paypal/payment-intent/:paymentIntentId')
  @ApiOperation({ summary: 'Get a PayPal payment intent' })
  @ApiResponse({
    status: 200,
    description: 'Payment intent retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment intent not found' })
  async getPayPalPaymentIntent(
    @Param('paymentIntentId') paymentIntentId: string,
  ) {
    return await this.paymentsService.getPaymentIntent(
      PaymentProvider.PAYPAL,
      paymentIntentId,
    );
  }

  @Post('stripe/payout')
  @ApiOperation({ summary: 'Create a Stripe payout' })
  @ApiResponse({ status: 201, description: 'Payout created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createStripePayout(@Body() createPayoutDto: CreatePayoutDto) {
    return await this.paymentsService.createPayout(
      PaymentProvider.STRIPE,
      createPayoutDto,
    );
  }

  @Post('paypal/payout')
  @ApiOperation({ summary: 'Create a PayPal payout' })
  @ApiResponse({ status: 201, description: 'Payout created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPayPalPayout(@Body() createPayoutDto: CreatePayoutDto) {
    return await this.paymentsService.createPayout(
      PaymentProvider.PAYPAL,
      createPayoutDto,
    );
  }

  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    // In a real implementation, you would verify the webhook signature
    // const event = this.stripe.webhooks.constructEvent(request.rawBody, signature, this.configService.stripeWebhookSecret);

    // For now, we'll parse the body directly
    const event = request.body;

    await this.paymentsService.handleWebhook(PaymentProvider.STRIPE, event);
    return { received: true };
  }

  @Post('paypal/webhook')
  @ApiOperation({ summary: 'Handle PayPal webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handlePayPalWebhook(
    @Req() request: Request,
    @Headers() headers: Record<string, string>,
  ) {
    // In a real implementation, you would verify the webhook signature
    // const isValid = await this.paymentsService.verifyPayPalWebhookSignature(
    //   JSON.stringify(request.body),
    //   headers,
    //   this.configService.paypalWebhookId
    // );

    // if (!isValid) {
    //   throw new BadRequestException('Invalid webhook signature');
    // }

    const event = request.body;
    await this.paymentsService.handleWebhook(PaymentProvider.PAYPAL, event);
    return { received: true };
  }

  @Get('providers/:provider/currencies')
  @ApiOperation({ summary: 'Get supported currencies for a payment provider' })
  @ApiResponse({
    status: 200,
    description: 'Supported currencies retrieved successfully',
  })
  async getSupportedCurrencies(@Param('provider') provider: string) {
    const paymentProvider = provider.toLowerCase() as PaymentProvider;

    if (!Object.values(PaymentProvider).includes(paymentProvider)) {
      throw new BadRequestException(
        `Unsupported payment provider: ${provider}`,
      );
    }

    return {
      provider: paymentProvider,
      currencies: this.paymentsService.getSupportedCurrencies(paymentProvider),
    };
  }

  @Get('providers/:provider/fee-estimate')
  @ApiOperation({ summary: 'Get fee estimate for a payment provider' })
  @ApiResponse({
    status: 200,
    description: 'Fee estimate retrieved successfully',
  })
  async getFeeEstimate(
    @Param('provider') provider: string,
    @Body() body: { amount: number; currency: string },
  ) {
    const paymentProvider = provider.toLowerCase() as PaymentProvider;

    if (!Object.values(PaymentProvider).includes(paymentProvider)) {
      throw new BadRequestException(
        `Unsupported payment provider: ${provider}`,
      );
    }

    return await this.paymentsService.getFeeEstimate(
      paymentProvider,
      body.amount,
      body.currency,
    );
  }

  @Get('recommended-provider')
  @ApiOperation({
    summary: 'Get recommended payment provider for amount and currency',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommended provider retrieved successfully',
  })
  async getRecommendedProvider(
    @Body() body: { amount: number; currency: string },
  ) {
    return await this.paymentsService.getRecommendedProvider(
      body.amount,
      body.currency,
    );
  }

  @Post('stripe/payment-method')
  @ApiOperation({ summary: 'Create a Stripe payment method' })
  @ApiResponse({
    status: 201,
    description: 'Payment method created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createStripePaymentMethod(@Body() paymentMethodData: any) {
    return await this.paymentsService.createStripePaymentMethod(
      paymentMethodData,
    );
  }

  @Post('stripe/customer')
  @ApiOperation({ summary: 'Create a Stripe customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createStripeCustomer(@Body() body: { email: string; name?: string }) {
    const customerId = await this.paymentsService.createStripeCustomer(
      body.email,
      body.name,
    );
    return { customerId };
  }

  @Post('stripe/attach-payment-method')
  @ApiOperation({ summary: 'Attach a payment method to a Stripe customer' })
  @ApiResponse({
    status: 200,
    description: 'Payment method attached successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async attachStripePaymentMethod(
    @Body() body: { paymentMethodId: string; customerId: string },
  ) {
    await this.paymentsService.attachStripePaymentMethod(
      body.paymentMethodId,
      body.customerId,
    );
    return { success: true };
  }
}
