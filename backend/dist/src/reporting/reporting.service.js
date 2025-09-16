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
var ReportingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const donation_schema_1 = require("../donations/schemas/donation.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const donation_link_schema_1 = require("../donations/schemas/donation-link.schema");
const analytics_event_schema_1 = require("../donations/schemas/analytics-event.schema");
let ReportingService = ReportingService_1 = class ReportingService {
    constructor(donationModel, userModel, donationLinkModel, analyticsEventModel) {
        this.donationModel = donationModel;
        this.userModel = userModel;
        this.donationLinkModel = donationLinkModel;
        this.analyticsEventModel = analyticsEventModel;
        this.logger = new common_1.Logger(ReportingService_1.name);
    }
    async generateRevenueReport(period) {
        try {
            const { startDate, endDate } = this.getDateRange(period);
            const currentPeriodData = await this.getRevenueData(startDate, endDate);
            const previousStartDate = new Date(startDate);
            previousStartDate.setDate(previousStartDate.getDate() - this.getPeriodDays(period));
            const previousEndDate = new Date(startDate);
            const previousPeriodData = await this.getRevenueData(previousStartDate, previousEndDate);
            const revenueGrowth = previousPeriodData.totalRevenue > 0
                ? ((currentPeriodData.totalRevenue - previousPeriodData.totalRevenue) / previousPeriodData.totalRevenue) * 100
                : 0;
            const monthlyTrends = await this.generateMonthlyTrends();
            return {
                totalRevenue: currentPeriodData.totalRevenue,
                platformFees: currentPeriodData.platformFees,
                netRevenue: currentPeriodData.totalRevenue - currentPeriodData.platformFees,
                donationSources: currentPeriodData.donationSources,
                monthlyTrends,
                period: this.formatPeriod(period)
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate revenue report: ${error.message}`);
            throw error;
        }
    }
    async generateGrowthReport(period) {
        try {
            const { startDate, endDate } = this.getDateRange(period);
            const currentData = await this.getGrowthData(startDate, endDate);
            const previousStartDate = new Date(startDate);
            previousStartDate.setDate(previousStartDate.getDate() - this.getPeriodDays(period));
            const previousEndDate = new Date(startDate);
            const previousData = await this.getGrowthData(previousStartDate, previousEndDate);
            const revenueGrowth = this.calculateGrowth(currentData.revenue, previousData.revenue);
            const userGrowth = this.calculateGrowth(currentData.users, previousData.users);
            const transactionGrowth = this.calculateGrowth(currentData.transactions, previousData.transactions);
            const avgDonationGrowth = this.calculateGrowth(currentData.avgDonation, previousData.avgDonation);
            const conversionRateGrowth = this.calculateGrowth(currentData.conversionRate, previousData.conversionRate);
            return {
                revenueGrowth,
                userGrowth,
                transactionGrowth,
                avgDonationGrowth,
                conversionRateGrowth,
                period: this.formatPeriod(period),
                previousPeriod: this.formatPeriod(period, true)
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate growth report: ${error.message}`);
            throw error;
        }
    }
    async generateComprehensiveReport(period) {
        try {
            const [revenue, growth] = await Promise.all([
                this.generateRevenueReport(period),
                this.generateGrowthReport(period)
            ]);
            const { startDate, endDate } = this.getDateRange(period);
            const summary = await this.getSummaryData(startDate, endDate);
            const topDonors = await this.getTopDonors(startDate, endDate);
            const topCampaigns = await this.getTopCampaigns(startDate, endDate);
            return {
                period: this.formatPeriod(period),
                revenue,
                growth,
                summary,
                topDonors,
                topCampaigns
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate comprehensive report: ${error.message}`);
            throw error;
        }
    }
    async exportData(period, format) {
        try {
            const { startDate, endDate } = this.getDateRange(period);
            const data = await this.getExportData(startDate, endDate);
            if (format === 'csv') {
                return this.convertToCSV(data);
            }
            return data;
        }
        catch (error) {
            this.logger.error(`Failed to export data: ${error.message}`);
            throw error;
        }
    }
    async getRevenueData(startDate, endDate) {
        const donations = await this.donationModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    platformFees: { $sum: { $multiply: ['$amount', 0.08] } },
                    paypalAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentMethod', 'paypal'] }, '$amount', 0]
                        }
                    },
                    stripeAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentMethod', 'stripe'] }, '$amount', 0]
                        }
                    },
                    cryptoAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentMethod', 'crypto'] }, '$amount', 0]
                        }
                    }
                }
            }
        ]);
        const result = donations[0] || {
            totalRevenue: 0,
            platformFees: 0,
            paypalAmount: 0,
            stripeAmount: 0,
            cryptoAmount: 0
        };
        return {
            totalRevenue: result.totalRevenue,
            platformFees: result.platformFees,
            donationSources: {
                paypal: result.paypalAmount,
                stripe: result.stripeAmount,
                crypto: result.cryptoAmount,
                other: result.totalRevenue - result.paypalAmount - result.stripeAmount - result.cryptoAmount
            }
        };
    }
    async getGrowthData(startDate, endDate) {
        const [donations, users, analytics] = await Promise.all([
            this.donationModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: '$amount' },
                        transactions: { $sum: 1 },
                        avgDonation: { $avg: '$amount' }
                    }
                }
            ]),
            this.userModel.countDocuments({
                createdAt: { $gte: startDate, $lte: endDate }
            }),
            this.analyticsEventModel.aggregate([
                {
                    $match: {
                        timestamp: { $gte: startDate, $lte: endDate },
                        eventType: 'pageview'
                    }
                },
                {
                    $group: {
                        _id: '$donationLinkId',
                        uniqueVisitors: { $addToSet: '$visitorId' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalUniqueVisitors: { $sum: { $size: '$uniqueVisitors' } }
                    }
                }
            ])
        ]);
        const donationData = donations[0] || { revenue: 0, transactions: 0, avgDonation: 0 };
        const totalVisitors = analytics[0]?.totalUniqueVisitors || 0;
        const conversionRate = totalVisitors > 0 ? (donationData.transactions / totalVisitors) * 100 : 0;
        return {
            revenue: donationData.revenue,
            users,
            transactions: donationData.transactions,
            avgDonation: donationData.avgDonation,
            conversionRate
        };
    }
    async getSummaryData(startDate, endDate) {
        const [donations, users, analytics] = await Promise.all([
            this.donationModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$amount' },
                        transactions: { $sum: 1 },
                        avgDonation: { $avg: '$amount' },
                        fees: { $sum: { $multiply: ['$amount', 0.08] } }
                    }
                }
            ]),
            this.userModel.countDocuments({
                createdAt: { $gte: startDate, $lte: endDate }
            }),
            this.analyticsEventModel.aggregate([
                {
                    $match: {
                        timestamp: { $gte: startDate, $lte: endDate },
                        eventType: 'pageview'
                    }
                },
                {
                    $group: {
                        _id: '$donationLinkId',
                        uniqueVisitors: { $addToSet: '$visitorId' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalUniqueVisitors: { $sum: { $size: '$uniqueVisitors' } }
                    }
                }
            ])
        ]);
        const donationData = donations[0] || { totalRevenue: 0, transactions: 0, avgDonation: 0, fees: 0 };
        const totalVisitors = analytics[0]?.totalUniqueVisitors || 0;
        const conversionRate = totalVisitors > 0 ? (donationData.transactions / totalVisitors) * 100 : 0;
        const growth = 0;
        return {
            totalRevenue: donationData.totalRevenue,
            transactions: donationData.transactions,
            users,
            growth,
            fees: donationData.fees,
            donations: donationData.totalRevenue - donationData.fees,
            avgDonation: donationData.avgDonation,
            conversionRate
        };
    }
    async getTopDonors(startDate, endDate) {
        const donors = await this.donationModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$donorName',
                    totalAmount: { $sum: '$amount' },
                    lastDonation: { $max: '$createdAt' }
                }
            },
            {
                $sort: { totalAmount: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    name: '$_id',
                    amount: '$totalAmount',
                    date: '$lastDonation'
                }
            }
        ]);
        return donors.map(donor => ({
            name: donor.name || 'Anonymous',
            amount: donor.amount,
            date: donor.date.toISOString().split('T')[0]
        }));
    }
    async getTopCampaigns(startDate, endDate) {
        const campaigns = await this.donationModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'completed'
                }
            },
            {
                $lookup: {
                    from: 'donationlinks',
                    localField: 'donationLinkId',
                    foreignField: '_id',
                    as: 'link'
                }
            },
            {
                $unwind: '$link'
            },
            {
                $group: {
                    _id: '$link.title',
                    amount: { $sum: '$amount' },
                    donations: { $sum: 1 }
                }
            },
            {
                $sort: { amount: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    name: '$_id',
                    amount: '$amount',
                    donations: '$donations'
                }
            }
        ]);
        return campaigns;
    }
    async generateMonthlyTrends() {
        const months = [];
        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
            const monthData = await this.getRevenueData(monthDate, monthEnd);
            months.push({
                month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
                revenue: monthData.totalRevenue,
                growth: 0
            });
        }
        return months;
    }
    async getExportData(startDate, endDate) {
        const donations = await this.donationModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $lookup: {
                    from: 'donationlinks',
                    localField: 'donationLinkId',
                    foreignField: '_id',
                    as: 'link'
                }
            },
            {
                $unwind: '$link'
            },
            {
                $project: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    amount: 1,
                    status: 1,
                    paymentMethod: 1,
                    donorName: 1,
                    campaign: '$link.title',
                    fees: { $multiply: ['$amount', 0.08] }
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);
        return donations;
    }
    convertToCSV(data) {
        if (!data || data.length === 0)
            return '';
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(','))
        ];
        return csvRows.join('\n');
    }
    getDateRange(period) {
        const endDate = new Date();
        const startDate = new Date();
        switch (period) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            default:
                startDate.setDate(endDate.getDate() - 30);
        }
        return { startDate, endDate };
    }
    getPeriodDays(period) {
        switch (period) {
            case '7d': return 7;
            case '30d': return 30;
            case '90d': return 90;
            default: return 30;
        }
    }
    formatPeriod(period, previous = false) {
        const prefix = previous ? 'Previous ' : 'Last ';
        switch (period) {
            case '7d': return `${prefix}7 days`;
            case '30d': return `${prefix}30 days`;
            case '90d': return `${prefix}90 days`;
            default: return `${prefix}30 days`;
        }
    }
    calculateGrowth(current, previous) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = ReportingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(donation_schema_1.Donation.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(donation_link_schema_1.DonationLink.name)),
    __param(3, (0, mongoose_1.InjectModel)(analytics_event_schema_1.AnalyticsEvent.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map