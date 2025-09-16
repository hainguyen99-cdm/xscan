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
exports.DonationComparisonQueryDto = exports.DonationTrendsQueryDto = exports.DonationAnalyticsQueryDto = exports.TopDonorsQueryDto = exports.DonationHistoryQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class DonationHistoryQueryDto {
    constructor() {
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
        this.limit = 20;
        this.page = 1;
    }
}
exports.DonationHistoryQueryDto = DonationHistoryQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Filter by streamer ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationHistoryQueryDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Filter by donor ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationHistoryQueryDto.prototype, "donorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Filter by donation status',
        enum: ['pending', 'completed', 'failed', 'cancelled'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['pending', 'completed', 'failed', 'cancelled']),
    __metadata("design:type", String)
], DonationHistoryQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Filter by payment method',
        enum: ['wallet', 'stripe', 'paypal', 'bank_transfer'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['wallet', 'stripe', 'paypal', 'bank_transfer']),
    __metadata("design:type", String)
], DonationHistoryQueryDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Filter by currency',
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY']),
    __metadata("design:type", String)
], DonationHistoryQueryDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Minimum donation amount',
        minimum: 0.01,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    __metadata("design:type", Number)
], DonationHistoryQueryDto.prototype, "minAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Maximum donation amount',
        minimum: 0.01,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    __metadata("design:type", Number)
], DonationHistoryQueryDto.prototype, "maxAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Start date (ISO string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DonationHistoryQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'End date (ISO string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DonationHistoryQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Filter anonymous donations' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    __metadata("design:type", Boolean)
], DonationHistoryQueryDto.prototype, "isAnonymous", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Sort field',
        enum: ['createdAt', 'amount', 'status', 'paymentMethod'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['createdAt', 'amount', 'status', 'paymentMethod']),
    __metadata("design:type", String)
], DonationHistoryQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Sort order',
        enum: ['asc', 'desc'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], DonationHistoryQueryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Number of results per page',
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], DonationHistoryQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Page number', minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], DonationHistoryQueryDto.prototype, "page", void 0);
class TopDonorsQueryDto {
    constructor() {
        this.limit = 10;
    }
}
exports.TopDonorsQueryDto = TopDonorsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Number of top donors to return',
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], TopDonorsQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Time range',
        enum: ['24h', '7d', '30d', '90d'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['24h', '7d', '30d', '90d']),
    __metadata("design:type", String)
], TopDonorsQueryDto.prototype, "timeRange", void 0);
class DonationAnalyticsQueryDto {
}
exports.DonationAnalyticsQueryDto = DonationAnalyticsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Filter by streamer ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationAnalyticsQueryDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Time range',
        enum: ['24h', '7d', '30d', '90d'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['24h', '7d', '30d', '90d']),
    __metadata("design:type", String)
], DonationAnalyticsQueryDto.prototype, "timeRange", void 0);
class DonationTrendsQueryDto {
    constructor() {
        this.period = 'daily';
        this.days = 30;
    }
}
exports.DonationTrendsQueryDto = DonationTrendsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Filter by streamer ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationTrendsQueryDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Time period',
        enum: ['hourly', 'daily', 'weekly', 'monthly'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['hourly', 'daily', 'weekly', 'monthly']),
    __metadata("design:type", String)
], DonationTrendsQueryDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Number of days to analyze',
        minimum: 1,
        maximum: 365,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(365),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], DonationTrendsQueryDto.prototype, "days", void 0);
class DonationComparisonQueryDto {
    constructor() {
        this.currentPeriod = '30d';
        this.previousPeriod = '30d';
    }
}
exports.DonationComparisonQueryDto = DonationComparisonQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Filter by streamer ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationComparisonQueryDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Current period',
        enum: ['24h', '7d', '30d', '90d'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['24h', '7d', '30d', '90d']),
    __metadata("design:type", String)
], DonationComparisonQueryDto.prototype, "currentPeriod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Previous period',
        enum: ['24h', '7d', '30d', '90d'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['24h', '7d', '30d', '90d']),
    __metadata("design:type", String)
], DonationComparisonQueryDto.prototype, "previousPeriod", void 0);
//# sourceMappingURL=donation-history.dto.js.map