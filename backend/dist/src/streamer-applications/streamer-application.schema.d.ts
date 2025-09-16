import { Document } from 'mongoose';
export type StreamerApplicationDocument = StreamerApplication & Document;
export type StreamerApplicationStatus = 'pending' | 'approved' | 'rejected';
export declare class StreamerApplication {
    userId: string;
    username: string;
    displayName: string;
    email: string;
    platform: 'twitch' | 'youtube' | 'kick' | 'facebook' | 'other';
    channelUrl: string;
    description: string;
    monthlyViewers: number;
    contentCategory: string;
    reasonForApplying: string;
    referrer?: string;
    status: StreamerApplicationStatus;
    reviewNotes?: string;
    reviewedByAdminId?: string;
    reviewedAt?: Date;
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const StreamerApplicationSchema: import("mongoose").Schema<StreamerApplication, import("mongoose").Model<StreamerApplication, any, any, any, Document<unknown, any, StreamerApplication, any, {}> & StreamerApplication & Required<{
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, StreamerApplication, Document<unknown, {}, import("mongoose").FlatRecord<StreamerApplication>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<StreamerApplication> & Required<{
    _id: string;
}> & {
    __v: number;
}>;
