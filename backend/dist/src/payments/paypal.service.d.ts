import { ConfigService } from '../config/config.service';
import { PaymentGatewayInterface, PaymentIntent, PaymentMethod, PaymentWebhookData, PaymentWebhookHandler } from './interfaces/payment-gateway.interface';
export declare class PaypalService implements PaymentGatewayInterface, PaymentWebhookHandler {
    private configService;
    private readonly logger;
    private paypal;
    private isEnabled;
    constructor(configService: ConfigService);
    private initializePayPal;
    private checkPayPalEnabled;
    createPaymentIntent(amount: number, currency: string, metadata?: Record<string, any>): Promise<PaymentIntent>;
    confirmPayment(paymentIntentId: string, paymentMethodId?: string): Promise<PaymentIntent>;
    refundPayment(paymentIntentId: string, amount?: number): Promise<PaymentIntent>;
    getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent>;
    createPayout(amount: number, currency: string, destination: string, metadata?: Record<string, any>): Promise<any>;
    handleWebhook(event: PaymentWebhookData): Promise<void>;
    private handlePaymentCompleted;
    private handlePaymentDenied;
    private handlePayoutSucceeded;
    private handlePayoutFailed;
    createPaymentMethod(paymentMethodData: any): Promise<PaymentMethod>;
    getAccessToken(): Promise<string>;
    verifyWebhookSignature(body: string, headers: Record<string, string>, webhookId: string): Promise<boolean>;
    isPayPalEnabled(): boolean;
}
