import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  })
  username: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, minlength: 6 })
  password: string;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 50 })
  firstName: string;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 50 })
  lastName: string;

  @Prop({ trim: true, match: /^\+?[\d\s\-\(\)]+$/ })
  phone?: string;

  @Prop({ trim: true, maxlength: 500 })
  address?: string;

  @Prop({ trim: true, maxlength: 500 })
  profilePicture?: string;

  @Prop({ trim: true, maxlength: 500 })
  coverPhoto?: string;

  @Prop({ trim: true, maxlength: 1000 })
  bio?: string;

  @Prop({ trim: true, maxlength: 100 })
  location?: string;

  @Prop({ trim: true, maxlength: 500 })
  website?: string;

  @Prop({
    required: true,
    enum: ['admin', 'streamer', 'donor'],
    default: 'donor',
  })
  role: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: String })
  passwordResetToken?: string;

  @Prop({ type: Date })
  passwordResetExpires?: Date;

  @Prop({ required: true, default: false })
  twoFactorEnabled: boolean;

  @Prop({ type: String })
  twoFactorSecret?: string;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  // Enhanced Profile Management Fields
  @Prop({
    enum: ['public', 'private', 'friends_only'],
    default: 'public',
  })
  profileVisibility?: string;

  @Prop({ default: true })
  showEmail?: boolean;

  @Prop({ default: false })
  showPhone?: boolean;

  @Prop({ default: false })
  showAddress?: boolean;

  @Prop({ default: false })
  showLastLogin?: boolean;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  profileCompletionPercentage?: number;

  @Prop({ type: Date })
  profileCompletedAt?: Date;

  @Prop({ type: [String], default: [] })
  verificationBadges?: string[];

  @Prop({ type: Date })
  lastProfileUpdate?: Date;

  @Prop({ type: Number, default: 0 })
  profileViews?: number;

  @Prop({ type: [String], default: [] })
  profileViewers?: string[];

  @Prop({ type: Date })
  deletionRequestedAt?: Date;

  @Prop({ type: String })
  deletionReason?: string;

  @Prop({ type: Date })
  scheduledDeletionAt?: Date;

  @Prop({ trim: true, maxlength: 200 })
  bankToken?: string;

  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
