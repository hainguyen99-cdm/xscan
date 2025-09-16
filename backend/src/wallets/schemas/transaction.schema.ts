import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  FEE = 'fee',
  REFUND = 'refund',
  DONATION = 'donation',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({
    type: Types.ObjectId,
    ref: 'Wallet',
    required: true,
  })
  walletId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: TransactionType,
  })
  type: TransactionType;

  @Prop({
    type: Number,
    required: true,
  })
  amount: number;

  @Prop({
    type: String,
    required: true,
    enum: ['VND'],
  })
  currency: string;

  @Prop({
    type: String,
    required: true,
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Prop({
    type: String,
    required: false,
  })
  description?: string;

  @Prop({
    type: String,
    required: false,
  })
  reference?: string;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  fee?: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'Wallet',
    required: false,
  })
  relatedWalletId?: Types.ObjectId;

  @Prop({
    type: Object,
    required: false,
  })
  metadata?: Record<string, any>;

  @Prop({
    type: Date,
    required: false,
  })
  processedAt?: Date;

  @Prop({
    type: String,
    required: false,
  })
  failureReason?: string;

  // Payment Gateway Integration Fields
  @Prop({
    type: String,
    required: false,
    enum: ['stripe', 'paypal'],
  })
  paymentProvider?: string;

  @Prop({
    type: String,
    required: false,
  })
  paymentIntentId?: string;

  @Prop({
    type: String,
    required: false,
  })
  payoutId?: string;

  @Prop({
    type: String,
    required: false,
  })
  destination?: string;

  @Prop({
    type: String,
    required: false,
  })
  feeType?: string;

  // Mongoose document properties
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Create indexes for better query performance
TransactionSchema.index({ walletId: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ createdAt: 1 });
TransactionSchema.index({ reference: 1 }, { unique: true, sparse: true });
TransactionSchema.index({ paymentIntentId: 1 });
TransactionSchema.index({ payoutId: 1 });
TransactionSchema.index({ paymentProvider: 1 });
