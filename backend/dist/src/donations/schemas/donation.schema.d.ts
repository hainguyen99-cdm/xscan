import { Document, Types } from 'mongoose';
export type DonationDocument = Donation & Document;
export declare class Donation {
    donorId?: Types.ObjectId;
    streamerId: Types.ObjectId;
    donationLinkId: Types.ObjectId;
    amount: number;
    currency: string;
    message?: string;
    isAnonymous: boolean;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    paymentMethod: 'wallet' | 'stripe' | 'paypal' | 'bank_transfer';
    transactionId?: string;
    paymentIntentId?: string;
    processingFee: number;
    netAmount: number;
    failureReason?: string;
    completedAt?: Date;
    failedAt?: Date;
    isRefunded: boolean;
    refundedAt?: Date;
    refundReason?: string;
    metadata?: Record<string, any>;
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const DonationSchema: import("mongoose").Schema<Donation, import("mongoose").Model<Donation, any, any, any, Document<unknown, any, Donation, any, {}> & Donation & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Donation, Document<unknown, {}, import("mongoose").FlatRecord<Donation>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Donation> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
