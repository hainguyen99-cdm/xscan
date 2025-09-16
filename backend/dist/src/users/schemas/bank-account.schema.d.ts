import { Document, Types } from 'mongoose';
export type BankAccountDocument = BankAccount & Document;
export declare class BankAccount {
    userId: Types.ObjectId;
    bankName: string;
    accountName: string;
    accountNumber: string;
    bankCode?: string;
    bankShortName?: string;
    bin?: string;
    logo?: string;
    isActive: boolean;
    isDefault: boolean;
    lastUsedAt?: Date;
}
export declare const BankAccountSchema: import("mongoose").Schema<BankAccount, import("mongoose").Model<BankAccount, any, any, any, Document<unknown, any, BankAccount, any, {}> & BankAccount & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BankAccount, Document<unknown, {}, import("mongoose").FlatRecord<BankAccount>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<BankAccount> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
