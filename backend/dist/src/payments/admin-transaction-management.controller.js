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
exports.AdminTransactionManagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transaction_management_service_1 = require("./transaction-management.service");
const transaction_management_dto_1 = require("./dto/transaction-management.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_enum_1 = require("../common/enums/roles.enum");
const transaction_schema_1 = require("./schemas/transaction.schema");
let AdminTransactionManagementController = class AdminTransactionManagementController {
    constructor(transactionManagementService) {
        this.transactionManagementService = transactionManagementService;
    }
    async getTransactions(filters, req) {
        const adminId = req.user.id;
        return await this.transactionManagementService.getTransactions(filters, adminId);
    }
    async getTransactionStats(req) {
        const adminId = req.user.id;
        return await this.transactionManagementService.getTransactionStats(adminId);
    }
    async getTransactionById(transactionId, req) {
        const adminId = req.user.id;
        return await this.transactionManagementService.getTransactionById(transactionId, adminId);
    }
    async handleDispute(disputeData, req) {
        const adminId = req.user.id;
        return await this.transactionManagementService.handleDispute(disputeData, adminId);
    }
    async makeManualAdjustment(adjustmentData, req) {
        const adminId = req.user.id;
        return await this.transactionManagementService.makeManualAdjustment(adjustmentData, adminId);
    }
    async performTransactionAction(actionData, req) {
        const adminId = req.user.id;
        return await this.transactionManagementService.performTransactionAction(actionData, adminId);
    }
    async bulkAction(body, req) {
        const { transactionIds, action, reason } = body;
        const adminId = req.user.id;
        if (!transactionIds || transactionIds.length === 0) {
            throw new common_1.BadRequestException('Transaction IDs are required');
        }
        if (!action) {
            throw new common_1.BadRequestException('Action is required');
        }
        return await this.transactionManagementService.bulkAction(transactionIds, action, adminId, reason);
    }
    async exportTransactions(exportData, req, res) {
        const adminId = req.user.id;
        const buffer = await this.transactionManagementService.exportTransactions(exportData, adminId);
        const format = exportData.format || 'csv';
        const filename = `transactions-${new Date().toISOString().split('T')[0]}.${format}`;
        res.set({
            'Content-Type': this.getContentType(format),
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(buffer);
    }
    async exportTransactionsCsv(filters, req, res) {
        const adminId = req.user.id;
        const buffer = await this.transactionManagementService.exportTransactions({ format: 'csv', filters }, adminId);
        const filename = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        res.set({
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(buffer);
    }
    async exportTransactionsPdf(filters, req, res) {
        const adminId = req.user.id;
        const buffer = await this.transactionManagementService.exportTransactions({ format: 'pdf', filters }, adminId);
        const filename = `transactions-${new Date().toISOString().split('T')[0]}.pdf`;
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(buffer);
    }
    async exportTransactionsExcel(filters, req, res) {
        const adminId = req.user.id;
        const buffer = await this.transactionManagementService.exportTransactions({ format: 'excel', filters }, adminId);
        const filename = `transactions-${new Date().toISOString().split('T')[0]}.xlsx`;
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(buffer);
    }
    async markTransactionAsDisputed(transactionId, body, req) {
        const adminId = req.user.id;
        const { reason, adminNotes } = body;
        if (!reason) {
            throw new common_1.BadRequestException('Dispute reason is required');
        }
        return await this.transactionManagementService.performTransactionAction({
            transactionId,
            action: 'mark_disputed',
            reason,
            adminNotes,
        }, adminId);
    }
    async investigateDispute(transactionId, body, req) {
        const adminId = req.user.id;
        const { adminNotes } = body;
        return await this.transactionManagementService.handleDispute({
            transactionId,
            resolution: transaction_schema_1.DisputeResolution.INVESTIGATION,
            adminNotes,
        }, adminId);
    }
    async getPendingDisputes(filters, req) {
        const adminId = req.user.id;
        const disputeFilters = {
            ...filters,
            status: transaction_schema_1.TransactionStatus.DISPUTED,
            disputeStatus: transaction_schema_1.DisputeStatus.OPEN,
        };
        return await this.transactionManagementService.getTransactions(disputeFilters, adminId);
    }
    async getDisputesUnderInvestigation(filters, req) {
        const adminId = req.user.id;
        const disputeFilters = {
            ...filters,
            status: transaction_schema_1.TransactionStatus.DISPUTED,
            disputeStatus: transaction_schema_1.DisputeStatus.UNDER_INVESTIGATION,
        };
        return await this.transactionManagementService.getTransactions(disputeFilters, adminId);
    }
    getContentType(format) {
        switch (format) {
            case 'csv':
                return 'text/csv';
            case 'pdf':
                return 'application/pdf';
            case 'excel':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            default:
                return 'application/octet-stream';
        }
    }
};
exports.AdminTransactionManagementController = AdminTransactionManagementController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get transactions with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transactions retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_management_dto_1.TransactionFilterDto, Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction statistics retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "getTransactionStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "getTransactionById", null);
__decorate([
    (0, common_1.Post)('dispute/handle'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle a transaction dispute' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dispute handled successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_management_dto_1.DisputeHandlingDto, Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "handleDispute", null);
__decorate([
    (0, common_1.Post)('adjustment'),
    (0, swagger_1.ApiOperation)({ summary: 'Make manual adjustment to transaction' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Adjustment made successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_management_dto_1.ManualAdjustmentDto, Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "makeManualAdjustment", null);
__decorate([
    (0, common_1.Post)('action'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform action on transaction (approve, reject, cancel, etc.)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Action performed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_management_dto_1.TransactionActionDto, Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "performTransactionAction", null);
__decorate([
    (0, common_1.Post)('bulk-action'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform bulk action on multiple transactions' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bulk action completed',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "bulkAction", null);
__decorate([
    (0, common_1.Post)('export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export transactions to CSV, PDF, or Excel' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Export completed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_management_dto_1.TransactionExportDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "exportTransactions", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, swagger_1.ApiOperation)({ summary: 'Export transactions to CSV with query parameters' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'CSV export completed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_management_dto_1.TransactionFilterDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "exportTransactionsCsv", null);
__decorate([
    (0, common_1.Get)('export/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Export transactions to PDF with query parameters' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'PDF export completed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_management_dto_1.TransactionFilterDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "exportTransactionsPdf", null);
__decorate([
    (0, common_1.Get)('export/excel'),
    (0, swagger_1.ApiOperation)({ summary: 'Export transactions to Excel with query parameters' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Excel export completed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_management_dto_1.TransactionFilterDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "exportTransactionsExcel", null);
__decorate([
    (0, common_1.Post)('dispute/:id/mark'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark transaction as disputed' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction marked as disputed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "markTransactionAsDisputed", null);
__decorate([
    (0, common_1.Post)('dispute/:id/investigate'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark dispute as under investigation' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dispute marked as under investigation successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "investigateDispute", null);
__decorate([
    (0, common_1.Get)('disputes/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all pending disputes' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pending disputes retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_management_dto_1.TransactionFilterDto, Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "getPendingDisputes", null);
__decorate([
    (0, common_1.Get)('disputes/under-investigation'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all disputes under investigation' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Disputes under investigation retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_management_dto_1.TransactionFilterDto, Object]),
    __metadata("design:returntype", Promise)
], AdminTransactionManagementController.prototype, "getDisputesUnderInvestigation", null);
exports.AdminTransactionManagementController = AdminTransactionManagementController = __decorate([
    (0, swagger_1.ApiTags)('admin-transaction-management'),
    (0, common_1.Controller)('admin/transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [transaction_management_service_1.TransactionManagementService])
], AdminTransactionManagementController);
//# sourceMappingURL=admin-transaction-management.controller.js.map