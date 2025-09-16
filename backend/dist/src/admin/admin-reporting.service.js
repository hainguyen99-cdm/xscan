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
exports.AdminReportingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const transaction_schema_1 = require("../payments/schemas/transaction.schema");
const donation_schema_1 = require("../donations/schemas/donation.schema");
const obs_settings_schema_1 = require("../obs-settings/obs-settings.schema");
let AdminReportingService = class AdminReportingService {
    constructor(userModel, transactionModel, donationModel, obsSettingsModel) {
        this.userModel = userModel;
        this.transactionModel = transactionModel;
        this.donationModel = donationModel;
        this.obsSettingsModel = obsSettingsModel;
    }
    async generateRevenueReport(period, adminId) {
        const { startDate, endDate } = this.getDateRange(period);
        const [totalRevenue, revenueByPaymentMethod, revenueByDay, revenueByUserRole, revenueByCurrency, monthlyTrends,] = await Promise.all([
            this.transactionModel.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.transactionModel.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
                {
                    $group: {
                        _id: '$paymentMethod',
                        total: { $sum: '$amount' },
                        count: { $sum: 1 },
                        average: { $avg: '$amount' },
                    },
                },
                { $sort: { total: -1 } },
            ]),
            this.transactionModel.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                        },
                        total: { $sum: '$amount' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { '_id': 1 } },
            ]),
            this.transactionModel.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
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
                        total: { $sum: '$amount' },
                        count: { $sum: 1 },
                        average: { $avg: '$amount' },
                    },
                },
                { $sort: { total: -1 } },
            ]),
            this.transactionModel.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
                {
                    $group: {
                        _id: '$currency',
                        total: { $sum: '$amount' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { total: -1 } },
            ]),
            this.transactionModel.aggregate([
                {
                    $match: {
                        status: 'completed',
                        createdAt: { $gte: new Date(startDate.getTime() - 365 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m', date: '$createdAt' }
                        },
                        revenue: { $sum: '$amount' },
                        growth: { $sum: '$amount' },
                    },
                },
                { $sort: { '_id': 1 } },
            ]),
        ]);
        const monthlyTrendsWithGrowth = monthlyTrends.map((month, index) => {
            const previousMonth = monthlyTrends[index - 1];
            const growth = previousMonth && previousMonth.revenue > 0
                ? ((month.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
                : 0;
            return {
                month: month._id,
                revenue: month.revenue,
                growth: Math.round(growth * 100) / 100,
            };
        });
        const platformFees = await this.transactionModel.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$platformFee' } } },
        ]);
        return {
            summary: {
                totalRevenue: totalRevenue[0]?.total || 0,
                platformFees: platformFees[0]?.total || 0,
                netRevenue: (totalRevenue[0]?.total || 0) - (platformFees[0]?.total || 0),
                totalTransactions: await this.transactionModel.countDocuments({
                    status: 'completed',
                    createdAt: { $gte: startDate, $lte: endDate }
                }),
            },
            breakdown: {
                byPaymentMethod: revenueByPaymentMethod,
                byDay: revenueByDay,
                byUserRole: revenueByUserRole,
                byCurrency: revenueByCurrency,
            },
            trends: {
                monthly: monthlyTrendsWithGrowth,
            },
            period: {
                start: startDate,
                end: endDate,
                duration: period,
            },
        };
    }
    async generateGrowthReport(period, adminId) {
        const { startDate, endDate } = this.getDateRange(period);
        const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
        const previousPeriodEnd = startDate;
        const [currentUsers, currentRevenue, currentTransactions, currentDonations,] = await Promise.all([
            this.userModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
            this.transactionModel.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.transactionModel.countDocuments({
                status: 'completed',
                createdAt: { $gte: startDate, $lte: endDate }
            }),
            this.donationModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        ]);
        const [previousUsers, previousRevenue, previousTransactions, previousDonations,] = await Promise.all([
            this.userModel.countDocuments({ createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd } }),
            this.transactionModel.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.transactionModel.countDocuments({
                status: 'completed',
                createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd }
            }),
            this.donationModel.countDocuments({ createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd } }),
        ]);
        const userGrowth = previousUsers > 0
            ? ((currentUsers - previousUsers) / previousUsers) * 100
            : 0;
        const revenueGrowth = previousRevenue[0]?.total > 0
            ? ((currentRevenue[0]?.total - previousRevenue[0]?.total) / previousRevenue[0]?.total) * 100
            : 0;
        const transactionGrowth = previousTransactions > 0
            ? ((currentTransactions - previousTransactions) / previousTransactions) * 100
            : 0;
        const donationGrowth = previousDonations > 0
            ? ((currentDonations - previousDonations) / previousDonations) * 100
            : 0;
        const [currentAvgDonation, previousAvgDonation] = await Promise.all([
            this.transactionModel.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: null, average: { $avg: '$amount' } } },
            ]),
            this.transactionModel.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd } } },
                { $group: { _id: null, average: { $avg: '$amount' } } },
            ]),
        ]);
        const avgDonationGrowth = previousAvgDonation[0]?.average > 0
            ? ((currentAvgDonation[0]?.average - previousAvgDonation[0]?.average) / previousAvgDonation[0]?.average) * 100
            : 0;
        const [currentConvertingUsers, previousConvertingUsers] = await Promise.all([
            this.transactionModel.distinct('userId', {
                status: 'completed',
                createdAt: { $gte: startDate, $lte: endDate }
            }),
            this.transactionModel.distinct('userId', {
                status: 'completed',
                createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd }
            }),
        ]);
        const currentConversionRate = currentUsers > 0 ? (currentConvertingUsers.length / currentUsers) * 100 : 0;
        const previousConversionRate = previousUsers > 0 ? (previousConvertingUsers.length / previousUsers) * 100 : 0;
        const conversionRateGrowth = previousConversionRate > 0
            ? ((currentConversionRate - previousConversionRate) / previousConversionRate) * 100
            : 0;
        return {
            currentPeriod: {
                users: currentUsers,
                revenue: currentRevenue[0]?.total || 0,
                transactions: currentTransactions,
                donations: currentDonations,
                avgDonation: currentAvgDonation[0]?.average || 0,
                conversionRate: Math.round(currentConversionRate * 100) / 100,
            },
            previousPeriod: {
                users: previousUsers,
                revenue: previousRevenue[0]?.total || 0,
                transactions: previousTransactions,
                donations: previousDonations,
                avgDonation: previousAvgDonation[0]?.average || 0,
                conversionRate: Math.round(previousConversionRate * 100) / 100,
            },
            growth: {
                userGrowth: Math.round(userGrowth * 100) / 100,
                revenueGrowth: Math.round(revenueGrowth * 100) / 100,
                transactionGrowth: Math.round(transactionGrowth * 100) / 100,
                donationGrowth: Math.round(donationGrowth * 100) / 100,
                avgDonationGrowth: Math.round(avgDonationGrowth * 100) / 100,
                conversionRateGrowth: Math.round(conversionRateGrowth * 100) / 100,
            },
            period: {
                current: { start: startDate, end: endDate },
                previous: { start: previousPeriodStart, end: previousPeriodEnd },
                duration: period,
            },
        };
    }
    async generateComprehensiveReport(period, adminId) {
        const { startDate, endDate } = this.getDateRange(period);
        const [revenueReport, growthReport, userStats, transactionStats, donationStats, obsStats,] = await Promise.all([
            this.generateRevenueReport(period, adminId),
            this.generateGrowthReport(period, adminId),
            this.getUserStatistics(startDate, endDate),
            this.getTransactionStatistics(startDate, endDate),
            this.getDonationStatistics(startDate, endDate),
            this.getOBSStatistics(startDate, endDate),
        ]);
        return {
            revenue: revenueReport,
            growth: growthReport,
            users: userStats,
            transactions: transactionStats,
            donations: donationStats,
            obs: obsStats,
            summary: {
                period: { start: startDate, end: endDate, duration: period },
                generatedAt: new Date(),
                generatedBy: adminId,
            },
        };
    }
    async exportData(format, exportData, adminId) {
        const { type, filters, fields, sort } = exportData;
        let data = [];
        switch (type) {
            case 'users':
                data = await this.exportUsersData(filters, fields, sort);
                break;
            case 'transactions':
                data = await this.exportTransactionsData(filters, fields, sort);
                break;
            case 'donations':
                data = await this.exportDonationsData(filters, fields, sort);
                break;
            case 'reports':
                data = await this.exportReportsData(filters, fields, sort);
                break;
            default:
                throw new common_1.BadRequestException(`Unsupported export type: ${type}`);
        }
        switch (format.toLowerCase()) {
            case 'csv':
                return this.convertToCSV(data, fields);
            case 'json':
                return Buffer.from(JSON.stringify(data, null, 2));
            case 'pdf':
                return this.convertToPDF(data, type);
            case 'excel':
                return this.convertToExcel(data, fields);
            default:
                throw new common_1.BadRequestException(`Unsupported export format: ${format}`);
        }
    }
    async exportUsersData(filters, fields, sort) {
        const query = {};
        if (filters?.role)
            query.role = filters.role;
        if (filters?.status)
            query.status = filters.status;
        if (filters?.isVerified !== undefined)
            query.isVerified = filters.isVerified;
        if (filters?.startDate || filters?.endDate) {
            query.createdAt = {};
            if (filters.startDate)
                query.createdAt.$gte = new Date(filters.startDate);
            if (filters.endDate)
                query.createdAt.$lte = new Date(filters.endDate);
        }
        const users = await this.userModel
            .find(query)
            .select(fields?.length ? fields.join(' ') : '-password')
            .sort(sort || { createdAt: -1 })
            .exec();
        return users;
    }
    async exportTransactionsData(filters, fields, sort) {
        const query = { status: 'completed' };
        if (filters?.paymentMethod)
            query.paymentMethod = filters.paymentMethod;
        if (filters?.type)
            query.type = filters.type;
        if (filters?.startDate || filters?.endDate) {
            query.createdAt = {};
            if (filters.startDate)
                query.createdAt.$gte = new Date(filters.startDate);
            if (filters.endDate)
                query.createdAt.$lte = new Date(filters.endDate);
        }
        const transactions = await this.transactionModel
            .find(query)
            .populate('userId', 'username email')
            .populate('recipientId', 'username email')
            .sort(sort || { createdAt: -1 })
            .exec();
        return transactions;
    }
    async exportDonationsData(filters, fields, sort) {
        const query = {};
        if (filters?.startDate || filters?.endDate) {
            query.createdAt = {};
            if (filters.startDate)
                query.createdAt.$gte = new Date(filters.startDate);
            if (filters.endDate)
                query.createdAt.$lte = new Date(filters.endDate);
        }
        const donations = await this.donationModel
            .find(query)
            .populate('userId', 'username email')
            .sort(sort || { createdAt: -1 })
            .exec();
        return donations;
    }
    async exportReportsData(filters, fields, sort) {
        const { startDate, endDate } = this.getDateRange(filters?.period || '30d');
        const [revenue, growth, users] = await Promise.all([
            this.generateRevenueReport(filters?.period || '30d', 'system'),
            this.generateGrowthReport(filters?.period || '30d', 'system'),
            this.getUserStatistics(startDate, endDate),
        ]);
        return [{
                reportType: 'comprehensive',
                period: filters?.period || '30d',
                revenue,
                growth,
                users,
                generatedAt: new Date(),
            }];
    }
    async getUserStatistics(startDate, endDate) {
        const [totalUsers, newUsers, activeUsers, usersByRole, usersByStatus,] = await Promise.all([
            this.userModel.countDocuments(),
            this.userModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
            this.userModel.countDocuments({ status: 'active' }),
            this.userModel.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            this.userModel.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
        ]);
        return {
            total: totalUsers,
            new: newUsers,
            active: activeUsers,
            byRole: usersByRole,
            byStatus: usersByStatus,
        };
    }
    async getTransactionStatistics(startDate, endDate) {
        const [totalTransactions, completedTransactions, totalRevenue, transactionsByStatus, transactionsByPaymentMethod,] = await Promise.all([
            this.transactionModel.countDocuments(),
            this.transactionModel.countDocuments({
                status: 'completed',
                createdAt: { $gte: startDate, $lte: endDate }
            }),
            this.transactionModel.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.transactionModel.aggregate([
                { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            this.transactionModel.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } },
                { $sort: { total: -1 } },
            ]),
        ]);
        return {
            total: totalTransactions,
            completed: completedTransactions,
            revenue: totalRevenue[0]?.total || 0,
            byStatus: transactionsByStatus,
            byPaymentMethod: transactionsByPaymentMethod,
        };
    }
    async getDonationStatistics(startDate, endDate) {
        const [totalDonations, donationsInPeriod, totalAmount, donationsByStatus,] = await Promise.all([
            this.donationModel.countDocuments(),
            this.donationModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
            this.donationModel.aggregate([
                { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.donationModel.aggregate([
                { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
        ]);
        return {
            total: totalDonations,
            inPeriod: donationsInPeriod,
            amount: totalAmount[0]?.total || 0,
            byStatus: donationsByStatus,
        };
    }
    async getOBSStatistics(startDate, endDate) {
        const [totalSettings, activeSettings, settingsByStatus,] = await Promise.all([
            this.obsSettingsModel.countDocuments(),
            this.obsSettingsModel.countDocuments({ isActive: true }),
            this.obsSettingsModel.aggregate([
                { $group: { _id: '$isActive', count: { $sum: 1 } } },
            ]),
        ]);
        return {
            total: totalSettings,
            active: activeSettings,
            byStatus: settingsByStatus,
        };
    }
    getDateRange(period) {
        const now = new Date();
        let startDate;
        switch (period) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        return { startDate, endDate: now };
    }
    convertToCSV(data, fields) {
        if (data.length === 0) {
            return Buffer.from('No data available');
        }
        const headers = fields || Object.keys(data[0].toObject ? data[0].toObject() : data[0]);
        const csvRows = [headers.join(',')];
        for (const item of data) {
            const row = headers.map(header => {
                const value = this.getNestedValue(item, header);
                return `"${String(value || '').replace(/"/g, '""')}"`;
            });
            csvRows.push(row.join(','));
        }
        return Buffer.from(csvRows.join('\n'));
    }
    convertToPDF(data, type) {
        const content = `Report Type: ${type}\nGenerated: ${new Date().toISOString()}\n\n${data.map(item => JSON.stringify(item, null, 2)).join('\n\n')}`;
        return Buffer.from(content);
    }
    convertToExcel(data, fields) {
        return this.convertToCSV(data, fields);
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }
};
exports.AdminReportingService = AdminReportingService;
exports.AdminReportingService = AdminReportingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __param(2, (0, mongoose_1.InjectModel)(donation_schema_1.Donation.name)),
    __param(3, (0, mongoose_1.InjectModel)(obs_settings_schema_1.OBSSettings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AdminReportingService);
//# sourceMappingURL=admin-reporting.service.js.map