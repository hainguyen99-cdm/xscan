import { TransactionType, TransactionStatus, PaymentMethod, DisputeStatus, DisputeResolution } from '../schemas/transaction.schema';
export declare class TransactionFilterDto {
    searchTerm?: string;
    status?: TransactionStatus;
    type?: TransactionType;
    paymentMethod?: PaymentMethod;
    disputeStatus?: DisputeStatus;
    startDate?: string;
    endDate?: string;
    userId?: string;
    page?: number;
    limit?: number;
}
export declare class TransactionListResponseDto {
    transactions: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class DisputeHandlingDto {
    transactionId: string;
    resolution: DisputeResolution;
    adminNotes?: string;
    partialRefundAmount?: number;
    resolutionReason?: string;
}
export declare class ManualAdjustmentDto {
    transactionId: string;
    adjustmentAmount: number;
    adjustmentReason: string;
    adminNotes?: string;
}
export declare class TransactionActionDto {
    transactionId: string;
    action: string;
    reason?: string;
    adminNotes?: string;
}
export declare class TransactionExportDto {
    format?: 'csv' | 'pdf' | 'excel';
    filters?: TransactionFilterDto;
}
export declare class TransactionStatsDto {
    totalTransactions: number;
    totalVolume: number;
    pendingTransactions: number;
    disputedTransactions: number;
    failedTransactions: number;
    averageAmount: number;
    totalFees: number;
    volumeByType: Record<TransactionType, number>;
    countByStatus: Record<TransactionStatus, number>;
    volumeByPaymentMethod: Record<PaymentMethod, number>;
}
