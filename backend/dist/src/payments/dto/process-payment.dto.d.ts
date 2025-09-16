export declare enum PaymentType {
    DEPOSIT = "deposit",
    WITHDRAWAL = "withdrawal",
    TRANSFER = "transfer"
}
export declare class ProcessPaymentDto {
    walletId: string;
    amount: number;
    currency: string;
    type: PaymentType;
    paymentMethodId?: string;
    destinationWalletId?: string;
    description?: string;
    metadata?: Record<string, any>;
}
