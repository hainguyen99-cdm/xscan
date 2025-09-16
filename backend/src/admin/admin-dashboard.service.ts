import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Transaction, TransactionDocument } from '../payments/schemas/transaction.schema';
import { Donation, DonationDocument } from '../donations/schemas/donation.schema';
import { OBSSettings, OBSSettingsDocument } from '../obs-settings/obs-settings.schema';
import { DashboardStatsDto, AdminActivityDto } from './dto/admin.dto';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Donation.name) private donationModel: Model<DonationDocument>,
    @InjectModel(OBSSettings.name) private obsSettingsModel: Model<OBSSettingsDocument>,
  ) {}

  async getOverviewStats(adminId: string): Promise<DashboardStatsDto> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get basic counts
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      totalRevenue,
      platformFees,
      pendingDisputes,
    ] = await Promise.all([
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

    // Calculate growth metrics
    const [
      currentPeriodUsers,
      previousPeriodUsers,
      currentPeriodRevenue,
      previousPeriodRevenue,
      currentPeriodTransactions,
      previousPeriodTransactions,
    ] = await Promise.all([
      this.userModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      this.userModel.countDocuments({ 
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
      }),
      this.transactionModel.aggregate([
        { $match: { 
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        }},
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.transactionModel.aggregate([
        { $match: { 
          status: 'completed',
          createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
        }},
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

    // Calculate growth percentages
    const userGrowth = previousPeriodUsers > 0 
      ? ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100 
      : 0;
    
    const revenueGrowth = previousPeriodRevenue[0]?.total > 0 
      ? ((currentPeriodRevenue[0]?.total - previousPeriodRevenue[0]?.total) / previousPeriodRevenue[0]?.total) * 100 
      : 0;
    
    const transactionGrowth = previousPeriodTransactions > 0 
      ? ((currentPeriodTransactions - previousPeriodTransactions) / previousPeriodTransactions) * 100 
      : 0;

    // Get system health (simplified)
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

  async getRecentActivity(adminId: string, limit: number = 20): Promise<AdminActivityDto[]> {
    // In a real implementation, this would query an admin activity log collection
    // For now, return mock recent activities based on recent transactions and user actions
    
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

    const activities: AdminActivityDto[] = [];

    // Add transaction activities
    recentTransactions.forEach((transaction, index) => {
      const senderName = (transaction.userId as any)?.username || 'Unknown';
      const recipientName = (transaction.recipientId as any)?.username || 'Unknown';
      
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

    // Add user activities
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

    // Sort by timestamp and return limited results
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getDashboardCharts(adminId: string, period: string = '30d'): Promise<any> {
    const now = new Date();
    let startDate: Date;

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

    // Get revenue data by day
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

    // Get user registration data by day
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

    // Get transaction data by payment method
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

    // Get user role distribution
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

  async getQuickStats(adminId: string): Promise<any> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const [
      todayRevenue,
      yesterdayRevenue,
      todayTransactions,
      yesterdayTransactions,
      todayUsers,
      yesterdayUsers,
      todayDisputes,
      yesterdayDisputes,
    ] = await Promise.all([
      this.transactionModel.aggregate([
        { $match: { 
          status: 'completed',
          createdAt: { $gte: today }
        }},
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.transactionModel.aggregate([
        { $match: { 
          status: 'completed',
          createdAt: { $gte: yesterday, $lt: today }
        }},
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
} 