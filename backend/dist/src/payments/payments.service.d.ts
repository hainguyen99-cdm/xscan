import { StripeService } from './stripe.service';
import { PaypalService } from './paypal.service';
import { PaymentIntent, PaymentMethod, PaymentWebhookData } from './interfaces/payment-gateway.interface';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreatePayoutDto } from './dto/create-payout.dto';
export declare enum PaymentProvider {
    STRIPE = "stripe",
    PAYPAL = "paypal"
}
export declare class PaymentsService {
    private readonly stripeService;
    private readonly paypalService;
    private readonly logger;
    constructor(stripeService: StripeService, paypalService: PaypalService);
    private getPaymentGateway;
    createPaymentIntent(provider: PaymentProvider, createPaymentIntentDto: CreatePaymentIntentDto): Promise<PaymentIntent>;
    confirmPayment(provider: PaymentProvider, confirmPaymentDto: ConfirmPaymentDto): Promise<PaymentIntent>;
    refundPayment(provider: PaymentProvider, paymentIntentId: string, amount?: number): Promise<PaymentIntent>;
    getPaymentIntent(provider: PaymentProvider, paymentIntentId: string): Promise<PaymentIntent>;
    createPayout(provider: PaymentProvider, createPayoutDto: CreatePayoutDto): Promise<any>;
    handleWebhook(provider: PaymentProvider, event: PaymentWebhookData): Promise<void>;
    createStripePaymentMethod(paymentMethodData: any): Promise<PaymentMethod>;
    attachStripePaymentMethod(paymentMethodId: string, customerId: string): Promise<void>;
    createStripeCustomer(email: string, name?: string): Promise<string>;
    verifyPayPalWebhookSignature(body: string, headers: Record<string, string>, webhookId: string): Promise<boolean>;
    getPayPalAccessToken(): Promise<string>;
    getRecommendedProvider(amount: number, currency: string): Promise<PaymentProvider>;
    getSupportedCurrencies(provider: PaymentProvider): string[];
    getFeeEstimate(provider: PaymentProvider, amount: number, currency: string): Promise<{
        provider: PaymentProvider;
        amount: number;
        currency: string;
        fee: number;
        totalAmount: number;
    }>;
}
