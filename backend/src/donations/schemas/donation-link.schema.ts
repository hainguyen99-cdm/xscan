import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DonationLinkDocument = DonationLink & Document;

@Schema({ timestamps: true })
export class DonationLink {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  streamerId: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  })
  slug: string;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 100 })
  title: string;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  @Prop({ required: true, unique: true, trim: true })
  customUrl: string;

  @Prop({ required: true, trim: true })
  qrCodeUrl: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, default: true })
  allowAnonymous: boolean;

  @Prop({
    type: {
      primaryColor: { type: String, required: true, default: '#3B82F6' },
      secondaryColor: { type: String, required: true, default: '#1E40AF' },
      backgroundColor: { type: String, required: true, default: '#FFFFFF' },
      textColor: { type: String, required: true, default: '#1F2937' },
    },
    required: true,
  })
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  };

  @Prop({ type: Number, default: 0 })
  totalDonations: number;

  @Prop({ type: Number, default: 0 })
  totalAmount: number;

  @Prop({ type: String, default: 'VND' })
  currency: string;

  @Prop({ type: Number, default: 0 })
  pageViews: number;

  @Prop({ type: [String], default: [] })
  socialMediaLinks: string[];

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Boolean, default: false })
  isDefault: boolean;

  @Prop({ type: Date })
  lastDonationAt?: Date;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: Boolean, default: false })
  isExpired: boolean;

  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const DonationLinkSchema = SchemaFactory.createForClass(DonationLink);

// Indexes for better query performance
DonationLinkSchema.index({ streamerId: 1 });
DonationLinkSchema.index({ isActive: 1 });
DonationLinkSchema.index({ isExpired: 1 });
DonationLinkSchema.index({ createdAt: -1 });
