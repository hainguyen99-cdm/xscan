import { Document, Types } from 'mongoose';
export type DonationLinkDocument = DonationLink & Document;
export declare class DonationLink {
    streamerId: Types.ObjectId;
    slug: string;
    title: string;
    description?: string;
    customUrl: string;
    qrCodeUrl: string;
    isActive: boolean;
    allowAnonymous: boolean;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        backgroundColor: string;
        textColor: string;
    };
    totalDonations: number;
    totalAmount: number;
    currency: string;
    pageViews: number;
    socialMediaLinks: string[];
    isFeatured: boolean;
    isDefault: boolean;
    lastDonationAt?: Date;
    expiresAt?: Date;
    isExpired: boolean;
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const DonationLinkSchema: import("mongoose").Schema<DonationLink, import("mongoose").Model<DonationLink, any, any, any, Document<unknown, any, DonationLink, any, {}> & DonationLink & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DonationLink, Document<unknown, {}, import("mongoose").FlatRecord<DonationLink>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<DonationLink> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
