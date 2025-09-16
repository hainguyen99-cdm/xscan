import { Document, Types } from 'mongoose';
export type BankTransactionDocument = BankTransaction & Document;
export declare class BankTransaction {
    streamerId: Types.ObjectId;
    reference: string;
    description?: string;
    amount: number;
    currency: string;
    transactionDate?: Date;
    raw?: Record<string, unknown>;
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const BankTransactionSchema: import("mongoose").Schema<BankTransaction, import("mongoose").Model<BankTransaction, any, any, any, Document<unknown, any, BankTransaction, any, {}> & BankTransaction & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BankTransaction, Document<unknown, {}, import("mongoose").FlatRecord<BankTransaction>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<BankTransaction> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
