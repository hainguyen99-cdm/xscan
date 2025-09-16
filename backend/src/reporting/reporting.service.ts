import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Donation } from '../donations/schemas/donation.schema';
import { User } from '../users/schemas/user.schema';
import { DonationLink } from '../donations/schemas/donation-link.schema';
import { AnalyticsEvent } from '../donations/schemas/analytics-event.schema';

export interface RevenueReport {
  totalRevenue: number;
  platformFees: number;
  netRevenue: number;
  donationSources: {
    paypal: number;
    stripe: number;
    crypto: number;
    other: number;
  };
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    growth: number;
  }>;
  period: string;
}

export interface GrowthReport {
  revenueGrowth: number;
  userGrowth: number;
  transactionGrowth: number;
  avgDonationGrowth: number;
  conversionRateGrowth: number;
  period: string;
  previousPeriod: string;
}

export interface ComprehensiveReport {
  period: string;
  revenue: RevenueReport;
  growth: GrowthReport;
  summary: {
    totalRevenue: number;
    transactions: number;
    users: number;
    growth: number;
    fees: number;
    donations: number;
    avgDonation: number;
    conversionRate: number;
  };
  topDonors: Array<{
    name: string;
    amount: number;
    date: string;
  }>;
  topCampaigns: Array<{
    name: string;
    amount: number;
    donations: number;
  }>;
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    @InjectModel(Donation.name) private donationModel: Model<Donation>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(DonationLink.name) private donationLinkModel: Model<DonationLink>,
    @InjectModel(AnalyticsEvent.name) private analyticsEventModel: Model<AnalyticsEvent>,
  ) {}

  /**
   * Generate revenue report for a specific period
   */
  async generateRevenueReport(period: string): Promise<RevenueReport> {
    try {
      const { startDate, endDate } = this.getDateRange(period);
      
      // Get revenue data for current period
      const currentPeriodData = await this.getRevenueData(startDate, endDate);
      
      // Get revenue data for previous period for growth calculation
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - this.getPeriodDays(period));
      const previousEndDate = new Date(startDate);
      const previousPeriodData = await this.getRevenueData(previousStartDate, previousEndDate);

      // Calculate growth
      const revenueGrowth = previousPeriodData.totalRevenue > 0 
        ? ((currentPeriodData.totalRevenue - previousPeriodData.totalRevenue) / previousPeriodData.totalRevenue) * 100
        : 0;

      // Generate monthly trends (last 6 months)
      const monthlyTrends = await this.generateMonthlyTrends();

      return {
        totalRevenue: currentPeriodData.totalRevenue,
        platformFees: currentPeriodData.platformFees,
        netRevenue: currentPeriodData.totalRevenue - currentPeriodData.platformFees,
        donationSources: currentPeriodData.donationSources,
        monthlyTrends,
        period: this.formatPeriod(period)
      };
    } catch (error) {
      this.logger.error(`Failed to generate revenue report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate growth statistics report
   */
  async generateGrowthReport(period: string): Promise<GrowthReport> {
    try {
      const { startDate, endDate } = this.getDateRange(period);
      
      // Get current period data
      const currentData = await this.getGrowthData(startDate, endDate);
      
      // Get previous period data
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - this.getPeriodDays(period));
      const previousEndDate = new Date(startDate);
      const previousData = await this.getGrowthData(previousStartDate, previousEndDate);

      // Calculate growth percentages
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
    } catch (error) {
      this.logger.error(`Failed to generate growth report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateComprehensiveReport(period: string): Promise<ComprehensiveReport> {
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
    } catch (error) {
      this.logger.error(`Failed to generate comprehensive report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export data in various formats
   */
  async exportData(period: string, format: 'csv' | 'json'): Promise<any> {
    try {
      const { startDate, endDate } = this.getDateRange(period);
      
      const data = await this.getExportData(startDate, endDate);
      
      if (format === 'csv') {
        return this.convertToCSV(data);
      }
      
      return data;
    } catch (error) {
      this.logger.error(`Failed to export data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get revenue data for a specific date range
   */
  private async getRevenueData(startDate: Date, endDate: Date) {
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
          platformFees: { $sum: { $multiply: ['$amount', 0.08] } }, // 8% platform fee
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

  /**
   * Get growth data for a specific date range
   */
  private async getGrowthData(startDate: Date, endDate: Date) {
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

  /**
   * Get summary data for a specific date range
   */
  private async getSummaryData(startDate: Date, endDate: Date) {
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

    // Calculate growth (simplified - in real implementation, compare with previous period)
    const growth = 0; // Placeholder

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

  /**
   * Get top donors for a specific date range
   */
  private async getTopDonors(startDate: Date, endDate: Date) {
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

  /**
   * Get top campaigns for a specific date range
   */
  private async getTopCampaigns(startDate: Date, endDate: Date) {
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

  /**
   * Generate monthly trends for the last 6 months
   */
  private async generateMonthlyTrends() {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthData = await this.getRevenueData(monthDate, monthEnd);
      
      months.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthData.totalRevenue,
        growth: 0 // Placeholder - would calculate actual growth
      });
    }

    return months;
  }

  /**
   * Get export data for a specific date range
   */
  private async getExportData(startDate: Date, endDate: Date) {
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

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  /**
   * Get date range for a specific period
   */
  private getDateRange(period: string): { startDate: Date; endDate: Date } {
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

  /**
   * Get number of days for a period
   */
  private getPeriodDays(period: string): number {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  }

  /**
   * Format period for display
   */
  private formatPeriod(period: string, previous: boolean = false): string {
    const prefix = previous ? 'Previous ' : 'Last ';
    switch (period) {
      case '7d': return `${prefix}7 days`;
      case '30d': return `${prefix}30 days`;
      case '90d': return `${prefix}90 days`;
      default: return `${prefix}30 days`;
    }
  }

  /**
   * Calculate growth percentage
   */
  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
} 