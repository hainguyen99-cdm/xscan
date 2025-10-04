import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BankTransaction, BankTransactionDocument } from '../bank-sync/schemas/bank-transaction.schema';
import { OBSWidgetGateway } from './obs-widget.gateway';

@Injectable()
export class BankDonationTotalService {
  private readonly logger = new Logger(BankDonationTotalService.name);

  constructor(
    @InjectModel(BankTransaction.name)
    private bankTransactionModel: Model<BankTransactionDocument>,
    @Inject(forwardRef(() => OBSWidgetGateway))
    private obsWidgetGateway: OBSWidgetGateway,
  ) {}

  /**
   * Get total bank donation amount for a streamer
   */
  async getTotalBankDonations(streamerId: string): Promise<{
    totalAmount: number;
    currency: string;
    transactionCount: number;
    lastDonationDate?: Date;
  }> {
    try {
      // Validate ObjectId format
      if (!Types.ObjectId.isValid(streamerId)) {
        this.logger.warn(`Invalid streamerId format: ${streamerId}`);
        return {
          totalAmount: 0,
          currency: 'VND',
          transactionCount: 0,
        };
      }
      
      const streamerObjectId = new Types.ObjectId(streamerId);
      
      const result = await this.bankTransactionModel.aggregate([
        {
          $match: {
            streamerId: streamerObjectId,
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            transactionCount: { $sum: 1 },
            lastDonationDate: { $max: '$transactionDate' },
            currency: { $first: '$currency' },
          },
        },
      ]);

      if (result.length === 0) {
        return {
          totalAmount: 0,
          currency: 'VND',
          transactionCount: 0,
        };
      }

      const data = result[0];
      return {
        totalAmount: data.totalAmount || 0,
        currency: data.currency || 'VND',
        transactionCount: data.transactionCount || 0,
        lastDonationDate: data.lastDonationDate,
      };
    } catch (error) {
      this.logger.error(`Failed to get total bank donations for streamer ${streamerId}:`, error);
      throw error;
    }
  }

  /**
   * Get bank donation statistics for a streamer
   */
  async getBankDonationStats(streamerId: string): Promise<{
    totalAmount: number;
    currency: string;
    transactionCount: number;
    lastDonationDate?: Date;
    averageDonation: number;
    todayDonations: number;
    thisWeekDonations: number;
    thisMonthDonations: number;
  }> {
    try {
      // Validate ObjectId format
      if (!Types.ObjectId.isValid(streamerId)) {
        this.logger.warn(`Invalid streamerId format: ${streamerId}`);
        return {
          totalAmount: 0,
          currency: 'VND',
          transactionCount: 0,
          averageDonation: 0,
          todayDonations: 0,
          thisWeekDonations: 0,
          thisMonthDonations: 0,
        };
      }
      
      const streamerObjectId = new Types.ObjectId(streamerId);
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalStats, todayStats, weekStats, monthStats] = await Promise.all([
        // Total stats
        this.bankTransactionModel.aggregate([
          {
            $match: {
              streamerId: streamerObjectId,
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' },
              transactionCount: { $sum: 1 },
              lastDonationDate: { $max: '$transactionDate' },
              currency: { $first: '$currency' },
            },
          },
        ]),
        // Today's donations
        this.bankTransactionModel.aggregate([
          {
            $match: {
              streamerId: streamerObjectId,
              transactionDate: { $gte: startOfDay },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' },
              transactionCount: { $sum: 1 },
            },
          },
        ]),
        // This week's donations
        this.bankTransactionModel.aggregate([
          {
            $match: {
              streamerId: streamerObjectId,
              transactionDate: { $gte: startOfWeek },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' },
              transactionCount: { $sum: 1 },
            },
          },
        ]),
        // This month's donations
        this.bankTransactionModel.aggregate([
          {
            $match: {
              streamerId: streamerObjectId,
              transactionDate: { $gte: startOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' },
              transactionCount: { $sum: 1 },
            },
          },
        ]),
      ]);

      const totalData = totalStats[0] || { totalAmount: 0, transactionCount: 0, currency: 'VND' };
      const todayData = todayStats[0] || { totalAmount: 0, transactionCount: 0 };
      const weekData = weekStats[0] || { totalAmount: 0, transactionCount: 0 };
      const monthData = monthStats[0] || { totalAmount: 0, transactionCount: 0 };

      return {
        totalAmount: totalData.totalAmount || 0,
        currency: totalData.currency || 'VND',
        transactionCount: totalData.transactionCount || 0,
        lastDonationDate: totalData.lastDonationDate,
        averageDonation: totalData.transactionCount > 0 ? totalData.totalAmount / totalData.transactionCount : 0,
        todayDonations: todayData.totalAmount || 0,
        thisWeekDonations: weekData.totalAmount || 0,
        thisMonthDonations: monthData.totalAmount || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get bank donation stats for streamer ${streamerId}:`, error);
      throw error;
    }
  }

  /**
   * Format currency amount for display
   */
  formatCurrency(amount: number, currency: string = 'VND'): string {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Broadcast bank donation total update via WebSocket
   */
  async broadcastBankDonationTotalUpdate(streamerId: string): Promise<void> {
    try {
      const stats = await this.getBankDonationStats(streamerId);
      
      await this.obsWidgetGateway.sendBankDonationTotalUpdate(streamerId, {
        totalAmount: stats.totalAmount,
        currency: stats.currency,
        transactionCount: stats.transactionCount,
        lastDonationDate: stats.lastDonationDate,
        averageDonation: stats.averageDonation,
        todayDonations: stats.todayDonations,
        thisWeekDonations: stats.thisWeekDonations,
        thisMonthDonations: stats.thisMonthDonations,
      });
      
      this.logger.log(`Broadcasted bank donation total update for streamer ${streamerId}: ${stats.totalAmount} ${stats.currency}`);
    } catch (error) {
      this.logger.error(`Failed to broadcast bank donation total update for streamer ${streamerId}:`, error);
    }
  }
}
