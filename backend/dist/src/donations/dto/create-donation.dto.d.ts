export declare class CreateDonationDto {
    donorId?: string;
    streamerId: string;
    donationLinkId: string;
    amount: number;
    currency: string;
    message?: string;
    isAnonymous?: boolean;
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    paymentMethod?: 'wallet' | 'stripe' | 'paypal' | 'bank_transfer';
    transactionId?: string;
    paymentIntentId?: string;
    processingFee?: number;
    netAmount?: number;
    metadata?: Record<string, any>;
}
