import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BankAccountDocument = BankAccount & Document;

@Schema({ timestamps: true })
export class BankAccount {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  accountName: string;

  @Prop({ required: true })
  accountNumber: string;

  @Prop()
  bankCode?: string;

  @Prop()
  bankShortName?: string;

  @Prop()
  bin?: string;

  @Prop()
  logo?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop()
  lastUsedAt?: Date;
}

export const BankAccountSchema = SchemaFactory.createForClass(BankAccount);

// Indexes
BankAccountSchema.index({ userId: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });
BankAccountSchema.index({ userId: 1, bankCode: 1, accountNumber: 1 }, { unique: true });
