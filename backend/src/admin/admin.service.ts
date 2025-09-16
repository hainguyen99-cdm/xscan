import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Transaction, TransactionDocument } from '../payments/schemas/transaction.schema';
import { Donation, DonationDocument } from '../donations/schemas/donation.schema';
import { OBSSettings, OBSSettingsDocument } from '../obs-settings/obs-settings.schema';
import { BankAccount, BankAccountDocument } from '../users/schemas/bank-account.schema';
import { SystemHealthDto, SystemLogDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Donation.name) private donationModel: Model<DonationDocument>,
    @InjectModel(OBSSettings.name) private obsSettingsModel: Model<OBSSettingsDocument>,
    @InjectModel(BankAccount.name) private bankAccountModel: Model<BankAccountDocument>,
  ) {}

  async getSystemHealth(adminId: string): Promise<SystemHealthDto> {
    // Check database connection
    const dbStart = Date.now();
    let dbStatus: string = 'healthy';
    let dbResponseTime = 0;
    let dbConnections = 0;

    try {
      await this.userModel.findOne().exec();
      dbResponseTime = Date.now() - dbStart;
      dbConnections = (this.userModel.db as any).connections?.length || 0;
    } catch (error) {
      dbStatus = 'unhealthy';
      dbResponseTime = Date.now() - dbStart;
    }

    // Check Redis connection (if available)
    let redisStatus: string = 'healthy'; // This would be implemented with actual Redis client
    const redisResponseTime = 0;
    const redisMemoryUsage = 0;

    // Check external services
    const externalServices = {
      stripe: { status: 'healthy', responseTime: 0, lastCheck: new Date() },
      paypal: { status: 'healthy', responseTime: 0, lastCheck: new Date() },
    };

    // Calculate overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (dbStatus === 'healthy' && redisStatus === 'healthy') {
      overallStatus = 'healthy';
    } else if (dbStatus === 'unhealthy' || redisStatus === 'unhealthy') {
      overallStatus = 'unhealthy';
    } else {
      overallStatus = 'degraded';
    }

    // Mock system metrics (in real implementation, these would come from system monitoring)
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

  async getSystemLogs(level: string, limit: number, adminId: string): Promise<SystemLogDto[]> {
    // In a real implementation, this would query actual log storage
    // For now, return mock logs
    const mockLogs: SystemLogDto[] = [
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

  async exportTransactions(format: string, filters: any, adminId: string): Promise<Buffer> {
    // Build query based on filters
    const query: any = {};
    
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const transactions = await this.transactionModel
      .find(query)
      .populate('userId', 'username email')
      .populate('recipientId', 'username email')
      .sort({ createdAt: -1 })
      .exec();

    // Convert to export format
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
        throw new BadRequestException(`Unsupported export format: ${format}`);
    }
  }

  private convertToCSV(data: any[]): Buffer {
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

  private convertToPDF(data: any[]): Buffer {
    // In a real implementation, this would use a PDF library like PDFKit
    // For now, return a simple text representation
    const content = data.map(item => JSON.stringify(item, null, 2)).join('\n\n');
    return Buffer.from(content);
  }

  private convertToExcel(data: any[]): Buffer {
    // In a real implementation, this would use a library like ExcelJS
    // For now, return CSV format as Excel can read it
    return this.convertToCSV(data);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  async logAdminActivity(
    adminId: string,
    type: string,
    description: string,
    resourceType: string,
    resourceId: string,
    metadata?: any,
  ): Promise<void> {
    // In a real implementation, this would save to an admin activity log collection
    console.log(`Admin Activity: ${adminId} - ${type} - ${description} - ${resourceType}:${resourceId}`, metadata);
  }

  async validateAdminPermissions(adminId: string): Promise<boolean> {
    const admin = await this.userModel.findById(adminId).exec();
    return admin && admin.role === 'admin';
  }

  async getAdminDashboardStats(adminId: string): Promise<any> {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      totalRevenue,
      pendingDisputes,
    ] = await Promise.all([
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

  // Deposit Management Methods
  async getDeposits(filters: any, adminId: string): Promise<any> {
    await this.validateAdminPermissions(adminId);

    const {
      page = 1,
      limit = 20,
      status,
      paymentMethod,
      search,
      dateFrom,
      dateTo,
    } = filters;

    const query: any = { type: 'deposit' };

    // Apply filters
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

    // Search functionality
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

    // Transform deposits to include user information
    const transformedDeposits = deposits.map(deposit => {
      const user = deposit.userId as any; // Type assertion for populated user
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

  async getDepositStats(period: string, adminId: string): Promise<any> {
    await this.validateAdminPermissions(adminId);

    const now = new Date();
    let startDate: Date;

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

    const [
      totalDeposits,
      totalAmount,
      statusCounts,
      paymentMethodCounts,
    ] = await Promise.all([
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

  async getDepositById(depositId: string, adminId: string): Promise<any> {
    await this.validateAdminPermissions(adminId);

    const deposit = await this.transactionModel
      .findOne({ _id: depositId, type: 'deposit' })
      .populate('userId', 'username email firstName lastName')
      .exec();

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    const user = deposit.userId as any; // Type assertion for populated user
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

  async updateDepositStatus(
    depositId: string,
    status: string,
    adminNotes: string,
    adminId: string,
  ): Promise<any> {
    await this.validateAdminPermissions(adminId);

    const deposit = await this.transactionModel
      .findOne({ _id: depositId, type: 'deposit' })
      .exec();

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    const validStatuses = ['pending', 'completed', 'failed', 'cancelled', 'processing', 'disputed'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const updateData: any = { status };
    
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

    await this.logAdminActivity(
      adminId,
      'deposit_status_update',
      `Updated deposit status to ${status}`,
      'deposit',
      depositId,
      { oldStatus: deposit.status, newStatus: status, adminNotes },
    );

    return {
      id: updatedDeposit._id.toString(),
      status: updatedDeposit.status,
      adminNotes: updatedDeposit.adminNotes,
      completedAt: updatedDeposit.completedAt?.toISOString(),
    };
  }

  async handleDepositDispute(
    depositId: string,
    disputeData: any,
    adminId: string,
  ): Promise<any> {
    await this.validateAdminPermissions(adminId);

    const deposit = await this.transactionModel
      .findOne({ _id: depositId, type: 'deposit' })
      .exec();

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    const { action, adminNotes, refundAmount } = disputeData;

    const updateData: any = {
      disputeStatus: 'resolved',
      disputeResolution: action,
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    // Handle different dispute actions
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

    await this.logAdminActivity(
      adminId,
      'deposit_dispute_resolution',
      `Resolved deposit dispute with action: ${action}`,
      'deposit',
      depositId,
      { action, adminNotes, refundAmount },
    );

    return {
      id: updatedDeposit._id.toString(),
      status: updatedDeposit.status,
      disputeStatus: updatedDeposit.disputeStatus,
      disputeResolution: updatedDeposit.disputeResolution,
      adminNotes: updatedDeposit.adminNotes,
      refundAmount: updatedDeposit.refundAmount,
    };
  }

  async applyDepositAdjustment(
    depositId: string,
    adjustmentData: any,
    adminId: string,
  ): Promise<any> {
    await this.validateAdminPermissions(adminId);

    const deposit = await this.transactionModel
      .findOne({ _id: depositId, type: 'deposit' })
      .exec();

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    const { adjustmentAmount, reason, adminNotes } = adjustmentData;

    if (typeof adjustmentAmount !== 'number') {
      throw new BadRequestException('Adjustment amount must be a number');
    }

    const updateData: any = {
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

    await this.logAdminActivity(
      adminId,
      'deposit_adjustment',
      `Applied manual adjustment of ${adjustmentAmount}`,
      'deposit',
      depositId,
      { adjustmentAmount, reason, adminNotes },
    );

    return {
      id: updatedDeposit._id.toString(),
      manualAdjustment: updatedDeposit.manualAdjustment,
      adjustmentReason: updatedDeposit.adjustmentReason,
      netAmount: updatedDeposit.netAmount,
      adminNotes: updatedDeposit.adminNotes,
    };
  }

  async exportDeposits(format: string, filters: any, adminId: string): Promise<Buffer> {
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

  // Bank Account Management Methods
  async getBankAccounts(filters: any, adminId: string): Promise<any> {
    await this.validateAdminPermissions(adminId);

    const {
      page = 1,
      limit = 20,
      search,
      userId,
      bankCode,
      isActive,
      isDefault,
    } = filters;

    const skip = (page - 1) * limit;
    const query: any = {};

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
      const user = account.userId as any;
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
        createdAt: (account as any).createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: (account as any).updatedAt?.toISOString() || new Date().toISOString(),
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

  async getBankAccountStats(adminId: string): Promise<any> {
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
        const user = account.userId as any;
        return {
          _id: account._id.toString(),
          userId: user._id?.toString() || user.toString(),
          userName: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
          userEmail: user.email || 'N/A',
          bankName: account.bankName,
          accountName: account.accountName,
          accountNumber: account.accountNumber,
          isDefault: account.isDefault,
          createdAt: (account as any).createdAt?.toISOString() || new Date().toISOString(),
        };
      }),
    };
  }

  async getBankAccountById(accountId: string, adminId: string): Promise<any> {
    await this.validateAdminPermissions(adminId);

    const account = await this.bankAccountModel
      .findById(accountId)
      .populate('userId', 'username email firstName lastName')
      .exec();

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    const user = account.userId as any;
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
      createdAt: (account as any).createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: (account as any).updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async createBankAccount(data: any, adminId: string): Promise<any> {
    await this.validateAdminPermissions(adminId);

    const { userId, ...bankAccountData } = data;

    // Check if user exists
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for duplicate account
    const existingAccount = await this.bankAccountModel.findOne({
      userId,
      bankCode: bankAccountData.bankCode,
      accountNumber: bankAccountData.accountNumber,
    });

    if (existingAccount) {
      throw new BadRequestException('Bank account with this combination already exists');
    }

    // If setting as default, unset other default accounts for this user
    if (bankAccountData.isDefault) {
      await this.bankAccountModel.updateMany(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    const bankAccount = new this.bankAccountModel({
      userId,
      ...bankAccountData,
    });

    const savedAccount = await bankAccount.save();
    await savedAccount.populate('userId', 'username email firstName lastName');

    await this.logAdminActivity(
      adminId,
      'bank_account_created',
      `Created bank account for user ${user.username}`,
      'bank_account',
      savedAccount._id.toString(),
      { userId, bankName: bankAccountData.bankName },
    );

    const userData = savedAccount.userId as any;
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
      createdAt: (savedAccount as any).createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: (savedAccount as any).updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async updateBankAccount(accountId: string, data: any, adminId: string): Promise<any> {
    await this.validateAdminPermissions(adminId);

    const account = await this.bankAccountModel.findById(accountId).exec();
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    // Check for duplicate account if changing account number
    if (data.accountNumber && data.accountNumber !== account.accountNumber) {
      const duplicateAccount = await this.bankAccountModel.findOne({
        userId: account.userId,
        bankCode: data.bankCode || account.bankCode,
        accountNumber: data.accountNumber,
        _id: { $ne: accountId },
      });

      if (duplicateAccount) {
        throw new BadRequestException('Bank account with this combination already exists');
      }
    }

    // If setting as default, unset other default accounts for this user
    if (data.isDefault) {
      await this.bankAccountModel.updateMany(
        { userId: account.userId, isDefault: true, _id: { $ne: accountId } },
        { isDefault: false }
      );
    }

    const updatedAccount = await this.bankAccountModel
      .findByIdAndUpdate(accountId, data, { new: true })
      .populate('userId', 'username email firstName lastName')
      .exec();

    await this.logAdminActivity(
      adminId,
      'bank_account_updated',
      `Updated bank account ${accountId}`,
      'bank_account',
      accountId,
      data,
    );

    const userData = updatedAccount.userId as any;
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
      createdAt: (updatedAccount as any).createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: (updatedAccount as any).updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async deleteBankAccount(accountId: string, adminId: string): Promise<void> {
    await this.validateAdminPermissions(adminId);

    const account = await this.bankAccountModel.findById(accountId).exec();
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    // Soft delete by setting isActive to false
    await this.bankAccountModel.findByIdAndUpdate(accountId, { isActive: false });

    await this.logAdminActivity(
      adminId,
      'bank_account_deleted',
      `Deleted bank account ${accountId}`,
      'bank_account',
      accountId,
      { bankName: account.bankName, accountNumber: account.accountNumber },
    );
  }

  async setDefaultBankAccount(accountId: string, adminId: string): Promise<any> {
    await this.validateAdminPermissions(adminId);

    const account = await this.bankAccountModel.findById(accountId).exec();
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    // Unset other default accounts for this user
    await this.bankAccountModel.updateMany(
      { userId: account.userId, isDefault: true },
      { isDefault: false }
    );

    // Set this account as default
    const updatedAccount = await this.bankAccountModel
      .findByIdAndUpdate(accountId, { isDefault: true }, { new: true })
      .populate('userId', 'username email firstName lastName')
      .exec();

    await this.logAdminActivity(
      adminId,
      'bank_account_set_default',
      `Set bank account ${accountId} as default`,
      'bank_account',
      accountId,
      { bankName: account.bankName },
    );

    const userData = updatedAccount.userId as any;
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
      createdAt: (updatedAccount as any).createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: (updatedAccount as any).updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async exportBankAccounts(format: string, filters: any, adminId: string): Promise<Buffer> {
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
} 