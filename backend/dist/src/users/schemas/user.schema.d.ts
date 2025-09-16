import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare class User {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    profilePicture?: string;
    coverPhoto?: string;
    bio?: string;
    location?: string;
    website?: string;
    role: string;
    isActive: boolean;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    lastLoginAt?: Date;
    profileVisibility?: string;
    showEmail?: boolean;
    showPhone?: boolean;
    showAddress?: boolean;
    showLastLogin?: boolean;
    profileCompletionPercentage?: number;
    profileCompletedAt?: Date;
    verificationBadges?: string[];
    lastProfileUpdate?: Date;
    profileViews?: number;
    profileViewers?: string[];
    deletionRequestedAt?: Date;
    deletionReason?: string;
    scheduledDeletionAt?: Date;
    bankToken?: string;
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & Required<{
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & Required<{
    _id: string;
}> & {
    __v: number;
}>;
