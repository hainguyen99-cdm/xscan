import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StreamerApplicationDocument = StreamerApplication & Document;

export type StreamerApplicationStatus = 'pending' | 'approved' | 'rejected';

@Schema({ timestamps: true })
export class StreamerApplication {
  @Prop({ required: true, type: String })
  userId: string;

  @Prop({ required: true, trim: true, maxlength: 50 })
  username: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  displayName: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, enum: ['twitch', 'youtube', 'kick', 'facebook', 'other'] })
  platform: 'twitch' | 'youtube' | 'kick' | 'facebook' | 'other';

  @Prop({ required: true, trim: true })
  channelUrl: string;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  description: string;

  @Prop({ required: true, min: 0 })
  monthlyViewers: number;

  @Prop({ required: true, trim: true, maxlength: 100 })
  contentCategory: string;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  reasonForApplying: string;

  @Prop({ trim: true, maxlength: 100 })
  referrer?: string;

  @Prop({ required: true, default: 'pending' })
  status: StreamerApplicationStatus;

  @Prop({ trim: true, maxlength: 1000 })
  reviewNotes?: string;

  @Prop({ type: String })
  reviewedByAdminId?: string;

  @Prop({ type: Date })
  reviewedAt?: Date;

  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const StreamerApplicationSchema = SchemaFactory.createForClass(StreamerApplication);



