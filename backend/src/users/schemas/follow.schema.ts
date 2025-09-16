import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FollowDocument = Follow & Document;

@Schema({ timestamps: true })
export class Follow {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  followerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  streamerId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  followedAt: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

// Create compound index to prevent duplicate active follows
FollowSchema.index({ followerId: 1, streamerId: 1, isActive: 1 }, { unique: true });
