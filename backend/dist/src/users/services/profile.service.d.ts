import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { ProfilePrivacyDto } from '../dto/profile-privacy.dto';
import { ProfileExportDto } from '../dto/profile-export.dto';
import { ProfileDeletionDto } from '../dto/profile-deletion.dto';
export declare class ProfileService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    calculateProfileCompletion(userId: string): Promise<number>;
    updatePrivacySettings(userId: string, privacyDto: ProfilePrivacyDto): Promise<UserDocument>;
    getPublicProfile(userId: string, viewerId?: string): Promise<any>;
    private trackProfileView;
    exportProfile(userId: string, exportDto: ProfileExportDto): Promise<any>;
    private isSensitiveField;
    private convertToCSV;
    private convertToPDF;
    requestDeletion(userId: string, deletionDto: ProfileDeletionDto): Promise<void>;
    cancelDeletionRequest(userId: string): Promise<void>;
    getProfileStats(userId: string): Promise<any>;
    addVerificationBadge(userId: string, badge: string): Promise<void>;
    removeVerificationBadge(userId: string, badge: string): Promise<void>;
}
