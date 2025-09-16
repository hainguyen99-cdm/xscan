import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from '../payments/schemas/transaction.schema';
import { FeeConfigDto, FeeReportDto } from './dto/admin.dto';

@Injectable()
export class AdminFeeManagementService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ) {}

  async getFeeConfig(adminId: string): Promise<FeeConfigDto> {
    // In a real implementation, this would be stored in a configuration collection
    // For now, return default configuration
    return {
      platformFeePercentage: 5.0, // 5% platform fee
      minimumFee: 0.50, // $0.50 minimum fee
      maximumFee: 10.00, // $10.00 maximum fee
      processorFeePercentage: 2.9, // 2.9% payment processor fee
      fixedProcessingFee: 0.30, // $0.30 fixed processing fee
      currency: 'VND',
      additionalRules: {
        cryptoDiscount: 0.5, // 50% discount on crypto transactions
        volumeDiscounts: {
          '1000': 0.25, // 25% discount for transactions over $1000
          '5000': 0.5,  // 50% discount for transactions over $5000
        },
        subscriptionDiscount: 0.1, // 10% discount for subscription payments
      },
    };
  }

  async updateFeeConfig(feeConfig: FeeConfigDto, adminId: string): Promise<FeeConfigDto> {
    // Validate fee configuration
    if (feeConfig.platformFeePercentage < 0 || feeConfig.platformFeePercentage > 100) {
      throw new BadRequestException('Platform fee percentage must be between 0 and 100');
    }

    if (feeConfig.processorFeePercentage < 0 || feeConfig.processorFeePercentage > 100) {
      throw new BadRequestException('Processor fee percentage must be between 0 and 100');
    }

    if (feeConfig.minimumFee < 0) {
      throw new BadRequestException('Minimum fee cannot be negative');
    }

    if (feeConfig.maximumFee < feeConfig.minimumFee) {
      throw new BadRequestException('Maximum fee cannot be less than minimum fee');
    }

    if (feeConfig.fixedProcessingFee < 0) {
      throw new BadRequestException('Fixed processing fee cannot be negative');
    }

    // In a real implementation, this would save to a configuration collection
    // For now, just return the updated configuration
    console.log(`Admin ${adminId} updated fee configuration:`, feeConfig);

    return feeConfig;
  }

  async getFeeReports(reportData: FeeReportDto, adminId: string): Promise<any> {
    const { period = '30d', startDate, endDate, paymentMethod, userRole } = reportData;

    // Calculate date range
    const now = new Date();
    let reportStartDate: Date;
    let reportEndDate: Date = now;

    if (startDate && endDate) {
      reportStartDate = new Date(startDate);
      reportEndDate = new Date(endDate);
    } else {
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

    // Build query
    const query: any = {
      status: 'completed',
      createdAt: { $gte: reportStartDate, $lte: reportEndDate },
    };

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Get fee statistics
    const [
      totalFees,
      feeByPaymentMethod,
      feeByDay,
      feeByUserRole,
      averageFee,
      feeDistribution,
    ] = await Promise.all([
      // Total fees collected
      this.transactionModel.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$platformFee' } } },
      ]),

      // Fees by payment method
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

      // Fees by day
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

      // Fees by user role (requires user population)
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

      // Average fee
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

      // Fee distribution (buckets)
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

    // Calculate fee efficiency metrics
    const totalRevenue = await this.transactionModel.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const feeEfficiency = totalRevenue[0]?.total > 0 
      ? (totalFees[0]?.total / totalRevenue[0]?.total) * 100 
      : 0;

    // Get comparison with previous period
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

  async calculateFees(amount: number, paymentMethod: string, userRole?: string): Promise<any> {
    const config = await this.getFeeConfig('system');

    // Calculate platform fee
    let platformFee = (amount * config.platformFeePercentage) / 100;
    
    // Apply minimum and maximum limits
    platformFee = Math.max(platformFee, config.minimumFee);
    platformFee = Math.min(platformFee, config.maximumFee);

    // Apply additional rules
    if (paymentMethod === 'crypto' && config.additionalRules?.cryptoDiscount) {
      platformFee *= (1 - config.additionalRules.cryptoDiscount);
    }

    // Apply volume discounts
    if (config.additionalRules?.volumeDiscounts) {
      for (const [threshold, discount] of Object.entries(config.additionalRules.volumeDiscounts)) {
        if (amount >= parseFloat(threshold)) {
          platformFee *= (1 - (discount as number));
          break;
        }
      }
    }

    // Apply subscription discount
    if (userRole === 'streamer' && config.additionalRules?.subscriptionDiscount) {
      platformFee *= (1 - config.additionalRules.subscriptionDiscount);
    }

    // Calculate processor fee
    const processorFee = (amount * config.processorFeePercentage) / 100 + config.fixedProcessingFee;

    // Calculate net amount
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

  private getVolumeDiscount(amount: number, volumeDiscounts?: Record<string, number>): number {
    if (!volumeDiscounts) return 0;

    for (const [threshold, discount] of Object.entries(volumeDiscounts)) {
      if (amount >= parseFloat(threshold)) {
        return discount;
      }
    }
    return 0;
  }

  async getFeeAnalytics(adminId: string): Promise<any> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get fee trends
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

    // Get top fee-generating payment methods
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

    // Get fee efficiency by day of week
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
} 