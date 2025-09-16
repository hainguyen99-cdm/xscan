import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument, TransactionStatus, DisputeStatus, DisputeResolution, TransactionType, PaymentMethod } from './schemas/transaction.schema';
import { TransactionFilterDto, DisputeHandlingDto, ManualAdjustmentDto, TransactionActionDto, TransactionStatsDto } from './dto/transaction-management.dto';

@Injectable()
export class TransactionManagementService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ) {}

  async getTransactions(filters: TransactionFilterDto, adminId: string): Promise<{
    transactions: TransactionDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, ...filterCriteria } = filters;
    const skip = (page - 1) * limit;

    // Build filter query
    const query: any = {};

    if (filterCriteria.searchTerm) {
      query.$or = [
        { userName: { $regex: filterCriteria.searchTerm, $options: 'i' } },
        { _id: filterCriteria.searchTerm },
        { description: { $regex: filterCriteria.searchTerm, $options: 'i' } },
      ];
    }

    if (filterCriteria.status) {
      query.status = filterCriteria.status;
    }

    if (filterCriteria.type) {
      query.type = filterCriteria.type;
    }

    if (filterCriteria.paymentMethod) {
      query.paymentMethod = filterCriteria.paymentMethod;
    }

    if (filterCriteria.disputeStatus) {
      query.disputeStatus = filterCriteria.disputeStatus;
    }

    if (filterCriteria.userId) {
      query.userId = new Types.ObjectId(filterCriteria.userId);
    }

    if (filterCriteria.startDate || filterCriteria.endDate) {
      query.createdAt = {};
      if (filterCriteria.startDate) {
        query.createdAt.$gte = new Date(filterCriteria.startDate);
      }
      if (filterCriteria.endDate) {
        query.createdAt.$lte = new Date(filterCriteria.endDate);
      }
    }

    // Get total count
    const total = await this.transactionModel.countDocuments(query);

    // Get transactions with pagination
    const transactions = await this.transactionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email')
      .populate('recipientId', 'username email')
      .populate('donationId', 'amount currency message')
      .exec();

    const totalPages = Math.ceil(total / limit);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getTransactionById(transactionId: string, adminId: string): Promise<TransactionDocument> {
    const transaction = await this.transactionModel
      .findById(transactionId)
      .populate('userId', 'username email')
      .populate('recipientId', 'username email')
      .populate('donationId', 'amount currency message')
      .populate('relatedTransactionId', 'amount status type')
      .exec();

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async handleDispute(disputeData: DisputeHandlingDto, adminId: string): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findById(disputeData.transactionId);
    
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.DISPUTED) {
      throw new BadRequestException('Transaction is not in disputed status');
    }

    // Update transaction based on resolution
    const updateData: any = {
      disputeStatus: DisputeStatus.RESOLVED,
      disputeResolution: disputeData.resolution,
      adminNotes: disputeData.adminNotes,
      adminId,
      adminActionAt: new Date(),
      resolvedAt: new Date(),
    };

    switch (disputeData.resolution) {
      case DisputeResolution.REFUND:
        updateData.status = TransactionStatus.CANCELLED;
        updateData.cancelledAt = new Date();
        break;
      
      case DisputeResolution.APPROVE:
        updateData.status = TransactionStatus.COMPLETED;
        updateData.completedAt = new Date();
        break;
      
      case DisputeResolution.PARTIAL_REFUND:
        if (!disputeData.partialRefundAmount || disputeData.partialRefundAmount >= transaction.amount) {
          throw new BadRequestException('Invalid partial refund amount');
        }
        updateData.manualAdjustment = -disputeData.partialRefundAmount;
        updateData.adjustmentReason = `Partial refund due to dispute resolution: ${disputeData.resolutionReason}`;
        updateData.adjustmentAdminId = adminId;
        updateData.adjustmentAt = new Date();
        break;
      
      case DisputeResolution.INVESTIGATION:
        updateData.disputeStatus = DisputeStatus.UNDER_INVESTIGATION;
        break;
    }

    const updatedTransaction = await this.transactionModel
      .findByIdAndUpdate(disputeData.transactionId, updateData, { new: true })
      .populate('userId', 'username email')
      .populate('recipientId', 'username email')
      .populate('donationId', 'amount currency message')
      .exec();

    return updatedTransaction;
  }

  async makeManualAdjustment(adjustmentData: ManualAdjustmentDto, adminId: string): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findById(adjustmentData.transactionId);
    
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Validate adjustment amount
    if (Math.abs(adjustmentData.adjustmentAmount) > transaction.amount * 2) {
      throw new BadRequestException('Adjustment amount cannot exceed 200% of transaction amount');
    }

    const updateData = {
      manualAdjustment: adjustmentData.adjustmentAmount,
      adjustmentReason: adjustmentData.adjustmentReason,
      adjustmentAdminId: adminId,
      adjustmentAt: new Date(),
      adminNotes: adjustmentData.adminNotes,
      adminId,
      adminActionAt: new Date(),
    };

    const updatedTransaction = await this.transactionModel
      .findByIdAndUpdate(adjustmentData.transactionId, updateData, { new: true })
      .populate('userId', 'username email')
      .populate('recipientId', 'username email')
      .populate('donationId', 'amount currency message')
      .exec();

    return updatedTransaction;
  }

  async performTransactionAction(actionData: TransactionActionDto, adminId: string): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findById(actionData.transactionId);
    
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const updateData: any = {
      adminNotes: actionData.adminNotes,
      adminId,
      adminActionAt: new Date(),
    };

    switch (actionData.action.toLowerCase()) {
      case 'approve':
        if (transaction.status !== TransactionStatus.PENDING) {
          throw new BadRequestException('Only pending transactions can be approved');
        }
        updateData.status = TransactionStatus.COMPLETED;
        updateData.completedAt = new Date();
        break;

      case 'reject':
        if (transaction.status !== TransactionStatus.PENDING) {
          throw new BadRequestException('Only pending transactions can be rejected');
        }
        updateData.status = TransactionStatus.FAILED;
        updateData.failedAt = new Date();
        updateData.failureReason = actionData.reason || 'Rejected by admin';
        break;

      case 'cancel':
        if (transaction.status === TransactionStatus.COMPLETED) {
          throw new BadRequestException('Completed transactions cannot be cancelled');
        }
        updateData.status = TransactionStatus.CANCELLED;
        updateData.cancelledAt = new Date();
        break;

      case 'mark_disputed':
        updateData.status = TransactionStatus.DISPUTED;
        updateData.disputedAt = new Date();
        updateData.disputeStatus = DisputeStatus.OPEN;
        break;

      default:
        throw new BadRequestException(`Invalid action: ${actionData.action}`);
    }

    const updatedTransaction = await this.transactionModel
      .findByIdAndUpdate(actionData.transactionId, updateData, { new: true })
      .populate('userId', 'username email')
      .populate('recipientId', 'username email')
      .populate('donationId', 'amount currency message')
      .exec();

    return updatedTransaction;
  }

  async getTransactionStats(adminId: string): Promise<TransactionStatsDto> {
    const [
      totalTransactions,
      totalVolume,
      pendingTransactions,
      disputedTransactions,
      failedTransactions,
      totalFees,
      averageAmount,
      volumeByType,
      countByStatus,
      volumeByPaymentMethod,
    ] = await Promise.all([
      this.transactionModel.countDocuments(),
      this.transactionModel.aggregate([
        { $match: { status: TransactionStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.transactionModel.countDocuments({ status: TransactionStatus.PENDING }),
      this.transactionModel.countDocuments({ status: TransactionStatus.DISPUTED }),
      this.transactionModel.countDocuments({ status: TransactionStatus.FAILED }),
      this.transactionModel.aggregate([
        { $group: { _id: null, total: { $sum: '$processingFee' } } },
      ]),
      this.transactionModel.aggregate([
        { $match: { status: TransactionStatus.COMPLETED } },
        { $group: { _id: null, average: { $avg: '$amount' } } },
      ]),
      this.transactionModel.aggregate([
        { $match: { status: TransactionStatus.COMPLETED } },
        { $group: { _id: '$type', volume: { $sum: '$amount' } } },
      ]),
      this.transactionModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.transactionModel.aggregate([
        { $match: { status: TransactionStatus.COMPLETED } },
        { $group: { _id: '$paymentMethod', volume: { $sum: '$amount' } } },
      ]),
    ]);

    // Process aggregation results
    const totalVolumeResult = totalVolume[0]?.total || 0;
    const totalFeesResult = totalFees[0]?.total || 0;
    const averageAmountResult = averageAmount[0]?.average || 0;

    // Initialize maps with all enum values
    const volumeByTypeMap: Record<TransactionType, number> = {
      [TransactionType.DONATION]: 0,
      [TransactionType.WITHDRAWAL]: 0,
      [TransactionType.REFUND]: 0,
      [TransactionType.FEE]: 0,
      [TransactionType.TRANSFER]: 0,
    };
    volumeByType.forEach(item => {
      volumeByTypeMap[item._id] = item.volume;
    });

    const countByStatusMap: Record<TransactionStatus, number> = {
      [TransactionStatus.PENDING]: 0,
      [TransactionStatus.COMPLETED]: 0,
      [TransactionStatus.FAILED]: 0,
      [TransactionStatus.DISPUTED]: 0,
      [TransactionStatus.CANCELLED]: 0,
      [TransactionStatus.PROCESSING]: 0,
    };
    countByStatus.forEach(item => {
      countByStatusMap[item._id] = item.count;
    });

    const volumeByPaymentMethodMap: Record<PaymentMethod, number> = {
      [PaymentMethod.STRIPE]: 0,
      [PaymentMethod.PAYPAL]: 0,
      [PaymentMethod.WALLET]: 0,
      [PaymentMethod.BANK_TRANSFER]: 0,
    };
    volumeByPaymentMethod.forEach(item => {
      volumeByPaymentMethodMap[item._id] = item.volume;
    });

    return {
      totalTransactions,
      totalVolume: totalVolumeResult,
      pendingTransactions,
      disputedTransactions,
      failedTransactions,
      totalFees: totalFeesResult,
      averageAmount: averageAmountResult,
      volumeByType: volumeByTypeMap,
      countByStatus: countByStatusMap,
      volumeByPaymentMethod: volumeByPaymentMethodMap,
    };
  }

  async exportTransactions(exportData: any, adminId: string): Promise<Buffer> {
    const { format = 'csv', filters } = exportData;
    
    // Get transactions based on filters
    const { transactions } = await this.getTransactions(filters, adminId);
    
    if (format === 'csv') {
      return this.generateCsvExport(transactions);
    } else if (format === 'pdf') {
      return this.generatePdfExport(transactions);
    } else if (format === 'excel') {
      return this.generateExcelExport(transactions);
    }
    
    throw new BadRequestException(`Unsupported export format: ${format}`);
  }

  private generateCsvExport(transactions: TransactionDocument[]): Buffer {
    const headers = [
      'Transaction ID',
      'User Name',
      'Type',
      'Amount',
      'Currency',
      'Status',
      'Payment Method',
      'Description',
      'Created At',
      'Completed At',
      'Processing Fee',
      'Net Amount',
      'Dispute Status',
      'Admin Notes',
    ];

    const rows = transactions.map(t => [
      t._id.toString(),
      t.userName,
      t.type,
      t.amount,
      t.currency,
      t.status,
      t.paymentMethod,
      t.description,
      t.createdAt.toISOString(),
      t.completedAt?.toISOString() || '',
      t.processingFee,
      t.netAmount,
      t.disputeStatus || '',
      t.adminNotes || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return Buffer.from(csvContent, 'utf-8');
  }

  private generatePdfExport(transactions: TransactionDocument[]): Buffer {
    // This would typically use a PDF generation library like PDFKit
    // For now, return a placeholder
    return Buffer.from('PDF export not yet implemented', 'utf-8');
  }

  private generateExcelExport(transactions: TransactionDocument[]): Buffer {
    // This would typically use an Excel generation library like ExcelJS
    // For now, return a placeholder
    return Buffer.from('Excel export not yet implemented', 'utf-8');
  }

  async bulkAction(transactionIds: string[], action: string, adminId: string, reason?: string): Promise<{
    success: string[];
    failed: { id: string; reason: string }[];
  }> {
    const results = {
      success: [],
      failed: [],
    };

    for (const transactionId of transactionIds) {
      try {
        await this.performTransactionAction({
          transactionId,
          action,
          reason,
          adminNotes: `Bulk action: ${action}`,
        }, adminId);
        results.success.push(transactionId);
      } catch (error) {
        results.failed.push({
          id: transactionId,
          reason: error.message,
        });
      }
    }

    return results;
  }
} 