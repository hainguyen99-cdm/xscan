import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletDocument = Wallet & Document;

@Schema({ timestamps: true })
export class Wallet {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
    default: 0,
    min: 0,
  })
  balance: number;

  @Prop({
    type: String,
    required: true,
    enum: ['VND'],
    default: 'VND',
  })
  currency: string;

  @Prop({
    type: [Types.ObjectId],
    ref: 'Transaction',
    default: [],
  })
  transactionHistory: Types.ObjectId[];

  @Prop({
    type: Boolean,
    required: true,
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: Date,
    default: Date.now,
  })
  lastTransactionAt?: Date;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  totalDeposits: number;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  totalWithdrawals: number;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  totalFees: number;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  totalTransfers: number;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  totalDonations: number;

  // Mongoose document properties
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

// Create indexes for better query performance
WalletSchema.index({ currency: 1 });
WalletSchema.index({ isActive: 1 });
