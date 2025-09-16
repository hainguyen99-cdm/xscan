import { Document } from 'mongoose';
export type NotificationPreferencesDocument = NotificationPreferences & Document;
export declare class NotificationPreferences {
    userId: string;
    email: boolean;
    inApp: boolean;
    push: boolean;
    donationConfirmations: boolean;
    streamerUpdates: boolean;
    securityAlerts: boolean;
    marketing: boolean;
}
export declare const NotificationPreferencesSchema: import("mongoose").Schema<NotificationPreferences, import("mongoose").Model<NotificationPreferences, any, any, any, Document<unknown, any, NotificationPreferences, any, {}> & NotificationPreferences & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, NotificationPreferences, Document<unknown, {}, import("mongoose").FlatRecord<NotificationPreferences>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<NotificationPreferences> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
