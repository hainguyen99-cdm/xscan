import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WebhookEventDocument = WebhookEvent & Document;

@Schema({ timestamps: true })
export class WebhookEvent {
  @Prop({ required: true, unique: true })
  eventId: string;

  @Prop({ required: true })
  provider: string; // 'stripe', 'paypal', 'custom'

  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Prop({ type: Object, required: true })
  payload: any;

  @Prop({ type: Object, required: false })
  processedData?: any;

  @Prop({ type: String, required: false })
  errorMessage?: string;

  @Prop({ type: Number, required: false, default: 0 })
  retryCount: number;

  @Prop({ type: Number, required: false, default: 3 })
  maxRetries: number;

  @Prop({ type: Date, required: false })
  nextRetryAt?: Date;

  @Prop({ type: Number, required: false })
  processingTimeMs?: number;

  @Prop({ type: String, required: false })
  signature?: string;

  @Prop({ type: Boolean, required: false, default: false })
  signatureValid: boolean;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Donation' })
  relatedDonationId?: Types.ObjectId;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  @Prop({ type: String, required: false })
  ipAddress?: string;

  @Prop({ type: String, required: false })
  userAgent?: string;
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);

// Indexes for better query performance
WebhookEventSchema.index({ provider: 1, eventType: 1 });
WebhookEventSchema.index({ status: 1, createdAt: 1 });
WebhookEventSchema.index({ relatedDonationId: 1 });
WebhookEventSchema.index({ createdAt: 1 });
WebhookEventSchema.index({ nextRetryAt: 1 });
