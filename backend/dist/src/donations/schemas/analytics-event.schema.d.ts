import { Document, Types } from 'mongoose';
export type AnalyticsEventDocument = AnalyticsEvent & Document;
export declare class AnalyticsEvent {
    donationLinkId: Types.ObjectId;
    eventType: string;
    metadata?: {
        userAgent?: string;
        ipAddress?: string;
        referrer?: string;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
        deviceType?: string;
        browser?: string;
        os?: string;
        country?: string;
        city?: string;
        donationAmount?: number;
        currency?: string;
        isAnonymous?: boolean;
        socialPlatform?: string;
        [key: string]: any;
    };
    sessionId?: string;
    visitorId?: string;
    timestamp: Date;
    isProcessed: boolean;
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AnalyticsEventSchema: import("mongoose").Schema<AnalyticsEvent, import("mongoose").Model<AnalyticsEvent, any, any, any, Document<unknown, any, AnalyticsEvent, any, {}> & AnalyticsEvent & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AnalyticsEvent, Document<unknown, {}, import("mongoose").FlatRecord<AnalyticsEvent>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AnalyticsEvent> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
