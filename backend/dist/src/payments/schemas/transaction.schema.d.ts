import { Document, Types } from 'mongoose';
export type TransactionDocument = Transaction & Document;
export declare enum TransactionType {
    DONATION = "donation",
    WITHDRAWAL = "withdrawal",
    REFUND = "refund",
    FEE = "fee",
    TRANSFER = "transfer"
}
export declare enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    DISPUTED = "disputed",
    CANCELLED = "cancelled",
    PROCESSING = "processing"
}
export declare enum PaymentMethod {
    STRIPE = "stripe",
    PAYPAL = "paypal",
    WALLET = "wallet",
    BANK_TRANSFER = "bank_transfer"
}
export declare enum DisputeStatus {
    OPEN = "open",
    UNDER_INVESTIGATION = "under_investigation",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
export declare enum DisputeResolution {
    REFUND = "refund",
    APPROVE = "approve",
    PARTIAL_REFUND = "partial_refund",
    INVESTIGATION = "investigation"
}
export declare class Transaction {
    userId: Types.ObjectId;
    userName: string;
    type: TransactionType;
    amount: number;
    currency: string;
    status: TransactionStatus;
    paymentMethod: PaymentMethod;
    description: string;
    transactionId?: string;
    paymentIntentId?: string;
    processingFee: number;
    feeAmount: number;
    netAmount: number;
    failureReason?: string;
    completedAt?: Date;
    failedAt?: Date;
    cancelledAt?: Date;
    disputedAt?: Date;
    resolvedAt?: Date;
    disputeReason?: string;
    disputeStatus?: DisputeStatus;
    disputeResolution?: DisputeResolution;
    adminNotes?: string;
    adminId?: string;
    adminActionAt?: Date;
    manualAdjustment?: number;
    adjustmentReason?: string;
    adjustmentAdminId?: string;
    adjustmentAt?: Date;
    bankAccount?: {
        last4: string;
        bankName: string;
        accountType: string;
    };
    verificationStatus?: string;
    kycStatus?: string;
    refundAmount?: number;
    metadata?: Record<string, any>;
    relatedTransactionId?: Types.ObjectId;
    donationId?: Types.ObjectId;
    recipientId?: Types.ObjectId;
    recipientName?: string;
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TransactionSchema: import("mongoose").Schema<Transaction, import("mongoose").Model<Transaction, any, any, any, Document<unknown, any, Transaction, any, {}> & Transaction & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Transaction, Document<unknown, {}, import("mongoose").FlatRecord<Transaction>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Transaction> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
