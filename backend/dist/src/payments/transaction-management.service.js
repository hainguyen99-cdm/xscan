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
exports.TransactionManagementService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const transaction_schema_1 = require("./schemas/transaction.schema");
let TransactionManagementService = class TransactionManagementService {
    constructor(transactionModel) {
        this.transactionModel = transactionModel;
    }
    async getTransactions(filters, adminId) {
        const { page = 1, limit = 20, ...filterCriteria } = filters;
        const skip = (page - 1) * limit;
        const query = {};
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
            query.userId = new mongoose_2.Types.ObjectId(filterCriteria.userId);
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
        const total = await this.transactionModel.countDocuments(query);
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
    async getTransactionById(transactionId, adminId) {
        const transaction = await this.transactionModel
            .findById(transactionId)
            .populate('userId', 'username email')
            .populate('recipientId', 'username email')
            .populate('donationId', 'amount currency message')
            .populate('relatedTransactionId', 'amount status type')
            .exec();
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async handleDispute(disputeData, adminId) {
        const transaction = await this.transactionModel.findById(disputeData.transactionId);
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.status !== transaction_schema_1.TransactionStatus.DISPUTED) {
            throw new common_1.BadRequestException('Transaction is not in disputed status');
        }
        const updateData = {
            disputeStatus: transaction_schema_1.DisputeStatus.RESOLVED,
            disputeResolution: disputeData.resolution,
            adminNotes: disputeData.adminNotes,
            adminId,
            adminActionAt: new Date(),
            resolvedAt: new Date(),
        };
        switch (disputeData.resolution) {
            case transaction_schema_1.DisputeResolution.REFUND:
                updateData.status = transaction_schema_1.TransactionStatus.CANCELLED;
                updateData.cancelledAt = new Date();
                break;
            case transaction_schema_1.DisputeResolution.APPROVE:
                updateData.status = transaction_schema_1.TransactionStatus.COMPLETED;
                updateData.completedAt = new Date();
                break;
            case transaction_schema_1.DisputeResolution.PARTIAL_REFUND:
                if (!disputeData.partialRefundAmount || disputeData.partialRefundAmount >= transaction.amount) {
                    throw new common_1.BadRequestException('Invalid partial refund amount');
                }
                updateData.manualAdjustment = -disputeData.partialRefundAmount;
                updateData.adjustmentReason = `Partial refund due to dispute resolution: ${disputeData.resolutionReason}`;
                updateData.adjustmentAdminId = adminId;
                updateData.adjustmentAt = new Date();
                break;
            case transaction_schema_1.DisputeResolution.INVESTIGATION:
                updateData.disputeStatus = transaction_schema_1.DisputeStatus.UNDER_INVESTIGATION;
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
    async makeManualAdjustment(adjustmentData, adminId) {
        const transaction = await this.transactionModel.findById(adjustmentData.transactionId);
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (Math.abs(adjustmentData.adjustmentAmount) > transaction.amount * 2) {
            throw new common_1.BadRequestException('Adjustment amount cannot exceed 200% of transaction amount');
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
    async performTransactionAction(actionData, adminId) {
        const transaction = await this.transactionModel.findById(actionData.transactionId);
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        const updateData = {
            adminNotes: actionData.adminNotes,
            adminId,
            adminActionAt: new Date(),
        };
        switch (actionData.action.toLowerCase()) {
            case 'approve':
                if (transaction.status !== transaction_schema_1.TransactionStatus.PENDING) {
                    throw new common_1.BadRequestException('Only pending transactions can be approved');
                }
                updateData.status = transaction_schema_1.TransactionStatus.COMPLETED;
                updateData.completedAt = new Date();
                break;
            case 'reject':
                if (transaction.status !== transaction_schema_1.TransactionStatus.PENDING) {
                    throw new common_1.BadRequestException('Only pending transactions can be rejected');
                }
                updateData.status = transaction_schema_1.TransactionStatus.FAILED;
                updateData.failedAt = new Date();
                updateData.failureReason = actionData.reason || 'Rejected by admin';
                break;
            case 'cancel':
                if (transaction.status === transaction_schema_1.TransactionStatus.COMPLETED) {
                    throw new common_1.BadRequestException('Completed transactions cannot be cancelled');
                }
                updateData.status = transaction_schema_1.TransactionStatus.CANCELLED;
                updateData.cancelledAt = new Date();
                break;
            case 'mark_disputed':
                updateData.status = transaction_schema_1.TransactionStatus.DISPUTED;
                updateData.disputedAt = new Date();
                updateData.disputeStatus = transaction_schema_1.DisputeStatus.OPEN;
                break;
            default:
                throw new common_1.BadRequestException(`Invalid action: ${actionData.action}`);
        }
        const updatedTransaction = await this.transactionModel
            .findByIdAndUpdate(actionData.transactionId, updateData, { new: true })
            .populate('userId', 'username email')
            .populate('recipientId', 'username email')
            .populate('donationId', 'amount currency message')
            .exec();
        return updatedTransaction;
    }
    async getTransactionStats(adminId) {
        const [totalTransactions, totalVolume, pendingTransactions, disputedTransactions, failedTransactions, totalFees, averageAmount, volumeByType, countByStatus, volumeByPaymentMethod,] = await Promise.all([
            this.transactionModel.countDocuments(),
            this.transactionModel.aggregate([
                { $match: { status: transaction_schema_1.TransactionStatus.COMPLETED } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.transactionModel.countDocuments({ status: transaction_schema_1.TransactionStatus.PENDING }),
            this.transactionModel.countDocuments({ status: transaction_schema_1.TransactionStatus.DISPUTED }),
            this.transactionModel.countDocuments({ status: transaction_schema_1.TransactionStatus.FAILED }),
            this.transactionModel.aggregate([
                { $group: { _id: null, total: { $sum: '$processingFee' } } },
            ]),
            this.transactionModel.aggregate([
                { $match: { status: transaction_schema_1.TransactionStatus.COMPLETED } },
                { $group: { _id: null, average: { $avg: '$amount' } } },
            ]),
            this.transactionModel.aggregate([
                { $match: { status: transaction_schema_1.TransactionStatus.COMPLETED } },
                { $group: { _id: '$type', volume: { $sum: '$amount' } } },
            ]),
            this.transactionModel.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            this.transactionModel.aggregate([
                { $match: { status: transaction_schema_1.TransactionStatus.COMPLETED } },
                { $group: { _id: '$paymentMethod', volume: { $sum: '$amount' } } },
            ]),
        ]);
        const totalVolumeResult = totalVolume[0]?.total || 0;
        const totalFeesResult = totalFees[0]?.total || 0;
        const averageAmountResult = averageAmount[0]?.average || 0;
        const volumeByTypeMap = {
            [transaction_schema_1.TransactionType.DONATION]: 0,
            [transaction_schema_1.TransactionType.WITHDRAWAL]: 0,
            [transaction_schema_1.TransactionType.REFUND]: 0,
            [transaction_schema_1.TransactionType.FEE]: 0,
            [transaction_schema_1.TransactionType.TRANSFER]: 0,
        };
        volumeByType.forEach(item => {
            volumeByTypeMap[item._id] = item.volume;
        });
        const countByStatusMap = {
            [transaction_schema_1.TransactionStatus.PENDING]: 0,
            [transaction_schema_1.TransactionStatus.COMPLETED]: 0,
            [transaction_schema_1.TransactionStatus.FAILED]: 0,
            [transaction_schema_1.TransactionStatus.DISPUTED]: 0,
            [transaction_schema_1.TransactionStatus.CANCELLED]: 0,
            [transaction_schema_1.TransactionStatus.PROCESSING]: 0,
        };
        countByStatus.forEach(item => {
            countByStatusMap[item._id] = item.count;
        });
        const volumeByPaymentMethodMap = {
            [transaction_schema_1.PaymentMethod.STRIPE]: 0,
            [transaction_schema_1.PaymentMethod.PAYPAL]: 0,
            [transaction_schema_1.PaymentMethod.WALLET]: 0,
            [transaction_schema_1.PaymentMethod.BANK_TRANSFER]: 0,
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
    async exportTransactions(exportData, adminId) {
        const { format = 'csv', filters } = exportData;
        const { transactions } = await this.getTransactions(filters, adminId);
        if (format === 'csv') {
            return this.generateCsvExport(transactions);
        }
        else if (format === 'pdf') {
            return this.generatePdfExport(transactions);
        }
        else if (format === 'excel') {
            return this.generateExcelExport(transactions);
        }
        throw new common_1.BadRequestException(`Unsupported export format: ${format}`);
    }
    generateCsvExport(transactions) {
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
    generatePdfExport(transactions) {
        return Buffer.from('PDF export not yet implemented', 'utf-8');
    }
    generateExcelExport(transactions) {
        return Buffer.from('Excel export not yet implemented', 'utf-8');
    }
    async bulkAction(transactionIds, action, adminId, reason) {
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
            }
            catch (error) {
                results.failed.push({
                    id: transactionId,
                    reason: error.message,
                });
            }
        }
        return results;
    }
};
exports.TransactionManagementService = TransactionManagementService;
exports.TransactionManagementService = TransactionManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TransactionManagementService);
//# sourceMappingURL=transaction-management.service.js.map