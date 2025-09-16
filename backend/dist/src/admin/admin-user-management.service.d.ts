import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { TransactionDocument } from '../payments/schemas/transaction.schema';
import { DonationDocument } from '../donations/schemas/donation.schema';
import { OBSSettingsDocument } from '../obs-settings/obs-settings.schema';
import { UserFilterDto, UserUpdateDto, UserStatusDto, PaginatedResponseDto } from './dto/admin.dto';
export declare class AdminUserManagementService {
    private userModel;
    private transactionModel;
    private donationModel;
    private obsSettingsModel;
    constructor(userModel: Model<UserDocument>, transactionModel: Model<TransactionDocument>, donationModel: Model<DonationDocument>, obsSettingsModel: Model<OBSSettingsDocument>);
    getUsers(filters: UserFilterDto, adminId: string): Promise<PaginatedResponseDto<UserDocument>>;
    getUserById(userId: string, adminId: string): Promise<UserDocument>;
    updateUser(userId: string, updateData: UserUpdateDto, adminId: string): Promise<UserDocument>;
    updateUserStatus(userId: string, statusData: UserStatusDto, adminId: string): Promise<UserDocument>;
    verifyUser(userId: string, adminId: string): Promise<UserDocument>;
    unverifyUser(userId: string, adminId: string): Promise<UserDocument>;
    deleteUser(userId: string, adminId: string): Promise<void>;
    getUserStats(userId: string, adminId: string): Promise<any>;
    exportUsers(format: string, filters: UserFilterDto, adminId: string): Promise<Buffer>;
    private convertToCSV;
    private convertToPDF;
    private convertToExcel;
    private logAdminActivity;
}
