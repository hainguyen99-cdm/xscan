import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { TransactionDocument } from '../payments/schemas/transaction.schema';
import { DonationDocument } from '../donations/schemas/donation.schema';
import { OBSSettingsDocument } from '../obs-settings/obs-settings.schema';
import { DashboardStatsDto, AdminActivityDto } from './dto/admin.dto';
export declare class AdminDashboardService {
    private userModel;
    private transactionModel;
    private donationModel;
    private obsSettingsModel;
    constructor(userModel: Model<UserDocument>, transactionModel: Model<TransactionDocument>, donationModel: Model<DonationDocument>, obsSettingsModel: Model<OBSSettingsDocument>);
    getOverviewStats(adminId: string): Promise<DashboardStatsDto>;
    getRecentActivity(adminId: string, limit?: number): Promise<AdminActivityDto[]>;
    getDashboardCharts(adminId: string, period?: string): Promise<any>;
    getQuickStats(adminId: string): Promise<any>;
}
