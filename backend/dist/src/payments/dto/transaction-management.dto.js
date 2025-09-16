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
exports.TransactionStatsDto = exports.TransactionExportDto = exports.TransactionActionDto = exports.ManualAdjustmentDto = exports.DisputeHandlingDto = exports.TransactionListResponseDto = exports.TransactionFilterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const transaction_schema_1 = require("../schemas/transaction.schema");
class TransactionFilterDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.TransactionFilterDto = TransactionFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search term for user name, transaction ID, or description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionFilterDto.prototype, "searchTerm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: transaction_schema_1.TransactionStatus, description: 'Filter by transaction status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(transaction_schema_1.TransactionStatus),
    __metadata("design:type", String)
], TransactionFilterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: transaction_schema_1.TransactionType, description: 'Filter by transaction type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(transaction_schema_1.TransactionType),
    __metadata("design:type", String)
], TransactionFilterDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: transaction_schema_1.PaymentMethod, description: 'Filter by payment method' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(transaction_schema_1.PaymentMethod),
    __metadata("design:type", String)
], TransactionFilterDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: transaction_schema_1.DisputeStatus, description: 'Filter by dispute status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(transaction_schema_1.DisputeStatus),
    __metadata("design:type", String)
], TransactionFilterDto.prototype, "disputeStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start date for filtering (ISO string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TransactionFilterDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End date for filtering (ISO string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TransactionFilterDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User ID to filter transactions' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionFilterDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number for pagination', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TransactionFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of items per page', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TransactionFilterDto.prototype, "limit", void 0);
class TransactionListResponseDto {
}
exports.TransactionListResponseDto = TransactionListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of transactions' }),
    __metadata("design:type", Array)
], TransactionListResponseDto.prototype, "transactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of transactions' }),
    __metadata("design:type", Number)
], TransactionListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page' }),
    __metadata("design:type", Number)
], TransactionListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of items per page' }),
    __metadata("design:type", Number)
], TransactionListResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of pages' }),
    __metadata("design:type", Number)
], TransactionListResponseDto.prototype, "totalPages", void 0);
class DisputeHandlingDto {
}
exports.DisputeHandlingDto = DisputeHandlingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction ID to handle dispute' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DisputeHandlingDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: transaction_schema_1.DisputeResolution, description: 'Resolution action for the dispute' }),
    (0, class_validator_1.IsEnum)(transaction_schema_1.DisputeResolution),
    __metadata("design:type", String)
], DisputeHandlingDto.prototype, "resolution", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Admin notes about the resolution' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], DisputeHandlingDto.prototype, "adminNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Partial refund amount if resolution is partial_refund' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], DisputeHandlingDto.prototype, "partialRefundAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional reason for the resolution' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], DisputeHandlingDto.prototype, "resolutionReason", void 0);
class ManualAdjustmentDto {
}
exports.ManualAdjustmentDto = ManualAdjustmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction ID to adjust' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ManualAdjustmentDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Adjustment amount (positive for credit, negative for debit)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ManualAdjustmentDto.prototype, "adjustmentAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for the adjustment' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], ManualAdjustmentDto.prototype, "adjustmentReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional notes about the adjustment' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], ManualAdjustmentDto.prototype, "adminNotes", void 0);
class TransactionActionDto {
}
exports.TransactionActionDto = TransactionActionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction ID to perform action on' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionActionDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action to perform (approve, reject, cancel, etc.)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionActionDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for the action' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], TransactionActionDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Admin notes about the action' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], TransactionActionDto.prototype, "adminNotes", void 0);
class TransactionExportDto {
    constructor() {
        this.format = 'csv';
    }
}
exports.TransactionExportDto = TransactionExportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Export format (csv, pdf, excel)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionExportDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter criteria for export' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", TransactionFilterDto)
], TransactionExportDto.prototype, "filters", void 0);
class TransactionStatsDto {
}
exports.TransactionStatsDto = TransactionStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of transactions' }),
    __metadata("design:type", Number)
], TransactionStatsDto.prototype, "totalTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total transaction volume' }),
    __metadata("design:type", Number)
], TransactionStatsDto.prototype, "totalVolume", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of pending transactions' }),
    __metadata("design:type", Number)
], TransactionStatsDto.prototype, "pendingTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of disputed transactions' }),
    __metadata("design:type", Number)
], TransactionStatsDto.prototype, "disputedTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of failed transactions' }),
    __metadata("design:type", Number)
], TransactionStatsDto.prototype, "failedTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average transaction amount' }),
    __metadata("design:type", Number)
], TransactionStatsDto.prototype, "averageAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total processing fees' }),
    __metadata("design:type", Number)
], TransactionStatsDto.prototype, "totalFees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction volume by type' }),
    __metadata("design:type", Object)
], TransactionStatsDto.prototype, "volumeByType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction count by status' }),
    __metadata("design:type", Object)
], TransactionStatsDto.prototype, "countByStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction volume by payment method' }),
    __metadata("design:type", Object)
], TransactionStatsDto.prototype, "volumeByPaymentMethod", void 0);
//# sourceMappingURL=transaction-management.dto.js.map