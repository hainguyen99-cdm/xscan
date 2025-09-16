import { Document, Types } from 'mongoose';
export type WebhookEventDocument = WebhookEvent & Document;
export declare class WebhookEvent {
    eventId: string;
    provider: string;
    eventType: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    payload: any;
    processedData?: any;
    errorMessage?: string;
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: Date;
    processingTimeMs?: number;
    signature?: string;
    signatureValid: boolean;
    relatedDonationId?: Types.ObjectId;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export declare const WebhookEventSchema: import("mongoose").Schema<WebhookEvent, import("mongoose").Model<WebhookEvent, any, any, any, Document<unknown, any, WebhookEvent, any, {}> & WebhookEvent & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WebhookEvent, Document<unknown, {}, import("mongoose").FlatRecord<WebhookEvent>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<WebhookEvent> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
