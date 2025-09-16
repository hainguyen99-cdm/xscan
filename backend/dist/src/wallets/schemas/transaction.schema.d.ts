import { Document, Types } from 'mongoose';
export type TransactionDocument = Transaction & Document;
export declare enum TransactionType {
    DEPOSIT = "deposit",
    WITHDRAWAL = "withdrawal",
    TRANSFER = "transfer",
    FEE = "fee",
    REFUND = "refund",
    DONATION = "donation"
}
export declare enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare class Transaction {
    walletId: Types.ObjectId;
    type: TransactionType;
    amount: number;
    currency: string;
    status: TransactionStatus;
    description?: string;
    reference?: string;
    fee?: number;
    relatedWalletId?: Types.ObjectId;
    metadata?: Record<string, any>;
    processedAt?: Date;
    failureReason?: string;
    paymentProvider?: string;
    paymentIntentId?: string;
    payoutId?: string;
    destination?: string;
    feeType?: string;
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
