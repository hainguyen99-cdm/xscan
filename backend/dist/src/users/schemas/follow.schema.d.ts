import { Document, Types } from 'mongoose';
export type FollowDocument = Follow & Document;
export declare class Follow {
    followerId: Types.ObjectId;
    streamerId: Types.ObjectId;
    followedAt: Date;
    isActive: boolean;
}
export declare const FollowSchema: import("mongoose").Schema<Follow, import("mongoose").Model<Follow, any, any, any, Document<unknown, any, Follow, any, {}> & Follow & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Follow, Document<unknown, {}, import("mongoose").FlatRecord<Follow>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Follow> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
