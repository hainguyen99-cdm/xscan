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
exports.ReportingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reporting_service_1 = require("./reporting.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_enum_1 = require("../common/enums/roles.enum");
let ReportingController = class ReportingController {
    constructor(reportingService) {
        this.reportingService = reportingService;
    }
    async generateRevenueReport(period = '30d') {
        return this.reportingService.generateRevenueReport(period);
    }
    async generateGrowthReport(period = '30d') {
        return this.reportingService.generateGrowthReport(period);
    }
    async generateComprehensiveReport(period = '30d') {
        return this.reportingService.generateComprehensiveReport(period);
    }
    async exportData(format, period = '30d') {
        return this.reportingService.exportData(period, format);
    }
    async getDashboardData(period = '30d') {
        const [revenue, growth] = await Promise.all([
            this.reportingService.generateRevenueReport(period),
            this.reportingService.generateGrowthReport(period)
        ]);
        return {
            revenue,
            growth,
            period: period
        };
    }
};
exports.ReportingController = ReportingController;
__decorate([
    (0, common_1.Get)('revenue'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Generate revenue report' }),
    (0, swagger_1.ApiQuery)({ name: 'period', enum: ['7d', '30d', '90d'], description: 'Report period' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Revenue report generated successfully',
        schema: {
            type: 'object',
            properties: {
                totalRevenue: { type: 'number' },
                platformFees: { type: 'number' },
                netRevenue: { type: 'number' },
                donationSources: {
                    type: 'object',
                    properties: {
                        paypal: { type: 'number' },
                        stripe: { type: 'number' },
                        crypto: { type: 'number' },
                        other: { type: 'number' }
                    }
                },
                monthlyTrends: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            month: { type: 'string' },
                            revenue: { type: 'number' },
                            growth: { type: 'number' }
                        }
                    }
                },
                period: { type: 'string' }
            }
        }
    }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "generateRevenueReport", null);
__decorate([
    (0, common_1.Get)('growth'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Generate growth statistics report' }),
    (0, swagger_1.ApiQuery)({ name: 'period', enum: ['7d', '30d', '90d'], description: 'Report period' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Growth report generated successfully',
        schema: {
            type: 'object',
            properties: {
                revenueGrowth: { type: 'number' },
                userGrowth: { type: 'number' },
                transactionGrowth: { type: 'number' },
                avgDonationGrowth: { type: 'number' },
                conversionRateGrowth: { type: 'number' },
                period: { type: 'string' },
                previousPeriod: { type: 'string' }
            }
        }
    }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "generateGrowthReport", null);
__decorate([
    (0, common_1.Get)('comprehensive'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Generate comprehensive business report' }),
    (0, swagger_1.ApiQuery)({ name: 'period', enum: ['7d', '30d', '90d'], description: 'Report period' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Comprehensive report generated successfully'
    }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "generateComprehensiveReport", null);
__decorate([
    (0, common_1.Get)('export/:format'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Export data in specified format' }),
    (0, swagger_1.ApiParam)({ name: 'format', enum: ['csv', 'json'], description: 'Export format' }),
    (0, swagger_1.ApiQuery)({ name: 'period', enum: ['7d', '30d', '90d'], description: 'Data period' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data exported successfully'
    }),
    __param(0, (0, common_1.Param)('format')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "exportData", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get reporting dashboard data' }),
    (0, swagger_1.ApiQuery)({ name: 'period', enum: ['7d', '30d', '90d'], description: 'Dashboard period' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dashboard data retrieved successfully'
    }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getDashboardData", null);
exports.ReportingController = ReportingController = __decorate([
    (0, swagger_1.ApiTags)('Reporting'),
    (0, common_1.Controller)('reporting'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [reporting_service_1.ReportingService])
], ReportingController);
//# sourceMappingURL=reporting.controller.js.map