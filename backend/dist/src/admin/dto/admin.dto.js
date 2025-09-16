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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminActivityDto = exports.PaginatedResponseDto = exports.SystemLogDto = exports.SystemHealthDto = exports.ExportFormatDto = exports.DashboardStatsDto = exports.FeeCalculationDto = exports.FeeReportDto = exports.FeeConfigDto = exports.UserStatusDto = exports.UserUpdateDto = exports.UserFilterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UserFilterDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.UserFilterDto = UserFilterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Search term for username or email' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserFilterDto.prototype, "searchTerm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['admin', 'streamer', 'donor'], description: 'User role filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['admin', 'streamer', 'donor']),
    __metadata("design:type", String)
], UserFilterDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['active', 'inactive', 'suspended'], description: 'User status filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['active', 'inactive', 'suspended']),
    __metadata("design:type", String)
], UserFilterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Verification status filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserFilterDto.prototype, "isVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Page number for pagination' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UserFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Number of items per page' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UserFilterDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Start date for filtering' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UserFilterDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'End date for filtering' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UserFilterDto.prototype, "endDate", void 0);
class UserUpdateDto {
}
exports.UserUpdateDto = UserUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'User username' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'User email' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['admin', 'streamer', 'donor'], description: 'User role' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['admin', 'streamer', 'donor']),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'User first name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'User last name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Two-factor enabled flag' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserUpdateDto.prototype, "twoFactorEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['public', 'private', 'friends', 'friends_only'], description: 'Profile visibility' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['public', 'private', 'friends', 'friends_only']),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "profileVisibility", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Show email on profile' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserUpdateDto.prototype, "showEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Show phone on profile' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserUpdateDto.prototype, "showPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Show address on profile' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserUpdateDto.prototype, "showAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Show last login on profile' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserUpdateDto.prototype, "showLastLogin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'User profile information' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UserUpdateDto.prototype, "profile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'User settings' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UserUpdateDto.prototype, "settings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Token banking information for the user' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "bankToken", void 0);
class UserStatusDto {
}
exports.UserStatusDto = UserStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['active', 'inactive', 'suspended'], description: 'New user status' }),
    (0, class_validator_1.IsEnum)(['active', 'inactive', 'suspended']),
    __metadata("design:type", String)
], UserStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Reason for status change' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserStatusDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Admin notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserStatusDto.prototype, "adminNotes", void 0);
class FeeConfigDto {
}
exports.FeeConfigDto = FeeConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Platform fee percentage' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], FeeConfigDto.prototype, "platformFeePercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minimum platform fee amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FeeConfigDto.prototype, "minimumFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum platform fee amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FeeConfigDto.prototype, "maximumFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment processor fee percentage' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], FeeConfigDto.prototype, "processorFeePercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fixed processing fee' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FeeConfigDto.prototype, "fixedProcessingFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency for fees' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FeeConfigDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Additional fee rules' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FeeConfigDto.prototype, "additionalRules", void 0);
class FeeReportDto {
    constructor() {
        this.period = '30d';
    }
}
exports.FeeReportDto = FeeReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['7d', '30d', '90d', '1y'], description: 'Report period' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['7d', '30d', '90d', '1y']),
    __metadata("design:type", String)
], FeeReportDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Start date for custom period' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FeeReportDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'End date for custom period' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FeeReportDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Payment method filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FeeReportDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'User role filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['admin', 'streamer', 'donor']),
    __metadata("design:type", String)
], FeeReportDto.prototype, "userRole", void 0);
class FeeCalculationDto {
}
exports.FeeCalculationDto = FeeCalculationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gross amount to calculate fees for' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], FeeCalculationDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method used (e.g., card, paypal, crypto)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FeeCalculationDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['admin', 'streamer', 'donor'], description: 'Optional user role to apply discounts' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['admin', 'streamer', 'donor']),
    __metadata("design:type", String)
], FeeCalculationDto.prototype, "userRole", void 0);
class DashboardStatsDto {
}
exports.DashboardStatsDto = DashboardStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total users count' }),
    __metadata("design:type", Number)
], DashboardStatsDto.prototype, "totalUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Active users count' }),
    __metadata("design:type", Number)
], DashboardStatsDto.prototype, "activeUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total transactions count' }),
    __metadata("design:type", Number)
], DashboardStatsDto.prototype, "totalTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total revenue' }),
    __metadata("design:type", Number)
], DashboardStatsDto.prototype, "totalRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Platform fees collected' }),
    __metadata("design:type", Number)
], DashboardStatsDto.prototype, "platformFees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pending disputes count' }),
    __metadata("design:type", Number)
], DashboardStatsDto.prototype, "pendingDisputes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recent growth metrics' }),
    __metadata("design:type", Object)
], DashboardStatsDto.prototype, "growthMetrics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'System health status' }),
    __metadata("design:type", Object)
], DashboardStatsDto.prototype, "systemHealth", void 0);
class ExportFormatDto {
}
exports.ExportFormatDto = ExportFormatDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['users', 'transactions', 'donations', 'reports'], description: 'Data type to export' }),
    (0, class_validator_1.IsEnum)(['users', 'transactions', 'donations', 'reports']),
    __metadata("design:type", String)
], ExportFormatDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Export filters' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ExportFormatDto.prototype, "filters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Custom fields to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ExportFormatDto.prototype, "fields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Sort order' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ExportFormatDto.prototype, "sort", void 0);
class SystemHealthDto {
}
exports.SystemHealthDto = SystemHealthDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Overall system status' }),
    __metadata("design:type", String)
], SystemHealthDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Database connection status' }),
    __metadata("design:type", Object)
], SystemHealthDto.prototype, "database", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Redis connection status' }),
    __metadata("design:type", Object)
], SystemHealthDto.prototype, "redis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'External services status' }),
    __metadata("design:type", Object)
], SystemHealthDto.prototype, "externalServices", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'System metrics' }),
    __metadata("design:type", Object)
], SystemHealthDto.prototype, "metrics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last updated timestamp' }),
    __metadata("design:type", Date)
], SystemHealthDto.prototype, "lastUpdated", void 0);
class SystemLogDto {
}
exports.SystemLogDto = SystemLogDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Log timestamp' }),
    __metadata("design:type", Date)
], SystemLogDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['error', 'warn', 'info', 'debug'], description: 'Log level' }),
    __metadata("design:type", String)
], SystemLogDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Log message' }),
    __metadata("design:type", String)
], SystemLogDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Log context' }),
    __metadata("design:type", String)
], SystemLogDto.prototype, "context", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Additional metadata' }),
    __metadata("design:type", Object)
], SystemLogDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'User ID if applicable' }),
    __metadata("design:type", String)
], SystemLogDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Request ID if applicable' }),
    __metadata("design:type", String)
], SystemLogDto.prototype, "requestId", void 0);
class PaginatedResponseDto {
}
exports.PaginatedResponseDto = PaginatedResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of items' }),
    __metadata("design:type", Array)
], PaginatedResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of items' }),
    __metadata("design:type", Number)
], PaginatedResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page number' }),
    __metadata("design:type", Number)
], PaginatedResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of items per page' }),
    __metadata("design:type", Number)
], PaginatedResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of pages' }),
    __metadata("design:type", Number)
], PaginatedResponseDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there is a next page' }),
    __metadata("design:type", Boolean)
], PaginatedResponseDto.prototype, "hasNext", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there is a previous page' }),
    __metadata("design:type", Boolean)
], PaginatedResponseDto.prototype, "hasPrev", void 0);
class AdminActivityDto {
}
exports.AdminActivityDto = AdminActivityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Activity ID' }),
    __metadata("design:type", String)
], AdminActivityDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin user ID' }),
    __metadata("design:type", String)
], AdminActivityDto.prototype, "adminId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Activity type' }),
    __metadata("design:type", String)
], AdminActivityDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Activity description' }),
    __metadata("design:type", String)
], AdminActivityDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target resource type' }),
    __metadata("design:type", String)
], AdminActivityDto.prototype, "resourceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target resource ID' }),
    __metadata("design:type", String)
], AdminActivityDto.prototype, "resourceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Activity metadata' }),
    __metadata("design:type", Object)
], AdminActivityDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Activity timestamp' }),
    __metadata("design:type", Date)
], AdminActivityDto.prototype, "timestamp", void 0);
//# sourceMappingURL=admin.dto.js.map