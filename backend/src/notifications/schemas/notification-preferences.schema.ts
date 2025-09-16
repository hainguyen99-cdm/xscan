import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationPreferencesDocument = NotificationPreferences & Document;

@Schema({ timestamps: true })
export class NotificationPreferences {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ default: true })
  email: boolean;

  @Prop({ default: true })
  inApp: boolean;

  @Prop({ default: false })
  push: boolean;

  @Prop({ default: true })
  donationConfirmations: boolean;

  @Prop({ default: true })
  streamerUpdates: boolean;

  @Prop({ default: true })
  securityAlerts: boolean;

  @Prop({ default: false })
  marketing: boolean;
}

export const NotificationPreferencesSchema = SchemaFactory.createForClass(NotificationPreferences);

// Index for better query performance - removed duplicate userId index 