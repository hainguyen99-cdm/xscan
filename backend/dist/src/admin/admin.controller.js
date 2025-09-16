"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_enum_1 = require("../common/enums/roles.enum");
const admin_service_1 = require("./admin.service");
const admin_dashboard_service_1 = require("./admin-dashboard.service");
const admin_user_management_service_1 = require("./admin-user-management.service");
const admin_fee_management_service_1 = require("./admin-fee-management.service");
const streamer_applications_service_1 = require("../streamer-applications/streamer-applications.service");
const admin_dto_1 = require("./dto/admin.dto");
let AdminController = class AdminController {
    constructor(adminService, adminDashboardService, adminUserManagementService, adminFeeManagementService, streamerApplicationsService) {
        this.adminService = adminService;
        this.adminDashboardService = adminDashboardService;
        this.adminUserManagementService = adminUserManagementService;
        this.adminFeeManagementService = adminFeeManagementService;
        this.streamerApplicationsService = streamerApplicationsService;
    }
    async getStreamerApplications(req, page = 1, limit = 10, status, search) {
        const adminId = req.user.id;
        return await this.streamerApplicationsService.getApplicationsForAdmin({
            page,
            limit,
            status: status,
            search,
        }, adminId);
    }
    async reviewStreamerApplication(applicationId, reviewData, req) {
        const adminId = req.user.id;
        return await this.streamerApplicationsService.reviewApplication(applicationId, reviewData.action, reviewData.notes, adminId);
    }
    async getDashboardOverview(req) {
        const adminId = req.user.id;
        return await this.adminDashboardService.getOverviewStats(adminId);
    }
    async getRecentActivity(limit = 20, req) {
        const adminId = req.user.id;
        return await this.adminDashboardService.getRecentActivity(adminId, limit);
    }
    async getUsers(filters, req) {
        const adminId = req.user.id;
        return await this.adminUserManagementService.getUsers(filters, adminId);
    }
    async getUserById(userId, req) {
        const adminId = req.user.id;
        return await this.adminUserManagementService.getUserById(userId, adminId);
    }
    async updateUser(userId, updateData, req) {
        const adminId = req.user.id;
        return await this.adminUserManagementService.updateUser(userId, updateData, adminId);
    }
    async updateUserStatus(userId, statusData, req) {
        const adminId = req.user.id;
        return await this.adminUserManagementService.updateUserStatus(userId, statusData, adminId);
    }
    async verifyUser(userId, req) {
        const adminId = req.user.id;
        return await this.adminUserManagementService.verifyUser(userId, adminId);
    }
    async unverifyUser(userId, req) {
        const adminId = req.user.id;
        return await this.adminUserManagementService.unverifyUser(userId, adminId);
    }
    async deleteUser(userId, req) {
        const adminId = req.user.id;
        return await this.adminUserManagementService.deleteUser(userId, adminId);
    }
    async getFeeConfig(req) {
        const adminId = req.user.id;
        return await this.adminFeeManagementService.getFeeConfig(adminId);
    }
    async updateFeeConfig(feeConfig, req) {
        const adminId = req.user.id;
        return await this.adminFeeManagementService.updateFeeConfig(feeConfig, adminId);
    }
    async getFeeReports(reportData, req) {
        const adminId = req.user.id;
        return await this.adminFeeManagementService.getFeeReports(reportData, adminId);
    }
    async exportUsers(format, filters, req, res) {
        const adminId = req.user.id;
        const buffer = await this.adminUserManagementService.exportUsers(format, filters, adminId);
        const filename = `users-${new Date().toISOString().split('T')[0]}.${format}`;
        res.set({
            'Content-Type': this.getContentType(format),
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(buffer);
    }
    async exportTransactions(format, filters, req, res) {
        const adminId = req.user.id;
        const buffer = await this.adminService.exportTransactions(format, filters, adminId);
        const filename = `transactions-${new Date().toISOString().split('T')[0]}.${format}`;
        res.set({
            'Content-Type': this.getContentType(format),
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(buffer);
    }
    async getSystemHealth(req) {
        const adminId = req.user.id;
        return await this.adminService.getSystemHealth(adminId);
    }
    async getSystemLogs(level = 'info', limit = 100, req) {
        const adminId = req.user.id;
        return await this.adminService.getSystemLogs(level, limit, adminId);
    }
    async getDashboardCharts(period = '30d', req) {
        const adminId = req.user.id;
        return await this.adminDashboardService.getDashboardCharts(adminId, period);
    }
    async getQuickStats(req) {
        const adminId = req.user.id;
        return await this.adminDashboardService.getQuickStats(adminId);
    }
    async getFeeAnalytics(req) {
        const adminId = req.user.id;
        return await this.adminFeeManagementService.getFeeAnalytics(adminId);
    }
    async calculateFees(body, req) {
        const adminId = req.user.id;
        return await this.adminFeeManagementService.calculateFees(body.amount, body.paymentMethod, body.userRole);
    }
    getContentType(format) {
        switch (format) {
            case 'csv':
                return 'text/csv';
            case 'pdf':
                return 'application/pdf';
            case 'excel':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'json':
                return 'application/json';
            default:
                return 'application/octet-stream';
        }
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('streamer-applications'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all streamer applications with filtering and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: 'number', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: 'number', required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: ['pending', 'approved', 'rejected'], required: false, description: 'Filter by status' }),
    (0, swagger_1.ApiQuery)({ name: 'search', type: 'string', required: false, description: 'Search by username, display name, or email' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Streamer applications retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStreamerApplications", null);
__decorate([
    (0, common_1.Post)('streamer-applications/:id/review'),
    (0, swagger_1.ApiOperation)({ summary: 'Review a streamer application (approve/reject)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Application ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Application reviewed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Application not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid action' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reviewStreamerApplication", null);
__decorate([
    (0, common_1.Get)('dashboard/overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin dashboard overview statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dashboard overview retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardOverview", null);
__decorate([
    (0, common_1.Get)('dashboard/recent-activity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent admin activity' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recent activity retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRecentActivity", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Users retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.UserFilterDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UserUpdateDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Post)('users/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user account status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User status updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UserStatusDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Post)('users/:id/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Add verification badge to user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User verified successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verifyUser", null);
__decorate([
    (0, common_1.Delete)('users/:id/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove verification badge from user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User verification removed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "unverifyUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user account' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('fees/config'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current fee configuration' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Fee configuration retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getFeeConfig", null);
__decorate([
    (0, common_1.Put)('fees/config'),
    (0, swagger_1.ApiOperation)({ summary: 'Update fee configuration' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Fee configuration updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.FeeConfigDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateFeeConfig", null);
__decorate([
    (0, common_1.Get)('fees/reports'),
    (0, swagger_1.ApiOperation)({ summary: 'Get fee reports and analytics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Fee reports retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.FeeReportDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getFeeReports", null);
__decorate([
    (0, common_1.Get)('export/users/:format'),
    (0, swagger_1.ApiOperation)({ summary: 'Export users data' }),
    (0, swagger_1.ApiParam)({ name: 'format', enum: ['csv', 'pdf', 'excel'], description: 'Export format' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Users data exported successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('format')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UserFilterDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportUsers", null);
__decorate([
    (0, common_1.Get)('export/transactions/:format'),
    (0, swagger_1.ApiOperation)({ summary: 'Export transactions data' }),
    (0, swagger_1.ApiParam)({ name: 'format', enum: ['csv', 'pdf', 'excel'], description: 'Export format' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transactions data exported successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('format')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportTransactions", null);
__decorate([
    (0, common_1.Get)('system/health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system health status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'System health status retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Get)('system/logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system logs' }),
    (0, swagger_1.ApiQuery)({ name: 'level', enum: ['error', 'warn', 'info', 'debug'], description: 'Log level' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: 'number', description: 'Number of logs to retrieve' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'System logs retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Query)('level')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemLogs", null);
__decorate([
    (0, common_1.Get)('dashboard/charts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard charts data' }),
    (0, swagger_1.ApiQuery)({ name: 'period', enum: ['7d', '30d', '90d', '1y'], required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Charts data retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardCharts", null);
__decorate([
    (0, common_1.Get)('dashboard/quick-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quick stats for today vs yesterday' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quick stats retrieved successfully' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getQuickStats", null);
__decorate([
    (0, common_1.Get)('fees/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get fee analytics and trends' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fee analytics retrieved successfully' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getFeeAnalytics", null);
__decorate([
    (0, common_1.Post)('fees/calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate fee breakdown for a given amount and method' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fee calculation successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.FeeCalculationDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "calculateFees", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        admin_dashboard_service_1.AdminDashboardService,
        admin_user_management_service_1.AdminUserManagementService,
        admin_fee_management_service_1.AdminFeeManagementService,
        streamer_applications_service_1.StreamerApplicationsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map