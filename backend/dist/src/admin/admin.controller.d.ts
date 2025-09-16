import { Response } from 'express';
import { AdminService } from './admin.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminUserManagementService } from './admin-user-management.service';
import { AdminFeeManagementService } from './admin-fee-management.service';
import { StreamerApplicationsService } from '../streamer-applications/streamer-applications.service';
import { UserFilterDto, UserUpdateDto, UserStatusDto, FeeConfigDto, FeeReportDto, DashboardStatsDto, FeeCalculationDto } from './dto/admin.dto';
export declare class AdminController {
    private readonly adminService;
    private readonly adminDashboardService;
    private readonly adminUserManagementService;
    private readonly adminFeeManagementService;
    private readonly streamerApplicationsService;
    constructor(adminService: AdminService, adminDashboardService: AdminDashboardService, adminUserManagementService: AdminUserManagementService, adminFeeManagementService: AdminFeeManagementService, streamerApplicationsService: StreamerApplicationsService);
    getStreamerApplications(req: any, page?: number, limit?: number, status?: string, search?: string): Promise<{
        items: import("../streamer-applications/streamer-application.schema").StreamerApplication[];
        total: number;
        page: number;
        limit: number;
    }>;
    reviewStreamerApplication(applicationId: string, reviewData: {
        action: 'approve' | 'reject';
        notes?: string;
    }, req: any): Promise<import("../streamer-applications/streamer-application.schema").StreamerApplication & {
        roleChangeInfo?: {
            previousRole: string;
            newRole: string;
            updated: boolean;
        };
    }>;
    getDashboardOverview(req: any): Promise<DashboardStatsDto>;
    getRecentActivity(limit: number, req: any): Promise<import("./dto/admin.dto").AdminActivityDto[]>;
    getUsers(filters: UserFilterDto, req: any): Promise<import("./dto/admin.dto").PaginatedResponseDto<import("../users/schemas/user.schema").UserDocument>>;
    getUserById(userId: string, req: any): Promise<import("../users/schemas/user.schema").UserDocument>;
    updateUser(userId: string, updateData: UserUpdateDto, req: any): Promise<import("../users/schemas/user.schema").UserDocument>;
    updateUserStatus(userId: string, statusData: UserStatusDto, req: any): Promise<import("../users/schemas/user.schema").UserDocument>;
    verifyUser(userId: string, req: any): Promise<import("../users/schemas/user.schema").UserDocument>;
    unverifyUser(userId: string, req: any): Promise<import("../users/schemas/user.schema").UserDocument>;
    deleteUser(userId: string, req: any): Promise<void>;
    getFeeConfig(req: any): Promise<FeeConfigDto>;
    updateFeeConfig(feeConfig: FeeConfigDto, req: any): Promise<FeeConfigDto>;
    getFeeReports(reportData: FeeReportDto, req: any): Promise<any>;
    exportUsers(format: string, filters: UserFilterDto, req: any, res: Response): Promise<void>;
    exportTransactions(format: string, filters: any, req: any, res: Response): Promise<void>;
    getSystemHealth(req: any): Promise<import("./dto/admin.dto").SystemHealthDto>;
    getSystemLogs(level: string, limit: number, req: any): Promise<import("./dto/admin.dto").SystemLogDto[]>;
    getDashboardCharts(period: string, req: any): Promise<any>;
    getQuickStats(req: any): Promise<any>;
    getFeeAnalytics(req: any): Promise<any>;
    calculateFees(body: FeeCalculationDto, req: any): Promise<any>;
    private getContentType;
}
