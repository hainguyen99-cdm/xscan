import { ConfigService } from '../config/config.service';
import { PaymentGatewayInterface, PaymentIntent, PaymentMethod, PaymentWebhookData, PaymentWebhookHandler } from './interfaces/payment-gateway.interface';
export declare class StripeService implements PaymentGatewayInterface, PaymentWebhookHandler {
    private configService;
    private readonly logger;
    private stripe;
    private isEnabled;
    constructor(configService: ConfigService);
    private initializeStripe;
    private checkStripeEnabled;
    createPaymentIntent(amount: number, currency: string, metadata?: Record<string, any>): Promise<PaymentIntent>;
    confirmPayment(paymentIntentId: string, paymentMethodId?: string): Promise<PaymentIntent>;
    refundPayment(paymentIntentId: string, amount?: number): Promise<PaymentIntent>;
    getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent>;
    createPayout(amount: number, currency: string, destination: string, metadata?: Record<string, any>): Promise<any>;
    handleWebhook(event: PaymentWebhookData): Promise<void>;
    private handlePaymentSucceeded;
    private handlePaymentFailed;
    private handleTransferCreated;
    private handleTransferFailed;
    createPaymentMethod(paymentMethodData: any): Promise<PaymentMethod>;
    attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<void>;
    createCustomer(email: string, name?: string): Promise<string>;
    isStripeEnabled(): boolean;
}
