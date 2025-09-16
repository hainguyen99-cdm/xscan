import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ScanDocument = Scan & Document;

export enum ScanStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ScanType {
  PORT_SCAN = 'port_scan',
  VULNERABILITY_SCAN = 'vulnerability_scan',
  WEB_APPLICATION_SCAN = 'web_application_scan',
}

@Schema({ timestamps: true })
export class Scan {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  target: string;

  @Prop({ required: true, enum: ScanType })
  type: ScanType;

  @Prop({ required: true, enum: ScanStatus, default: ScanStatus.PENDING })
  status: ScanStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Object })
  results?: any;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  errorMessage?: string;

  @Prop({ type: Object })
  configuration?: any;
}

export const ScanSchema = SchemaFactory.createForClass(Scan);
