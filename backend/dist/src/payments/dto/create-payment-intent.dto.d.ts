export declare class CreatePaymentIntentDto {
    amount: number;
    currency: string;
    paymentMethodId?: string;
    metadata?: Record<string, any>;
    description?: string;
}
