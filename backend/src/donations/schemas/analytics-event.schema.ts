import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnalyticsEventDocument = AnalyticsEvent & Document;

@Schema({ timestamps: true })
export class AnalyticsEvent {
  @Prop({ type: Types.ObjectId, ref: 'DonationLink', required: true })
  donationLinkId: Types.ObjectId;

  @Prop({
    required: true,
    enum: [
      'page_view',
      'donation_started',
      'donation_completed',
      'qr_code_scanned',
      'social_share',
      'link_clicked',
    ],
  })
  eventType: string;

  @Prop({ type: Object })
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

  @Prop({ type: String })
  sessionId?: string;

  @Prop({ type: String })
  visitorId?: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: Boolean, default: false })
  isProcessed: boolean;

  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const AnalyticsEventSchema =
  SchemaFactory.createForClass(AnalyticsEvent);

// Indexes for better query performance
AnalyticsEventSchema.index({ donationLinkId: 1, eventType: 1 });
AnalyticsEventSchema.index({ timestamp: -1 });
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ sessionId: 1 });
AnalyticsEventSchema.index({ visitorId: 1 });
