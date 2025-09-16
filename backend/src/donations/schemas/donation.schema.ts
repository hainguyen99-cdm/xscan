import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DonationDocument = Donation & Document;

@Schema({ timestamps: true })
export class Donation {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  donorId?: Types.ObjectId; // null for anonymous donations

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  streamerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DonationLink', required: true })
  donationLinkId: Types.ObjectId;

  @Prop({ required: true, min: 0.01 })
  amount: number;

  @Prop({
    required: true,
    enum: ['VND'],
    default: 'VND',
  })
  currency: string;

  @Prop({ trim: true, maxlength: 500 })
  message?: string;

  @Prop({ required: true, default: false })
  isAnonymous: boolean;

  @Prop({
    required: true,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'completed' | 'failed' | 'cancelled';

  @Prop({
    required: true,
    enum: ['wallet', 'stripe', 'paypal', 'bank_transfer'],
    default: 'wallet',
  })
  paymentMethod: 'wallet' | 'stripe' | 'paypal' | 'bank_transfer';

  @Prop({ type: String })
  transactionId?: string;

  @Prop({ type: String })
  paymentIntentId?: string;

  @Prop({ type: Number, default: 0 })
  processingFee: number;

  @Prop({ type: Number, default: 0 })
  netAmount: number;

  @Prop({ type: String })
  failureReason?: string;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Date })
  failedAt?: Date;

  @Prop({ type: Boolean, default: false })
  isRefunded: boolean;

  @Prop({ type: Date })
  refundedAt?: Date;

  @Prop({ type: String })
  refundReason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const DonationSchema = SchemaFactory.createForClass(Donation);

// Indexes for better query performance
DonationSchema.index({ donorId: 1 });
DonationSchema.index({ streamerId: 1 });
DonationSchema.index({ donationLinkId: 1 });
DonationSchema.index({ status: 1 });
DonationSchema.index({ createdAt: -1 });
DonationSchema.index({ paymentMethod: 1 });
DonationSchema.index({ isAnonymous: 1 });
