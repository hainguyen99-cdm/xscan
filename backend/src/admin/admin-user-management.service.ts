import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Transaction, TransactionDocument } from '../payments/schemas/transaction.schema';
import { Donation, DonationDocument } from '../donations/schemas/donation.schema';
import { OBSSettings, OBSSettingsDocument } from '../obs-settings/obs-settings.schema';
import { UserFilterDto, UserUpdateDto, UserStatusDto, PaginatedResponseDto } from './dto/admin.dto';

@Injectable()
export class AdminUserManagementService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Donation.name) private donationModel: Model<DonationDocument>,
    @InjectModel(OBSSettings.name) private obsSettingsModel: Model<OBSSettingsDocument>,
  ) {}

  async getUsers(filters: UserFilterDto, adminId: string): Promise<PaginatedResponseDto<UserDocument>> {
    const { page = 1, limit = 20, ...filterCriteria } = filters;
    const skip = (page - 1) * limit;

    // Build filter query
    const query: any = {};

    if (filterCriteria.searchTerm) {
      query.$or = [
        { username: { $regex: filterCriteria.searchTerm, $options: 'i' } },
        { email: { $regex: filterCriteria.searchTerm, $options: 'i' } },
      ];
    }

    if (filterCriteria.role) {
      query.role = filterCriteria.role;
    }

    if (filterCriteria.status) {
      query.isActive = filterCriteria.status === 'active';
    }

    if (filterCriteria.isVerified !== undefined) {
      query.verificationBadges = { $exists: true, $ne: [] };
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
    const total = await this.userModel.countDocuments(query);

    // Get users with pagination
    const users = await this.userModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password') // Exclude password field
      .exec();

    const totalPages = Math.ceil(total / limit);

    return {
      items: users,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async getUserById(userId: string, adminId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(userId: string, updateData: UserUpdateDto, adminId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user fields
    if (updateData.username) {
      // Check if username is already taken
      const existingUser = await this.userModel.findOne({ 
        username: updateData.username,
        _id: { $ne: userId }
      }).exec();
      
      if (existingUser) {
        throw new BadRequestException('Username already taken');
      }
      user.username = updateData.username;
    }

    if (updateData.email) {
      // Check if email is already taken
      const existingUser = await this.userModel.findOne({ 
        email: updateData.email,
        _id: { $ne: userId }
      }).exec();
      
      if (existingUser) {
        throw new BadRequestException('Email already taken');
      }
      user.email = updateData.email;
    }

    if (updateData.role) {
      user.role = updateData.role;
    }

    if (typeof updateData.bankToken === 'string') {
      user.bankToken = updateData.bankToken.trim();
    }

    // Optional extended fields if supplied
    if ((updateData as any).firstName) {
      user.firstName = (updateData as any).firstName;
    }
    if ((updateData as any).lastName) {
      user.lastName = (updateData as any).lastName;
    }
    if ((updateData as any).twoFactorEnabled !== undefined) {
      user.twoFactorEnabled = Boolean((updateData as any).twoFactorEnabled);
    }
    if (updateData.profileVisibility) {
      const visibility = updateData.profileVisibility === 'friends' ? 'friends_only' : updateData.profileVisibility;
      user.profileVisibility = visibility;
    }
    if (updateData.showEmail !== undefined) {
      user.showEmail = Boolean(updateData.showEmail);
    }
    if (updateData.showPhone !== undefined) {
      user.showPhone = Boolean(updateData.showPhone);
    }
    if (updateData.showAddress !== undefined) {
      user.showAddress = Boolean(updateData.showAddress);
    }
    if (updateData.showLastLogin !== undefined) {
      user.showLastLogin = Boolean(updateData.showLastLogin);
    }

    // Log admin activity
    await this.logAdminActivity(adminId, 'user_updated', `Updated user ${user.username}`, 'user', userId, updateData);

    return await user.save();
  }

  async updateUserStatus(userId: string, statusData: UserStatusDto, adminId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const previousStatus = user.isActive;
    user.isActive = statusData.status === 'active';

    // Log admin activity
    await this.logAdminActivity(
      adminId, 
      'user_status_changed', 
      `Changed user ${user.username} status from ${previousStatus} to ${statusData.status}`, 
      'user', 
      userId, 
      statusData
    );

    return await user.save();
  }

  async verifyUser(userId: string, adminId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.verificationBadges) {
      user.verificationBadges = [];
    }

    if (user.verificationBadges.includes('admin_verified')) {
      throw new BadRequestException('User is already verified');
    }

    user.verificationBadges.push('admin_verified');

    // Log admin activity
    await this.logAdminActivity(
      adminId, 
      'user_verified', 
      `Verified user ${user.username}`, 
      'user', 
      userId
    );

    return await user.save();
  }

  async unverifyUser(userId: string, adminId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.verificationBadges || !user.verificationBadges.includes('admin_verified')) {
      throw new BadRequestException('User is not verified');
    }

    user.verificationBadges = user.verificationBadges.filter(badge => badge !== 'admin_verified');

    // Log admin activity
    await this.logAdminActivity(
      adminId, 
      'user_unverified', 
      `Removed verification from user ${user.username}`, 
      'user', 
      userId
    );

    return await user.save();
  }

  async deleteUser(userId: string, adminId: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has any active transactions or donations
    const [activeTransactions, activeDonations] = await Promise.all([
      this.transactionModel.countDocuments({ 
        $or: [
          { userId: userId },
          { recipientId: userId }
        ],
        status: { $in: ['pending', 'processing', 'completed'] }
      }),
      this.donationModel.countDocuments({ 
        userId: userId,
        status: { $in: ['pending', 'processing', 'completed'] }
      }),
    ]);

    if (activeTransactions > 0 || activeDonations > 0) {
      throw new BadRequestException('Cannot delete user with active transactions or donations');
    }

    // Soft delete by setting isActive to false and adding deletion info
    user.isActive = false;
    user.deletionRequestedAt = new Date();
    user.deletionReason = 'Admin deletion';

    // Log admin activity
    await this.logAdminActivity(
      adminId, 
      'user_deleted', 
      `Deleted user ${user.username}`, 
      'user', 
      userId
    );

    await user.save();
  }

  async getUserStats(userId: string, adminId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [
      totalTransactions,
      totalDonations,
      totalRevenue,
      totalFees,
      obsSettings,
    ] = await Promise.all([
      this.transactionModel.countDocuments({ 
        $or: [
          { userId: userId },
          { recipientId: userId }
        ]
      }),
      this.donationModel.countDocuments({ userId: userId }),
      this.transactionModel.aggregate([
        { 
          $match: { 
            $or: [
              { userId: new Types.ObjectId(userId) },
              { recipientId: new Types.ObjectId(userId) }
            ],
            status: 'completed'
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.transactionModel.aggregate([
        { 
          $match: { 
            $or: [
              { userId: new Types.ObjectId(userId) },
              { recipientId: new Types.ObjectId(userId) }
            ],
            status: 'completed'
          }
        },
        { $group: { _id: null, total: { $sum: '$platformFee' } } },
      ]),
      this.obsSettingsModel.findOne({ streamerId: userId }),
    ]);

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.verificationBadges && user.verificationBadges.length > 0,
        createdAt: user.createdAt,
      },
      stats: {
        totalTransactions: totalTransactions,
        totalDonations: totalDonations,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalFees: totalFees[0]?.total || 0,
        hasOBSSettings: !!obsSettings,
      },
    };
  }

  async exportUsers(format: string, filters: UserFilterDto, adminId: string): Promise<Buffer> {
    // Build query based on filters
    const query: any = {};

    if (filters.searchTerm) {
      query.$or = [
        { username: { $regex: filters.searchTerm, $options: 'i' } },
        { email: { $regex: filters.searchTerm, $options: 'i' } },
      ];
    }

    if (filters.role) query.role = filters.role;
    if (filters.status) query.isActive = filters.status === 'active';
    if (filters.isVerified !== undefined) {
      query.verificationBadges = { $exists: true, $ne: [] };
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const users = await this.userModel
      .find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();

    // Convert to export format
    switch (format.toLowerCase()) {
      case 'csv':
        return this.convertToCSV(users);
      case 'json':
        return Buffer.from(JSON.stringify(users, null, 2));
      case 'pdf':
        return this.convertToPDF(users);
      case 'excel':
        return this.convertToExcel(users);
      default:
        throw new BadRequestException(`Unsupported export format: ${format}`);
    }
  }

  private convertToCSV(data: any[]): Buffer {
    if (data.length === 0) {
      return Buffer.from('No data available');
    }

    const headers = ['ID', 'Username', 'Email', 'Role', 'Active', 'Verified', 'Created At'];
    const csvRows = [headers.join(',')];

    for (const user of data) {
      const row = [
        user._id,
        `"${user.username || ''}"`,
        `"${user.email || ''}"`,
        user.role,
        user.isActive ? 'Yes' : 'No',
        user.verificationBadges && user.verificationBadges.length > 0 ? 'Yes' : 'No',
        user.createdAt.toISOString(),
      ];
      csvRows.push(row.join(','));
    }

    return Buffer.from(csvRows.join('\n'));
  }

  private convertToPDF(data: any[]): Buffer {
    // In a real implementation, this would use a PDF library like PDFKit
    // For now, return a simple text representation
    const content = data.map(user => 
      `ID: ${user._id}\nUsername: ${user.username}\nEmail: ${user.email}\nRole: ${user.role}\nActive: ${user.isActive ? 'Yes' : 'No'}\nVerified: ${user.verificationBadges && user.verificationBadges.length > 0 ? 'Yes' : 'No'}\nCreated: ${user.createdAt}\n`
    ).join('\n');
    return Buffer.from(content);
  }

  private convertToExcel(data: any[]): Buffer {
    // In a real implementation, this would use a library like ExcelJS
    // For now, return CSV format as Excel can read it
    return this.convertToCSV(data);
  }

  private async logAdminActivity(
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
} 