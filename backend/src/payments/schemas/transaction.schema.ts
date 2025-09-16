import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
  DONATION = 'donation',
  WITHDRAWAL = 'withdrawal',
  REFUND = 'refund',
  FEE = 'fee',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
  PROCESSING = 'processing',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  WALLET = 'wallet',
  BANK_TRANSFER = 'bank_transfer',
}

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_INVESTIGATION = 'under_investigation',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum DisputeResolution {
  REFUND = 'refund',
  APPROVE = 'approve',
  PARTIAL_REFUND = 'partial_refund',
  INVESTIGATION = 'investigation',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  userName: string;

  @Prop({ 
    type: String, 
    enum: TransactionType, 
    required: true 
  })
  type: TransactionType;

  @Prop({ required: true, min: 0.01 })
  amount: number;

  @Prop({
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
    default: 'USD',
  })
  currency: string;

  @Prop({ 
    type: String, 
    enum: TransactionStatus, 
    required: true, 
    default: TransactionStatus.PENDING 
  })
  status: TransactionStatus;

  @Prop({ 
    type: String, 
    enum: PaymentMethod, 
    required: true 
  })
  paymentMethod: PaymentMethod;

  @Prop({ trim: true, maxlength: 500 })
  description: string;

  @Prop({ type: String })
  transactionId?: string;

  @Prop({ type: String })
  paymentIntentId?: string;

  @Prop({ type: Number, default: 0 })
  processingFee: number;

  @Prop({ type: Number, default: 0 })
  feeAmount: number;

  @Prop({ type: Number, default: 0 })
  netAmount: number;

  @Prop({ type: String })
  failureReason?: string;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Date })
  failedAt?: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop({ type: Date })
  disputedAt?: Date;

  @Prop({ type: Date })
  resolvedAt?: Date;

  // Dispute handling
  @Prop({ type: String })
  disputeReason?: string;

  @Prop({ 
    type: String, 
    enum: DisputeStatus 
  })
  disputeStatus?: DisputeStatus;

  @Prop({ 
    type: String, 
    enum: DisputeResolution 
  })
  disputeResolution?: DisputeResolution;

  @Prop({ type: String })
  adminNotes?: string;

  @Prop({ type: String })
  adminId?: string;

  @Prop({ type: Date })
  adminActionAt?: Date;

  // Manual adjustments
  @Prop({ type: Number, default: 0 })
  manualAdjustment?: number;

  @Prop({ type: String })
  adjustmentReason?: string;

  @Prop({ type: String })
  adjustmentAdminId?: string;

  @Prop({ type: Date })
  adjustmentAt?: Date;

  // Bank account information
  @Prop({ type: Object })
  bankAccount?: {
    last4: string;
    bankName: string;
    accountType: string;
  };

  // Verification and KYC status
  @Prop({ 
    type: String, 
    enum: ['verified', 'pending', 'failed', 'not_required'],
    default: 'not_required'
  })
  verificationStatus?: string;

  @Prop({ 
    type: String, 
    enum: ['approved', 'pending', 'rejected', 'not_required'],
    default: 'not_required'
  })
  kycStatus?: string;

  // Refund information
  @Prop({ type: Number, default: 0 })
  refundAmount?: number;

  // Metadata
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  // Related transactions
  @Prop({ type: Types.ObjectId, ref: 'Transaction' })
  relatedTransactionId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Donation' })
  donationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  recipientId?: Types.ObjectId;

  @Prop({ type: String })
  recipientName?: string;

  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexes for better query performance
TransactionSchema.index({ userId: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ paymentMethod: 1 });
TransactionSchema.index({ disputeStatus: 1 });
TransactionSchema.index({ adminId: 1 });
TransactionSchema.index({ relatedTransactionId: 1 });
TransactionSchema.index({ donationId: 1 });
TransactionSchema.index({ recipientId: 1 });

// Compound indexes for common queries
TransactionSchema.index({ status: 1, type: 1 });
TransactionSchema.index({ userId: 1, status: 1 });
TransactionSchema.index({ createdAt: -1, status: 1 });
TransactionSchema.index({ disputeStatus: 1, status: 1 }); 