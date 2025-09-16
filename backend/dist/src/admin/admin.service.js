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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const transaction_schema_1 = require("../payments/schemas/transaction.schema");
const donation_schema_1 = require("../donations/schemas/donation.schema");
const obs_settings_schema_1 = require("../obs-settings/obs-settings.schema");
const bank_account_schema_1 = require("../users/schemas/bank-account.schema");
let AdminService = class AdminService {
    constructor(userModel, transactionModel, donationModel, obsSettingsModel, bankAccountModel) {
        this.userModel = userModel;
        this.transactionModel = transactionModel;
        this.donationModel = donationModel;
        this.obsSettingsModel = obsSettingsModel;
        this.bankAccountModel = bankAccountModel;
    }
    async getSystemHealth(adminId) {
        const dbStart = Date.now();
        let dbStatus = 'healthy';
        let dbResponseTime = 0;
        let dbConnections = 0;
        try {
            await this.userModel.findOne().exec();
            dbResponseTime = Date.now() - dbStart;
            dbConnections = this.userModel.db.connections?.length || 0;
        }
        catch (error) {
            dbStatus = 'unhealthy';
            dbResponseTime = Date.now() - dbStart;
        }
        let redisStatus = 'healthy';
        const redisResponseTime = 0;
        const redisMemoryUsage = 0;
        const externalServices = {
            stripe: { status: 'healthy', responseTime: 0, lastCheck: new Date() },
            paypal: { status: 'healthy', responseTime: 0, lastCheck: new Date() },
        };
        let overallStatus;
        if (dbStatus === 'healthy' && redisStatus === 'healthy') {
            overallStatus = 'healthy';
        }
        else if (dbStatus === 'unhealthy' || redisStatus === 'unhealthy') {
            overallStatus = 'unhealthy';
        }
        else {
            overallStatus = 'degraded';
        }
        const metrics = {
            cpuUsage: Math.random() * 100,
            memoryUsage: Math.random() * 100,
            diskUsage: Math.random() * 100,
            activeConnections: dbConnections,
        };
        return {
            status: overallStatus,
            database: {
                status: dbStatus,
                responseTime: dbResponseTime,
                connections: dbConnections,
            },
            redis: {
                status: redisStatus,
                responseTime: redisResponseTime,
                memoryUsage: redisMemoryUsage,
            },
            externalServices,
            metrics,
            lastUpdated: new Date(),
        };
    }
    async getSystemLogs(level, limit, adminId) {
        const mockLogs = [
            {
                timestamp: new Date(),
                level: 'info',
                message: 'Admin dashboard accessed',
                context: 'admin',
                metadata: { adminId, action: 'dashboard_access' },
                userId: adminId,
                requestId: 'req-123',
            },
            {
                timestamp: new Date(Date.now() - 60000),
                level: 'warn',
                message: 'High transaction volume detected',
                context: 'payments',
                metadata: { volume: 150, threshold: 100 },
            },
            {
                timestamp: new Date(Date.now() - 120000),
                level: 'error',
                message: 'Payment processor timeout',
                context: 'stripe',
                metadata: { processor: 'stripe', timeout: 30000 },
            },
        ];
        return mockLogs
            .filter(log => level === 'all' || log.level === level)
            .slice(0, limit);
    }
    async exportTransactions(format, filters, adminId) {
        const query = {};
        if (filters.status)
            query.status = filters.status;
        if (filters.type)
            query.type = filters.type;
        if (filters.paymentMethod)
            query.paymentMethod = filters.paymentMethod;
        if (filters.startDate || filters.endDate) {
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
            .sort({ createdAt: -1 })
            .exec();
        switch (format.toLowerCase()) {
            case 'csv':
                return this.convertToCSV(transactions);
            case 'json':
                return Buffer.from(JSON.stringify(transactions, null, 2));
            case 'pdf':
                return this.convertToPDF(transactions);
            case 'excel':
                return this.convertToExcel(transactions);
            default:
                throw new common_1.BadRequestException(`Unsupported export format: ${format}`);
        }
    }
    convertToCSV(data) {
        if (data.length === 0) {
            return Buffer.from('No data available');
        }
        const headers = Object.keys(data[0].toObject ? data[0].toObject() : data[0]);
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
    convertToPDF(data) {
        const content = data.map(item => JSON.stringify(item, null, 2)).join('\n\n');
        return Buffer.from(content);
    }
    convertToExcel(data) {
        return this.convertToCSV(data);
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }
    async logAdminActivity(adminId, type, description, resourceType, resourceId, metadata) {
        console.log(`Admin Activity: ${adminId} - ${type} - ${description} - ${resourceType}:${resourceId}`, metadata);
    }
    async validateAdminPermissions(adminId) {
        const admin = await this.userModel.findById(adminId).exec();
        return admin && admin.role === 'admin';
    }
    async getAdminDashboardStats(adminId) {
        const [totalUsers, activeUsers, totalTransactions, totalRevenue, pendingDisputes,] = await Promise.all([
            this.userModel.countDocuments(),
            this.userModel.countDocuments({ status: 'active' }),
            this.transactionModel.countDocuments(),
            this.transactionModel.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.transactionModel.countDocuments({
                status: 'disputed',
                disputeStatus: 'open'
            }),
        ]);
        return {
            totalUsers,
            activeUsers,
            totalTransactions,
            totalRevenue: totalRevenue[0]?.total || 0,
            pendingDisputes,
        };
    }
    async getDeposits(filters, adminId) {
        await this.validateAdminPermissions(adminId);
        const { page = 1, limit = 20, status, paymentMethod, search, dateFrom, dateTo, } = filters;
        const query = { type: 'deposit' };
        if (status) {
            query.status = status;
        }
        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) {
                query.createdAt.$gte = dateFrom;
            }
            if (dateTo) {
                query.createdAt.$lte = dateTo;
            }
        }
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { transactionId: searchRegex },
                { description: searchRegex },
            ];
        }
        const skip = (page - 1) * limit;
        const [deposits, total] = await Promise.all([
            this.transactionModel
                .find(query)
                .populate('userId', 'username email firstName lastName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.transactionModel.countDocuments(query),
        ]);
        const transformedDeposits = deposits.map(deposit => {
            const user = deposit.userId;
            return {
                id: deposit._id.toString(),
                userId: user._id?.toString() || user.toString(),
                userName: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
                userEmail: user.email || 'N/A',
                amount: deposit.amount,
                currency: deposit.currency,
                status: deposit.status,
                paymentMethod: deposit.paymentMethod,
                description: deposit.description,
                createdAt: deposit.createdAt.toISOString(),
                completedAt: deposit.completedAt?.toISOString(),
                processingFee: deposit.feeAmount || 0,
                netAmount: deposit.amount - (deposit.feeAmount || 0),
                adminNotes: deposit.adminNotes,
                disputeReason: deposit.disputeReason,
                disputeStatus: deposit.disputeStatus,
                disputeResolution: deposit.disputeResolution,
                manualAdjustment: deposit.manualAdjustment,
                adjustmentReason: deposit.adjustmentReason,
                transactionId: deposit.transactionId,
                paymentIntentId: deposit.paymentIntentId,
                bankAccount: deposit.bankAccount,
                verificationStatus: deposit.verificationStatus || 'not_required',
                kycStatus: deposit.kycStatus || 'not_required',
            };
        });
        return {
            deposits: transformedDeposits,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getDepositStats(period, adminId) {
        await this.validateAdminPermissions(adminId);
        const now = new Date();
        let startDate;
        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        const query = {
            type: 'deposit',
            createdAt: { $gte: startDate, $lte: now },
        };
        const [totalDeposits, totalAmount, statusCounts, paymentMethodCounts,] = await Promise.all([
            this.transactionModel.countDocuments(query),
            this.transactionModel.aggregate([
                { $match: query },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.transactionModel.aggregate([
                { $match: query },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            this.transactionModel.aggregate([
                { $match: query },
                { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
            ]),
        ]);
        const statusBreakdown = statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
        const paymentMethodBreakdown = paymentMethodCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
        return {
            totalDeposits,
            totalAmount: totalAmount[0]?.total || 0,
            averageDepositAmount: totalDeposits > 0 ? (totalAmount[0]?.total || 0) / totalDeposits : 0,
            statusBreakdown,
            paymentMethodBreakdown,
            period,
        };
    }
    async getDepositById(depositId, adminId) {
        await this.validateAdminPermissions(adminId);
        const deposit = await this.transactionModel
            .findOne({ _id: depositId, type: 'deposit' })
            .populate('userId', 'username email firstName lastName')
            .exec();
        if (!deposit) {
            throw new common_1.NotFoundException('Deposit not found');
        }
        const user = deposit.userId;
        return {
            id: deposit._id.toString(),
            userId: user._id?.toString() || user.toString(),
            userName: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
            userEmail: user.email || 'N/A',
            amount: deposit.amount,
            currency: deposit.currency,
            status: deposit.status,
            paymentMethod: deposit.paymentMethod,
            description: deposit.description,
            createdAt: deposit.createdAt.toISOString(),
            completedAt: deposit.completedAt?.toISOString(),
            processingFee: deposit.feeAmount || 0,
            netAmount: deposit.amount - (deposit.feeAmount || 0),
            adminNotes: deposit.adminNotes,
            disputeReason: deposit.disputeReason,
            disputeStatus: deposit.disputeStatus,
            disputeResolution: deposit.disputeResolution,
            manualAdjustment: deposit.manualAdjustment,
            adjustmentReason: deposit.adjustmentReason,
            transactionId: deposit.transactionId,
            paymentIntentId: deposit.paymentIntentId,
            bankAccount: deposit.bankAccount,
            verificationStatus: deposit.verificationStatus || 'not_required',
            kycStatus: deposit.kycStatus || 'not_required',
        };
    }
    async updateDepositStatus(depositId, status, adminNotes, adminId) {
        await this.validateAdminPermissions(adminId);
        const deposit = await this.transactionModel
            .findOne({ _id: depositId, type: 'deposit' })
            .exec();
        if (!deposit) {
            throw new common_1.NotFoundException('Deposit not found');
        }
        const validStatuses = ['pending', 'completed', 'failed', 'cancelled', 'processing', 'disputed'];
        if (!validStatuses.includes(status)) {
            throw new common_1.BadRequestException('Invalid status');
        }
        const updateData = { status };
        if (status === 'completed' && !deposit.completedAt) {
            updateData.completedAt = new Date();
        }
        if (adminNotes) {
            updateData.adminNotes = adminNotes;
        }
        const updatedDeposit = await this.transactionModel
            .findByIdAndUpdate(depositId, updateData, { new: true })
            .populate('userId', 'username email firstName lastName')
            .exec();
        await this.logAdminActivity(adminId, 'deposit_status_update', `Updated deposit status to ${status}`, 'deposit', depositId, { oldStatus: deposit.status, newStatus: status, adminNotes });
        return {
            id: updatedDeposit._id.toString(),
            status: updatedDeposit.status,
            adminNotes: updatedDeposit.adminNotes,
            completedAt: updatedDeposit.completedAt?.toISOString(),
        };
    }
    async handleDepositDispute(depositId, disputeData, adminId) {
        await this.validateAdminPermissions(adminId);
        const deposit = await this.transactionModel
            .findOne({ _id: depositId, type: 'deposit' })
            .exec();
        if (!deposit) {
            throw new common_1.NotFoundException('Deposit not found');
        }
        const { action, adminNotes, refundAmount } = disputeData;
        const updateData = {
            disputeStatus: 'resolved',
            disputeResolution: action,
        };
        if (adminNotes) {
            updateData.adminNotes = adminNotes;
        }
        switch (action) {
            case 'approve':
                updateData.status = 'completed';
                updateData.completedAt = new Date();
                break;
            case 'refund':
                updateData.status = 'cancelled';
                if (refundAmount) {
                    updateData.refundAmount = refundAmount;
                }
                break;
            case 'partial_refund':
                updateData.status = 'completed';
                updateData.completedAt = new Date();
                if (refundAmount) {
                    updateData.refundAmount = refundAmount;
                }
                break;
            case 'investigation':
                updateData.disputeStatus = 'under_investigation';
                break;
        }
        const updatedDeposit = await this.transactionModel
            .findByIdAndUpdate(depositId, updateData, { new: true })
            .exec();
        await this.logAdminActivity(adminId, 'deposit_dispute_resolution', `Resolved deposit dispute with action: ${action}`, 'deposit', depositId, { action, adminNotes, refundAmount });
        return {
            id: updatedDeposit._id.toString(),
            status: updatedDeposit.status,
            disputeStatus: updatedDeposit.disputeStatus,
            disputeResolution: updatedDeposit.disputeResolution,
            adminNotes: updatedDeposit.adminNotes,
            refundAmount: updatedDeposit.refundAmount,
        };
    }
    async applyDepositAdjustment(depositId, adjustmentData, adminId) {
        await this.validateAdminPermissions(adminId);
        const deposit = await this.transactionModel
            .findOne({ _id: depositId, type: 'deposit' })
            .exec();
        if (!deposit) {
            throw new common_1.NotFoundException('Deposit not found');
        }
        const { adjustmentAmount, reason, adminNotes } = adjustmentData;
        if (typeof adjustmentAmount !== 'number') {
            throw new common_1.BadRequestException('Adjustment amount must be a number');
        }
        const updateData = {
            manualAdjustment: adjustmentAmount,
            adjustmentReason: reason,
            netAmount: deposit.amount - (deposit.feeAmount || 0) + adjustmentAmount,
        };
        if (adminNotes) {
            updateData.adminNotes = adminNotes;
        }
        const updatedDeposit = await this.transactionModel
            .findByIdAndUpdate(depositId, updateData, { new: true })
            .exec();
        await this.logAdminActivity(adminId, 'deposit_adjustment', `Applied manual adjustment of ${adjustmentAmount}`, 'deposit', depositId, { adjustmentAmount, reason, adminNotes });
        return {
            id: updatedDeposit._id.toString(),
            manualAdjustment: updatedDeposit.manualAdjustment,
            adjustmentReason: updatedDeposit.adjustmentReason,
            netAmount: updatedDeposit.netAmount,
            adminNotes: updatedDeposit.adminNotes,
        };
    }
    async exportDeposits(format, filters, adminId) {
        await this.validateAdminPermissions(adminId);
        const deposits = await this.getDeposits({ ...filters, limit: 10000 }, adminId);
        const data = deposits.deposits.map(deposit => ({
            'Deposit ID': deposit.id,
            'User Name': deposit.userName,
            'User Email': deposit.userEmail,
            'Amount': deposit.amount,
            'Currency': deposit.currency,
            'Status': deposit.status,
            'Payment Method': deposit.paymentMethod,
            'Description': deposit.description,
            'Created At': deposit.createdAt,
            'Completed At': deposit.completedAt || '',
            'Processing Fee': deposit.processingFee,
            'Net Amount': deposit.netAmount,
            'Admin Notes': deposit.adminNotes || '',
            'Dispute Reason': deposit.disputeReason || '',
            'Dispute Status': deposit.disputeStatus || '',
            'Verification Status': deposit.verificationStatus,
            'KYC Status': deposit.kycStatus,
        }));
        return this.convertToCSV(data);
    }
    async getBankAccounts(filters, adminId) {
        await this.validateAdminPermissions(adminId);
        const { page = 1, limit = 20, search, userId, bankCode, isActive, isDefault, } = filters;
        const skip = (page - 1) * limit;
        const query = {};
        if (search) {
            query.$or = [
                { bankName: { $regex: search, $options: 'i' } },
                { accountName: { $regex: search, $options: 'i' } },
                { accountNumber: { $regex: search, $options: 'i' } },
            ];
        }
        if (userId) {
            query.userId = userId;
        }
        if (bankCode) {
            query.bankCode = bankCode;
        }
        if (typeof isActive === 'boolean') {
            query.isActive = isActive;
        }
        if (typeof isDefault === 'boolean') {
            query.isDefault = isDefault;
        }
        const [bankAccounts, total] = await Promise.all([
            this.bankAccountModel
                .find(query)
                .populate('userId', 'username email firstName lastName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.bankAccountModel.countDocuments(query),
        ]);
        const transformedBankAccounts = bankAccounts.map(account => {
            const user = account.userId;
            return {
                _id: account._id.toString(),
                userId: user._id?.toString() || user.toString(),
                userName: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
                userEmail: user.email || 'N/A',
                bankName: account.bankName,
                accountName: account.accountName,
                accountNumber: account.accountNumber,
                bankCode: account.bankCode,
                bankShortName: account.bankShortName,
                bin: account.bin,
                logo: account.logo,
                isActive: account.isActive,
                isDefault: account.isDefault,
                lastUsedAt: account.lastUsedAt?.toISOString(),
                createdAt: account.createdAt?.toISOString() || new Date().toISOString(),
                updatedAt: account.updatedAt?.toISOString() || new Date().toISOString(),
            };
        });
        return {
            bankAccounts: transformedBankAccounts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getBankAccountStats(adminId) {
        await this.validateAdminPermissions(adminId);
        const [totalAccounts, activeAccounts, defaultAccounts, accountsByBank] = await Promise.all([
            this.bankAccountModel.countDocuments({}),
            this.bankAccountModel.countDocuments({ isActive: true }),
            this.bankAccountModel.countDocuments({ isDefault: true }),
            this.bankAccountModel.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$bankName', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]),
        ]);
        const recentAccounts = await this.bankAccountModel
            .find({ isActive: true })
            .populate('userId', 'username email firstName lastName')
            .sort({ createdAt: -1 })
            .limit(5)
            .exec();
        return {
            totalAccounts,
            activeAccounts,
            defaultAccounts,
            accountsByBank: accountsByBank.map(item => ({
                bankName: item._id,
                count: item.count,
            })),
            recentAccounts: recentAccounts.map(account => {
                const user = account.userId;
                return {
                    _id: account._id.toString(),
                    userId: user._id?.toString() || user.toString(),
                    userName: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
                    userEmail: user.email || 'N/A',
                    bankName: account.bankName,
                    accountName: account.accountName,
                    accountNumber: account.accountNumber,
                    isDefault: account.isDefault,
                    createdAt: account.createdAt?.toISOString() || new Date().toISOString(),
                };
            }),
        };
    }
    async getBankAccountById(accountId, adminId) {
        await this.validateAdminPermissions(adminId);
        const account = await this.bankAccountModel
            .findById(accountId)
            .populate('userId', 'username email firstName lastName')
            .exec();
        if (!account) {
            throw new common_1.NotFoundException('Bank account not found');
        }
        const user = account.userId;
        return {
            _id: account._id.toString(),
            userId: user._id?.toString() || user.toString(),
            userName: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
            userEmail: user.email || 'N/A',
            bankName: account.bankName,
            accountName: account.accountName,
            accountNumber: account.accountNumber,
            bankCode: account.bankCode,
            bankShortName: account.bankShortName,
            bin: account.bin,
            logo: account.logo,
            isActive: account.isActive,
            isDefault: account.isDefault,
            lastUsedAt: account.lastUsedAt?.toISOString(),
            createdAt: account.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: account.updatedAt?.toISOString() || new Date().toISOString(),
        };
    }
    async createBankAccount(data, adminId) {
        await this.validateAdminPermissions(adminId);
        const { userId, ...bankAccountData } = data;
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingAccount = await this.bankAccountModel.findOne({
            userId,
            bankCode: bankAccountData.bankCode,
            accountNumber: bankAccountData.accountNumber,
        });
        if (existingAccount) {
            throw new common_1.BadRequestException('Bank account with this combination already exists');
        }
        if (bankAccountData.isDefault) {
            await this.bankAccountModel.updateMany({ userId, isDefault: true }, { isDefault: false });
        }
        const bankAccount = new this.bankAccountModel({
            userId,
            ...bankAccountData,
        });
        const savedAccount = await bankAccount.save();
        await savedAccount.populate('userId', 'username email firstName lastName');
        await this.logAdminActivity(adminId, 'bank_account_created', `Created bank account for user ${user.username}`, 'bank_account', savedAccount._id.toString(), { userId, bankName: bankAccountData.bankName });
        const userData = savedAccount.userId;
        return {
            _id: savedAccount._id.toString(),
            userId: userData._id?.toString() || userData.toString(),
            userName: userData.username || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown',
            userEmail: userData.email || 'N/A',
            bankName: savedAccount.bankName,
            accountName: savedAccount.accountName,
            accountNumber: savedAccount.accountNumber,
            bankCode: savedAccount.bankCode,
            bankShortName: savedAccount.bankShortName,
            bin: savedAccount.bin,
            logo: savedAccount.logo,
            isActive: savedAccount.isActive,
            isDefault: savedAccount.isDefault,
            lastUsedAt: savedAccount.lastUsedAt?.toISOString(),
            createdAt: savedAccount.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: savedAccount.updatedAt?.toISOString() || new Date().toISOString(),
        };
    }
    async updateBankAccount(accountId, data, adminId) {
        await this.validateAdminPermissions(adminId);
        const account = await this.bankAccountModel.findById(accountId).exec();
        if (!account) {
            throw new common_1.NotFoundException('Bank account not found');
        }
        if (data.accountNumber && data.accountNumber !== account.accountNumber) {
            const duplicateAccount = await this.bankAccountModel.findOne({
                userId: account.userId,
                bankCode: data.bankCode || account.bankCode,
                accountNumber: data.accountNumber,
                _id: { $ne: accountId },
            });
            if (duplicateAccount) {
                throw new common_1.BadRequestException('Bank account with this combination already exists');
            }
        }
        if (data.isDefault) {
            await this.bankAccountModel.updateMany({ userId: account.userId, isDefault: true, _id: { $ne: accountId } }, { isDefault: false });
        }
        const updatedAccount = await this.bankAccountModel
            .findByIdAndUpdate(accountId, data, { new: true })
            .populate('userId', 'username email firstName lastName')
            .exec();
        await this.logAdminActivity(adminId, 'bank_account_updated', `Updated bank account ${accountId}`, 'bank_account', accountId, data);
        const userData = updatedAccount.userId;
        return {
            _id: updatedAccount._id.toString(),
            userId: userData._id?.toString() || userData.toString(),
            userName: userData.username || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown',
            userEmail: userData.email || 'N/A',
            bankName: updatedAccount.bankName,
            accountName: updatedAccount.accountName,
            accountNumber: updatedAccount.accountNumber,
            bankCode: updatedAccount.bankCode,
            bankShortName: updatedAccount.bankShortName,
            bin: updatedAccount.bin,
            logo: updatedAccount.logo,
            isActive: updatedAccount.isActive,
            isDefault: updatedAccount.isDefault,
            lastUsedAt: updatedAccount.lastUsedAt?.toISOString(),
            createdAt: updatedAccount.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: updatedAccount.updatedAt?.toISOString() || new Date().toISOString(),
        };
    }
    async deleteBankAccount(accountId, adminId) {
        await this.validateAdminPermissions(adminId);
        const account = await this.bankAccountModel.findById(accountId).exec();
        if (!account) {
            throw new common_1.NotFoundException('Bank account not found');
        }
        await this.bankAccountModel.findByIdAndUpdate(accountId, { isActive: false });
        await this.logAdminActivity(adminId, 'bank_account_deleted', `Deleted bank account ${accountId}`, 'bank_account', accountId, { bankName: account.bankName, accountNumber: account.accountNumber });
    }
    async setDefaultBankAccount(accountId, adminId) {
        await this.validateAdminPermissions(adminId);
        const account = await this.bankAccountModel.findById(accountId).exec();
        if (!account) {
            throw new common_1.NotFoundException('Bank account not found');
        }
        await this.bankAccountModel.updateMany({ userId: account.userId, isDefault: true }, { isDefault: false });
        const updatedAccount = await this.bankAccountModel
            .findByIdAndUpdate(accountId, { isDefault: true }, { new: true })
            .populate('userId', 'username email firstName lastName')
            .exec();
        await this.logAdminActivity(adminId, 'bank_account_set_default', `Set bank account ${accountId} as default`, 'bank_account', accountId, { bankName: account.bankName });
        const userData = updatedAccount.userId;
        return {
            _id: updatedAccount._id.toString(),
            userId: userData._id?.toString() || userData.toString(),
            userName: userData.username || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown',
            userEmail: userData.email || 'N/A',
            bankName: updatedAccount.bankName,
            accountName: updatedAccount.accountName,
            accountNumber: updatedAccount.accountNumber,
            bankCode: updatedAccount.bankCode,
            bankShortName: updatedAccount.bankShortName,
            bin: updatedAccount.bin,
            logo: updatedAccount.logo,
            isActive: updatedAccount.isActive,
            isDefault: updatedAccount.isDefault,
            lastUsedAt: updatedAccount.lastUsedAt?.toISOString(),
            createdAt: updatedAccount.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: updatedAccount.updatedAt?.toISOString() || new Date().toISOString(),
        };
    }
    async exportBankAccounts(format, filters, adminId) {
        await this.validateAdminPermissions(adminId);
        const bankAccounts = await this.getBankAccounts({ ...filters, limit: 10000 }, adminId);
        const data = bankAccounts.bankAccounts.map(account => ({
            'Account ID': account._id,
            'User Name': account.userName,
            'User Email': account.userEmail,
            'Bank Name': account.bankName,
            'Account Holder': account.accountName,
            'Account Number': account.accountNumber,
            'Bank Code': account.bankCode || '',
            'Bank Short Name': account.bankShortName || '',
            'Is Active': account.isActive ? 'Yes' : 'No',
            'Is Default': account.isDefault ? 'Yes' : 'No',
            'Last Used': account.lastUsedAt || '',
            'Created At': account.createdAt,
            'Updated At': account.updatedAt,
        }));
        return this.convertToCSV(data);
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __param(2, (0, mongoose_1.InjectModel)(donation_schema_1.Donation.name)),
    __param(3, (0, mongoose_1.InjectModel)(obs_settings_schema_1.OBSSettings.name)),
    __param(4, (0, mongoose_1.InjectModel)(bank_account_schema_1.BankAccount.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map