import { Document } from 'mongoose';
export type NotificationDocument = Notification & Document;
export declare class Notification {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    isRead: boolean;
    isEmailSent: boolean;
    isPushSent: boolean;
    readAt?: Date;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification, any, {}> & Notification & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Notification> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
