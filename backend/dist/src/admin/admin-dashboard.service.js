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
exports.AdminDashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const transaction_schema_1 = require("../payments/schemas/transaction.schema");
const donation_schema_1 = require("../donations/schemas/donation.schema");
const obs_settings_schema_1 = require("../obs-settings/obs-settings.schema");
let AdminDashboardService = class AdminDashboardService {
    constructor(userModel, transactionModel, donationModel, obsSettingsModel) {
        this.userModel = userModel;
        this.transactionModel = transactionModel;
        this.donationModel = donationModel;
        this.obsSettingsModel = obsSettingsModel;
    }
    async getOverviewStats(adminId) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const [totalUsers, activeUsers, totalTransactions, totalRevenue, platformFees, pendingDisputes,] = await Promise.all([
            this.userModel.countDocuments(),
            this.userModel.countDocuments({ isActive: true }),
            this.transactionModel.countDocuments(),
            this.transactionModel.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.transactionModel.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$platformFee' } } },
            ]),
            this.transactionModel.countDocuments({
                status: 'disputed',
                disputeStatus: 'open'
            }),
        ]);
        const [currentPeriodUsers, previousPeriodUsers, currentPeriodRevenue, previousPeriodRevenue, currentPeriodTransactions, previousPeriodTransactions,] = await Promise.all([
            this.userModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            this.userModel.countDocuments({
                createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
            }),
            this.transactionModel.aggregate([
                { $match: {
                        status: 'completed',
                        createdAt: { $gte: thirtyDaysAgo }
                    } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.transactionModel.aggregate([
                { $match: {
                        status: 'completed',
                        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
                    } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.transactionModel.countDocuments({
                status: 'completed',
                createdAt: { $gte: thirtyDaysAgo }
            }),
            this.transactionModel.countDocuments({
                status: 'completed',
                createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
            }),
        ]);
        const userGrowth = previousPeriodUsers > 0
            ? ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100
            : 0;
        const revenueGrowth = previousPeriodRevenue[0]?.total > 0
            ? ((currentPeriodRevenue[0]?.total - previousPeriodRevenue[0]?.total) / previousPeriodRevenue[0]?.total) * 100
            : 0;
        const transactionGrowth = previousPeriodTransactions > 0
            ? ((currentPeriodTransactions - previousPeriodTransactions) / previousPeriodTransactions) * 100
            : 0;
        const systemHealth = {
            database: 'healthy',
            redis: 'healthy',
            externalServices: {
                stripe: 'healthy',
                paypal: 'healthy',
            },
        };
        return {
            totalUsers,
            activeUsers,
            totalTransactions,
            totalRevenue: totalRevenue[0]?.total || 0,
            platformFees: platformFees[0]?.total || 0,
            pendingDisputes,
            growthMetrics: {
                userGrowth: Math.round(userGrowth * 100) / 100,
                revenueGrowth: Math.round(revenueGrowth * 100) / 100,
                transactionGrowth: Math.round(transactionGrowth * 100) / 100,
            },
            systemHealth,
        };
    }
    async getRecentActivity(adminId, limit = 20) {
        const recentTransactions = await this.transactionModel
            .find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('userId', 'username')
            .populate('recipientId', 'username')
            .exec();
        const recentUsers = await this.userModel
            .find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
        const activities = [];
        recentTransactions.forEach((transaction, index) => {
            const senderName = transaction.userId?.username || 'Unknown';
            const recipientName = transaction.recipientId?.username || 'Unknown';
            activities.push({
                id: `activity-${transaction._id}-${index}`,
                adminId,
                type: 'transaction_created',
                description: `New ${transaction.type} transaction of $${transaction.amount} from ${senderName} to ${recipientName}`,
                resourceType: 'transaction',
                resourceId: transaction._id.toString(),
                metadata: {
                    amount: transaction.amount,
                    type: transaction.type,
                    status: transaction.status,
                    paymentMethod: transaction.paymentMethod,
                },
                timestamp: transaction.createdAt,
            });
        });
        recentUsers.forEach((user, index) => {
            activities.push({
                id: `activity-${user._id}-${index}`,
                adminId,
                type: 'user_registered',
                description: `New user registered: ${user.username} (${user.role})`,
                resourceType: 'user',
                resourceId: user._id.toString(),
                metadata: {
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                },
                timestamp: user.createdAt,
            });
        });
        return activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    async getDashboardCharts(adminId, period = '30d') {
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
        const revenueData = await this.transactionModel.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);
        const userData = await this.userModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);
        const paymentMethodData = await this.transactionModel.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);
        const userRoleData = await this.userModel.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);
        return {
            revenueChart: revenueData,
            userChart: userData,
            paymentMethodChart: paymentMethodData,
            userRoleChart: userRoleData,
            period,
        };
    }
    async getQuickStats(adminId) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const [todayRevenue, yesterdayRevenue, todayTransactions, yesterdayTransactions, todayUsers, yesterdayUsers, todayDisputes, yesterdayDisputes,] = await Promise.all([
            this.transactionModel.aggregate([
                { $match: {
                        status: 'completed',
                        createdAt: { $gte: today }
                    } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.transactionModel.aggregate([
                { $match: {
                        status: 'completed',
                        createdAt: { $gte: yesterday, $lt: today }
                    } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.transactionModel.countDocuments({
                status: 'completed',
                createdAt: { $gte: today }
            }),
            this.transactionModel.countDocuments({
                status: 'completed',
                createdAt: { $gte: yesterday, $lt: today }
            }),
            this.userModel.countDocuments({ createdAt: { $gte: today } }),
            this.userModel.countDocuments({
                createdAt: { $gte: yesterday, $lt: today }
            }),
            this.transactionModel.countDocuments({
                status: 'disputed',
                createdAt: { $gte: today }
            }),
            this.transactionModel.countDocuments({
                status: 'disputed',
                createdAt: { $gte: yesterday, $lt: today }
            }),
        ]);
        return {
            today: {
                revenue: todayRevenue[0]?.total || 0,
                transactions: todayTransactions,
                users: todayUsers,
                disputes: todayDisputes,
            },
            yesterday: {
                revenue: yesterdayRevenue[0]?.total || 0,
                transactions: yesterdayTransactions,
                users: yesterdayUsers,
                disputes: yesterdayDisputes,
            },
            changes: {
                revenue: yesterdayRevenue[0]?.total > 0
                    ? ((todayRevenue[0]?.total - yesterdayRevenue[0]?.total) / yesterdayRevenue[0]?.total) * 100
                    : 0,
                transactions: yesterdayTransactions > 0
                    ? ((todayTransactions - yesterdayTransactions) / yesterdayTransactions) * 100
                    : 0,
                users: yesterdayUsers > 0
                    ? ((todayUsers - yesterdayUsers) / yesterdayUsers) * 100
                    : 0,
                disputes: yesterdayDisputes > 0
                    ? ((todayDisputes - yesterdayDisputes) / yesterdayDisputes) * 100
                    : 0,
            },
        };
    }
};
exports.AdminDashboardService = AdminDashboardService;
exports.AdminDashboardService = AdminDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __param(2, (0, mongoose_1.InjectModel)(donation_schema_1.Donation.name)),
    __param(3, (0, mongoose_1.InjectModel)(obs_settings_schema_1.OBSSettings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AdminDashboardService);
//# sourceMappingURL=admin-dashboard.service.js.map