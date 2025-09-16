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
exports.AdminFeeManagementService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const transaction_schema_1 = require("../payments/schemas/transaction.schema");
let AdminFeeManagementService = class AdminFeeManagementService {
    constructor(transactionModel) {
        this.transactionModel = transactionModel;
    }
    async getFeeConfig(adminId) {
        return {
            platformFeePercentage: 5.0,
            minimumFee: 0.50,
            maximumFee: 10.00,
            processorFeePercentage: 2.9,
            fixedProcessingFee: 0.30,
            currency: 'VND',
            additionalRules: {
                cryptoDiscount: 0.5,
                volumeDiscounts: {
                    '1000': 0.25,
                    '5000': 0.5,
                },
                subscriptionDiscount: 0.1,
            },
        };
    }
    async updateFeeConfig(feeConfig, adminId) {
        if (feeConfig.platformFeePercentage < 0 || feeConfig.platformFeePercentage > 100) {
            throw new common_1.BadRequestException('Platform fee percentage must be between 0 and 100');
        }
        if (feeConfig.processorFeePercentage < 0 || feeConfig.processorFeePercentage > 100) {
            throw new common_1.BadRequestException('Processor fee percentage must be between 0 and 100');
        }
        if (feeConfig.minimumFee < 0) {
            throw new common_1.BadRequestException('Minimum fee cannot be negative');
        }
        if (feeConfig.maximumFee < feeConfig.minimumFee) {
            throw new common_1.BadRequestException('Maximum fee cannot be less than minimum fee');
        }
        if (feeConfig.fixedProcessingFee < 0) {
            throw new common_1.BadRequestException('Fixed processing fee cannot be negative');
        }
        console.log(`Admin ${adminId} updated fee configuration:`, feeConfig);
        return feeConfig;
    }
    async getFeeReports(reportData, adminId) {
        const { period = '30d', startDate, endDate, paymentMethod, userRole } = reportData;
        const now = new Date();
        let reportStartDate;
        let reportEndDate = now;
        if (startDate && endDate) {
            reportStartDate = new Date(startDate);
            reportEndDate = new Date(endDate);
        }
        else {
            switch (period) {
                case '7d':
                    reportStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    reportStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    reportStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case '1y':
                    reportStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    reportStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
        }
        const query = {
            status: 'completed',
            createdAt: { $gte: reportStartDate, $lte: reportEndDate },
        };
        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }
        const [totalFees, feeByPaymentMethod, feeByDay, feeByUserRole, averageFee, feeDistribution,] = await Promise.all([
            this.transactionModel.aggregate([
                { $match: query },
                { $group: { _id: null, total: { $sum: '$platformFee' } } },
            ]),
            this.transactionModel.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$paymentMethod',
                        total: { $sum: '$platformFee' },
                        count: { $sum: 1 },
                        average: { $avg: '$platformFee' },
                    },
                },
                { $sort: { total: -1 } },
            ]),
            this.transactionModel.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                        },
                        total: { $sum: '$platformFee' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { '_id': 1 } },
            ]),
            this.transactionModel.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                { $unwind: '$user' },
                {
                    $group: {
                        _id: '$user.role',
                        total: { $sum: '$platformFee' },
                        count: { $sum: 1 },
                        average: { $avg: '$platformFee' },
                    },
                },
                { $sort: { total: -1 } },
            ]),
            this.transactionModel.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        average: { $avg: '$platformFee' },
                        min: { $min: '$platformFee' },
                        max: { $max: '$platformFee' },
                    },
                },
            ]),
            this.transactionModel.aggregate([
                { $match: query },
                {
                    $bucket: {
                        groupBy: '$platformFee',
                        boundaries: [0, 1, 5, 10, 25, 50, 100],
                        default: '100+',
                        output: {
                            count: { $sum: 1 },
                            total: { $sum: '$platformFee' },
                        },
                    },
                },
            ]),
        ]);
        const totalRevenue = await this.transactionModel.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const feeEfficiency = totalRevenue[0]?.total > 0
            ? (totalFees[0]?.total / totalRevenue[0]?.total) * 100
            : 0;
        const previousPeriodStart = new Date(reportStartDate.getTime() - (reportEndDate.getTime() - reportStartDate.getTime()));
        const previousPeriodFees = await this.transactionModel.aggregate([
            {
                $match: {
                    ...query,
                    createdAt: { $gte: previousPeriodStart, $lt: reportStartDate },
                },
            },
            { $group: { _id: null, total: { $sum: '$platformFee' } } },
        ]);
        const feeGrowth = previousPeriodFees[0]?.total > 0
            ? ((totalFees[0]?.total - previousPeriodFees[0]?.total) / previousPeriodFees[0]?.total) * 100
            : 0;
        return {
            summary: {
                totalFees: totalFees[0]?.total || 0,
                totalTransactions: await this.transactionModel.countDocuments(query),
                averageFee: averageFee[0]?.average || 0,
                minFee: averageFee[0]?.min || 0,
                maxFee: averageFee[0]?.max || 0,
                feeEfficiency: Math.round(feeEfficiency * 100) / 100,
                feeGrowth: Math.round(feeGrowth * 100) / 100,
            },
            breakdown: {
                byPaymentMethod: feeByPaymentMethod,
                byDay: feeByDay,
                byUserRole: feeByUserRole,
                distribution: feeDistribution,
            },
            period: {
                start: reportStartDate,
                end: reportEndDate,
                duration: period,
            },
            comparison: {
                previousPeriod: {
                    total: previousPeriodFees[0]?.total || 0,
                    growth: feeGrowth,
                },
            },
        };
    }
    async calculateFees(amount, paymentMethod, userRole) {
        const config = await this.getFeeConfig('system');
        let platformFee = (amount * config.platformFeePercentage) / 100;
        platformFee = Math.max(platformFee, config.minimumFee);
        platformFee = Math.min(platformFee, config.maximumFee);
        if (paymentMethod === 'crypto' && config.additionalRules?.cryptoDiscount) {
            platformFee *= (1 - config.additionalRules.cryptoDiscount);
        }
        if (config.additionalRules?.volumeDiscounts) {
            for (const [threshold, discount] of Object.entries(config.additionalRules.volumeDiscounts)) {
                if (amount >= parseFloat(threshold)) {
                    platformFee *= (1 - discount);
                    break;
                }
            }
        }
        if (userRole === 'streamer' && config.additionalRules?.subscriptionDiscount) {
            platformFee *= (1 - config.additionalRules.subscriptionDiscount);
        }
        const processorFee = (amount * config.processorFeePercentage) / 100 + config.fixedProcessingFee;
        const netAmount = amount - platformFee - processorFee;
        return {
            grossAmount: amount,
            platformFee: Math.round(platformFee * 100) / 100,
            processorFee: Math.round(processorFee * 100) / 100,
            netAmount: Math.round(netAmount * 100) / 100,
            feeBreakdown: {
                platformFeePercentage: config.platformFeePercentage,
                processorFeePercentage: config.processorFeePercentage,
                fixedProcessingFee: config.fixedProcessingFee,
                appliedDiscounts: {
                    crypto: paymentMethod === 'crypto' ? config.additionalRules?.cryptoDiscount : 0,
                    volume: this.getVolumeDiscount(amount, config.additionalRules?.volumeDiscounts),
                    subscription: userRole === 'streamer' ? config.additionalRules?.subscriptionDiscount : 0,
                },
            },
        };
    }
    getVolumeDiscount(amount, volumeDiscounts) {
        if (!volumeDiscounts)
            return 0;
        for (const [threshold, discount] of Object.entries(volumeDiscounts)) {
            if (amount >= parseFloat(threshold)) {
                return discount;
            }
        }
        return 0;
    }
    async getFeeAnalytics(adminId) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const feeTrends = await this.transactionModel.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    totalFees: { $sum: '$platformFee' },
                    transactionCount: { $sum: 1 },
                    averageFee: { $avg: '$platformFee' },
                },
            },
            { $sort: { '_id': 1 } },
        ]);
        const topPaymentMethods = await this.transactionModel.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    totalFees: { $sum: '$platformFee' },
                    transactionCount: { $sum: 1 },
                    averageFee: { $avg: '$platformFee' },
                },
            },
            { $sort: { totalFees: -1 } },
            { $limit: 5 },
        ]);
        const feeByDayOfWeek = await this.transactionModel.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $dayOfWeek: '$createdAt' },
                    totalFees: { $sum: '$platformFee' },
                    totalRevenue: { $sum: '$amount' },
                    transactionCount: { $sum: 1 },
                },
            },
            {
                $addFields: {
                    feeEfficiency: {
                        $multiply: [
                            { $divide: ['$totalFees', '$totalRevenue'] },
                            100,
                        ],
                    },
                },
            },
            { $sort: { '_id': 1 } },
        ]);
        return {
            trends: feeTrends,
            topPaymentMethods,
            feeByDayOfWeek,
            period: {
                start: thirtyDaysAgo,
                end: now,
                days: 30,
            },
        };
    }
};
exports.AdminFeeManagementService = AdminFeeManagementService;
exports.AdminFeeManagementService = AdminFeeManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AdminFeeManagementService);
//# sourceMappingURL=admin-fee-management.service.js.map