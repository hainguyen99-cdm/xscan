import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BankTransactionDocument = BankTransaction & Document;

@Schema({ timestamps: true })
export class BankTransaction {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	streamerId: Types.ObjectId;

	@Prop({ type: String, required: true })
	reference: string;

	@Prop({ type: String })
	description?: string;

	@Prop({ type: Number, required: true, min: 1 })
	amount: number;

	@Prop({ type: String, enum: ['VND'], default: 'VND' })
	currency: string;

	@Prop({ type: Date })
	transactionDate?: Date;

	@Prop({ type: Object })
	raw?: Record<string, unknown>;

	_id: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

export const BankTransactionSchema = SchemaFactory.createForClass(BankTransaction);

BankTransactionSchema.index({ streamerId: 1, reference: 1 }, { unique: true });
BankTransactionSchema.index({ streamerId: 1, createdAt: -1 });


