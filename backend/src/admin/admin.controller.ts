import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { AdminService } from './admin.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminUserManagementService } from './admin-user-management.service';
import { AdminFeeManagementService } from './admin-fee-management.service';
import { StreamerApplicationsService } from '../streamer-applications/streamer-applications.service';
import {
  UserFilterDto,
  UserUpdateDto,
  UserStatusDto,
  FeeConfigDto,
  FeeReportDto,
  DashboardStatsDto,
  ExportFormatDto,
  FeeCalculationDto,
} from './dto/admin.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminDashboardService: AdminDashboardService,
    private readonly adminUserManagementService: AdminUserManagementService,
    private readonly adminFeeManagementService: AdminFeeManagementService,
    private readonly streamerApplicationsService: StreamerApplicationsService,
  ) {}

  // Streamer Applications Management
  @Get('streamer-applications')
  @ApiOperation({ summary: 'Get all streamer applications with filtering and pagination' })
  @ApiQuery({ name: 'page', type: 'number', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: 'number', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'status', enum: ['pending', 'approved', 'rejected'], required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'search', type: 'string', required: false, description: 'Search by username, display name, or email' })
  @ApiResponse({
    status: 200,
    description: 'Streamer applications retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getStreamerApplications(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const adminId = req.user.id;
    return await this.streamerApplicationsService.getApplicationsForAdmin({
      page,
      limit,
      status: status as 'pending' | 'approved' | 'rejected' | undefined,
      search,
    }, adminId);
  }

  @Post('streamer-applications/:id/review')
  @ApiOperation({ summary: 'Review a streamer application (approve/reject)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application reviewed successfully',
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 400, description: 'Invalid action' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async reviewStreamerApplication(
    @Param('id') applicationId: string,
    @Body() reviewData: { action: 'approve' | 'reject'; notes?: string },
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return await this.streamerApplicationsService.reviewApplication(
      applicationId,
      reviewData.action,
      reviewData.notes,
      adminId,
    );
  }

  // Dashboard Overview
  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Get admin dashboard overview statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard overview retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getDashboardOverview(@Req() req: any) {
    const adminId = req.user.id;
    return await this.adminDashboardService.getOverviewStats(adminId);
  }

  @Get('dashboard/recent-activity')
  @ApiOperation({ summary: 'Get recent admin activity' })
  @ApiResponse({
    status: 200,
    description: 'Recent activity retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getRecentActivity(
    @Query('limit') limit: number = 20,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return await this.adminDashboardService.getRecentActivity(adminId, limit);
  }

  // User Management
  @Get('users')
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getUsers(@Query() filters: UserFilterDto, @Req() req: any) {
    const adminId = req.user.id;
    return await this.adminUserManagementService.getUsers(filters, adminId);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getUserById(@Param('id') userId: string, @Req() req: any) {
    const adminId = req.user.id;
    return await this.adminUserManagementService.getUserById(userId, adminId);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async updateUser(
    @Param('id') userId: string,
    @Body() updateData: UserUpdateDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return await this.adminUserManagementService.updateUser(userId, updateData, adminId);
  }

  @Post('users/:id/status')
  @ApiOperation({ summary: 'Update user account status' })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() statusData: UserStatusDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return await this.adminUserManagementService.updateUserStatus(userId, statusData, adminId);
  }

  @Post('users/:id/verify')
  @ApiOperation({ summary: 'Add verification badge to user' })
  @ApiResponse({
    status: 200,
    description: 'User verified successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async verifyUser(@Param('id') userId: string, @Req() req: any) {
    const adminId = req.user.id;
    return await this.adminUserManagementService.verifyUser(userId, adminId);
  }

  @Delete('users/:id/verify')
  @ApiOperation({ summary: 'Remove verification badge from user' })
  @ApiResponse({
    status: 200,
    description: 'User verification removed successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async unverifyUser(@Param('id') userId: string, @Req() req: any) {
    const adminId = req.user.id;
    return await this.adminUserManagementService.unverifyUser(userId, adminId);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async deleteUser(@Param('id') userId: string, @Req() req: any) {
    const adminId = req.user.id;
    return await this.adminUserManagementService.deleteUser(userId, adminId);
  }

  // Fee Management
  @Get('fees/config')
  @ApiOperation({ summary: 'Get current fee configuration' })
  @ApiResponse({
    status: 200,
    description: 'Fee configuration retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getFeeConfig(@Req() req: any) {
    const adminId = req.user.id;
    return await this.adminFeeManagementService.getFeeConfig(adminId);
  }

  @Put('fees/config')
  @ApiOperation({ summary: 'Update fee configuration' })
  @ApiResponse({
    status: 200,
    description: 'Fee configuration updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async updateFeeConfig(
    @Body() feeConfig: FeeConfigDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return await this.adminFeeManagementService.updateFeeConfig(feeConfig, adminId);
  }

  @Get('fees/reports')
  @ApiOperation({ summary: 'Get fee reports and analytics' })
  @ApiResponse({
    status: 200,
    description: 'Fee reports retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getFeeReports(
    @Query() reportData: FeeReportDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return await this.adminFeeManagementService.getFeeReports(reportData, adminId);
  }

  // Export Functionality
  @Get('export/users/:format')
  @ApiOperation({ summary: 'Export users data' })
  @ApiParam({ name: 'format', enum: ['csv', 'pdf', 'excel'], description: 'Export format' })
  @ApiResponse({
    status: 200,
    description: 'Users data exported successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async exportUsers(
    @Param('format') format: string,
    @Query() filters: UserFilterDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const adminId = req.user.id;
    const buffer = await this.adminUserManagementService.exportUsers(format, filters, adminId);

    const filename = `users-${new Date().toISOString().split('T')[0]}.${format}`;

    res.set({
      'Content-Type': this.getContentType(format),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.status(HttpStatus.OK).send(buffer);
  }

  @Get('export/transactions/:format')
  @ApiOperation({ summary: 'Export transactions data' })
  @ApiParam({ name: 'format', enum: ['csv', 'pdf', 'excel'], description: 'Export format' })
  @ApiResponse({
    status: 200,
    description: 'Transactions data exported successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async exportTransactions(
    @Param('format') format: string,
    @Query() filters: any,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const adminId = req.user.id;
    const buffer = await this.adminService.exportTransactions(format, filters, adminId);

    const filename = `transactions-${new Date().toISOString().split('T')[0]}.${format}`;

    res.set({
      'Content-Type': this.getContentType(format),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.status(HttpStatus.OK).send(buffer);
  }

  // System Management
  @Get('system/health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({
    status: 200,
    description: 'System health status retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getSystemHealth(@Req() req: any) {
    const adminId = req.user.id;
    return await this.adminService.getSystemHealth(adminId);
  }

  @Get('system/logs')
  @ApiOperation({ summary: 'Get system logs' })
  @ApiQuery({ name: 'level', enum: ['error', 'warn', 'info', 'debug'], description: 'Log level' })
  @ApiQuery({ name: 'limit', type: 'number', description: 'Number of logs to retrieve' })
  @ApiResponse({
    status: 200,
    description: 'System logs retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getSystemLogs(
    @Query('level') level: string = 'info',
    @Query('limit') limit: number = 100,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return await this.adminService.getSystemLogs(level, limit, adminId);
  }

  // Dashboard charts
  @Get('dashboard/charts')
  @ApiOperation({ summary: 'Get dashboard charts data' })
  @ApiQuery({ name: 'period', enum: ['7d', '30d', '90d', '1y'], required: false })
  @ApiResponse({ status: 200, description: 'Charts data retrieved successfully' })
  async getDashboardCharts(
    @Query('period') period: string = '30d',
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return await this.adminDashboardService.getDashboardCharts(adminId, period);
  }

  // Quick stats
  @Get('dashboard/quick-stats')
  @ApiOperation({ summary: 'Get quick stats for today vs yesterday' })
  @ApiResponse({ status: 200, description: 'Quick stats retrieved successfully' })
  async getQuickStats(@Req() req: any) {
    const adminId = req.user.id;
    return await this.adminDashboardService.getQuickStats(adminId);
  }

  // Fee analytics report
  @Get('fees/analytics')
  @ApiOperation({ summary: 'Get fee analytics and trends' })
  @ApiResponse({ status: 200, description: 'Fee analytics retrieved successfully' })
  async getFeeAnalytics(@Req() req: any) {
    const adminId = req.user.id;
    return await this.adminFeeManagementService.getFeeAnalytics(adminId);
  }

  // Fee calculation helper
  @Post('fees/calculate')
  @ApiOperation({ summary: 'Calculate fee breakdown for a given amount and method' })
  @ApiResponse({ status: 200, description: 'Fee calculation successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async calculateFees(
    @Body() body: FeeCalculationDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    // adminId not used in service calculation currently, kept for auditing if needed
    return await this.adminFeeManagementService.calculateFees(body.amount, body.paymentMethod, body.userRole);
  }

  private getContentType(format: string): string {
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
} 