import { Document, Types } from 'mongoose';
export type WalletDocument = Wallet & Document;
export declare class Wallet {
    userId: Types.ObjectId;
    balance: number;
    currency: string;
    transactionHistory: Types.ObjectId[];
    isActive: boolean;
    lastTransactionAt?: Date;
    totalDeposits: number;
    totalWithdrawals: number;
    totalFees: number;
    totalTransfers: number;
    totalDonations: number;
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WalletSchema: import("mongoose").Schema<Wallet, import("mongoose").Model<Wallet, any, any, any, Document<unknown, any, Wallet, any, {}> & Wallet & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Wallet, Document<unknown, {}, import("mongoose").FlatRecord<Wallet>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Wallet> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
