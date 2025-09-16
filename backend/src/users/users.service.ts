import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Follow, FollowDocument } from './schemas/follow.schema';
import { StreamerApplication, StreamerApplicationDocument } from '../streamer-applications/streamer-application.schema';
import { BankTransaction } from '../bank-sync/schemas/bank-transaction.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfilePrivacyDto } from './dto/profile-privacy.dto';
import { ProfileExportDto } from './dto/profile-export.dto';
import { ProfileDeletionDto } from './dto/profile-deletion.dto';
import { FileUploadService } from './services/file-upload.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    @InjectModel(StreamerApplication.name) private streamerApplicationModel: Model<StreamerApplicationDocument>,
    @InjectModel('DonationLink') private donationLinkModel: Model<any>,
    @InjectModel('Donation') private donationModel: Model<any>,
    @InjectModel(BankTransaction.name) private bankTxModel: Model<any>,
    private fileUploadService: FileUploadService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Check if user with email already exists
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if username is already taken
    if (createUserDto.username) {
      const existingUsername = await this.findByUsername(
        createUserDto.username,
      );
      if (existingUsername) {
        throw new ConflictException('Username is already taken');
      }
    }

    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();

    // Calculate initial profile completion
    await this.calculateProfileCompletion(savedUser._id.toString());

    return savedUser;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find({}, { password: 0 }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findUsersWithBankToken(): Promise<Pick<UserDocument, '_id' | 'bankToken'>[]> {
    return this.userModel
      .find({ role: 'streamer', bankToken: { $exists: true, $ne: '' } })
      .select('_id bankToken')
      .lean() as any;
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByPasswordResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ passwordResetToken: token }).exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    // Check if email is being changed and if it's already taken
    if (updateUserDto.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ConflictException('Email is already taken by another user');
      }
    }

    // Check if username is being changed and if it's already taken
    if (updateUserDto.username) {
      const existingUser = await this.findByUsername(updateUserDto.username);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ConflictException(
          'Username is already taken by another user',
        );
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          ...updateUserDto,
          lastProfileUpdate: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    // Recalculate profile completion after update
    await this.calculateProfileCompletion(id);

    return updatedUser;
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.findById(id);

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    // Update password
    await this.userModel
      .findByIdAndUpdate(id, { password: hashedNewPassword })
      .exec();
  }

  async setPasswordResetToken(
    userId: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        passwordResetToken: token,
        passwordResetExpires: expires,
      })
      .exec();
  }

  async resetPassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      .exec();
  }

  async setTwoFactorSecret(userId: string, secret: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { twoFactorSecret: secret })
      .exec();
  }

  async enableTwoFactor(userId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { twoFactorEnabled: true }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async disableTwoFactor(userId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { lastLoginAt: new Date() })
      .exec();
  }

  async deactivate(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async activate(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async findActiveUsers(): Promise<UserDocument[]> {
    return this.userModel.find({ isActive: true }, { password: 0 }).exec();
  }

  async findUsersByRole(role: string): Promise<UserDocument[]> {
    return this.userModel.find({ role }, { password: 0 }).exec();
  }

  async countUsers(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async countActiveUsers(): Promise<number> {
    return this.userModel.countDocuments({ isActive: true }).exec();
  }

  // Enhanced Profile Management Methods

  async calculateProfileCompletion(userId: string): Promise<number> {
    const user = await this.findById(userId);

    const requiredFields = [
      'username',
      'email',
      'firstName',
      'lastName',
      'role',
    ];

    const optionalFields = ['phone', 'address', 'profilePicture'];

    let completedFields = 0;
    const totalFields = requiredFields.length + optionalFields.length;

    // Check required fields
    requiredFields.forEach((field) => {
      if (user[field]) {
        completedFields++;
      }
    });

    // Check optional fields
    optionalFields.forEach((field) => {
      if (user[field]) {
        completedFields++;
      }
    });

    const completionPercentage = Math.round(
      (completedFields / totalFields) * 100,
    );

    // Update user's profile completion
    await this.userModel.findByIdAndUpdate(userId, {
      profileCompletionPercentage: completionPercentage,
      profileCompletedAt: completionPercentage === 100 ? new Date() : null,
    });

    return completionPercentage;
  }

  async updatePrivacySettings(
    userId: string,
    privacyDto: ProfilePrivacyDto,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          ...privacyDto,
          lastProfileUpdate: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getPublicProfile(userId: string, viewerId?: string): Promise<any> {
    const user = await this.findById(userId);

    // Track profile view
    if (viewerId && viewerId !== userId) {
      await this.trackProfileView(userId, viewerId);
    }

    // Build public profile based on privacy settings
    const publicProfile: any = {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profilePicture: user.profilePicture,
      profileCompletionPercentage: user.profileCompletionPercentage,
      verificationBadges: user.verificationBadges,
      createdAt: user.createdAt,
    };

    // Add conditional fields based on privacy settings
    if (user.showEmail) {
      publicProfile.email = user.email;
    }

    if (user.showPhone) {
      publicProfile.phone = user.phone;
    }

    if (user.showAddress) {
      publicProfile.address = user.address;
    }

    if (user.showLastLogin) {
      publicProfile.lastLoginAt = user.lastLoginAt;
    }

    return publicProfile;
  }

  private async trackProfileView(
    profileUserId: string,
    viewerId: string,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(profileUserId, {
        $inc: { profileViews: 1 },
        $addToSet: { profileViewers: viewerId },
      })
      .exec();
  }

  async exportProfile(
    userId: string,
    exportDto: ProfileExportDto,
  ): Promise<any> {
    const user = await this.findById(userId);

    const exportData: any = {};

    // Define available fields
    const availableFields = [
      'username',
      'email',
      'firstName',
      'lastName',
      'phone',
      'address',
      'profilePicture',
      'role',
      'isActive',
      'twoFactorEnabled',
      'lastLoginAt',
      'profileCompletionPercentage',
      'verificationBadges',
      'createdAt',
      'updatedAt',
    ];

    // Filter fields based on request
    const fieldsToExport = exportDto.fields || availableFields;
    const finalFields = fieldsToExport.filter((field) =>
      availableFields.includes(field),
    );

    // Build export data
    finalFields.forEach((field) => {
      if (exportDto.includeSensitiveData || !this.isSensitiveField(field)) {
        exportData[field] = user[field];
      }
    });

    return exportData;
  }

  private isSensitiveField(field: string): boolean {
    const sensitiveFields = [
      'password',
      'passwordResetToken',
      'twoFactorSecret',
    ];
    return sensitiveFields.includes(field);
  }

  async requestDeletion(
    userId: string,
    deletionDto: ProfileDeletionDto,
  ): Promise<void> {
    const user = await this.findById(userId);

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      deletionDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid password');
    }

    // Schedule deletion for 30 days from now
    const scheduledDeletionAt = new Date();
    scheduledDeletionAt.setDate(scheduledDeletionAt.getDate() + 30);

    await this.userModel
      .findByIdAndUpdate(userId, {
        deletionRequestedAt: new Date(),
        deletionReason: deletionDto.reason,
        scheduledDeletionAt,
      })
      .exec();
  }

  async cancelDeletionRequest(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        deletionRequestedAt: null,
        deletionReason: null,
        scheduledDeletionAt: null,
      })
      .exec();
  }

  async getProfileStats(userId: string): Promise<any> {
    const user = await this.findById(userId);

    return {
      profileCompletionPercentage: user.profileCompletionPercentage,
      profileViews: user.profileViews,
      profileViewers: user.profileViewers?.length || 0,
      lastProfileUpdate: user.lastProfileUpdate,
      profileCompletedAt: user.profileCompletedAt,
      verificationBadges: user.verificationBadges,
      daysSinceRegistration: Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      ),
    };
  }

  async addVerificationBadge(userId: string, badge: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $addToSet: { verificationBadges: badge },
      })
      .exec();
  }

  async removeVerificationBadge(userId: string, badge: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $pull: { verificationBadges: badge },
      })
      .exec();
  }

  async discoverStreamers(
    search?: string,
    category?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ streamers: any[]; pagination: any }> {
    const filter: any = {
      role: 'streamer',
      isActive: true,
    };

    // Add search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { username: searchRegex },
      ];
    }

    // Add category filter if specified
    if (category && category !== 'all') {
      // Note: Category filtering would need to be implemented based on your data model
      // For now, we'll skip category filtering until the data model supports it
    }

    const skip = (page - 1) * limit;
    const total = await this.userModel.countDocuments(filter);

    const streamers = await this.userModel
      .find(filter, { password: 0, passwordResetToken: 0, twoFactorSecret: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Transform streamers to include additional information
    const transformedStreamers = await Promise.all(
      streamers.map(async (streamer) => {
        // Get donation link information
        const donationLink = await this.getDonationLinkForStreamer(streamer._id.toString());
        
        // Get total donations amount
        const totalDonations = await this.getTotalDonationsForStreamer(streamer._id.toString());
        
        // Get follower count (placeholder - implement based on your data model)
        const followers = 0; // TODO: Implement follower system
        
        // Get stream status (placeholder - implement based on your streaming system)
        const isLive = false; // TODO: Implement live streaming detection
        
        return {
          id: streamer._id.toString(),
          email: streamer.email,
          name: `${streamer.firstName} ${streamer.lastName}`,
          username: streamer.username,
          role: streamer.role,
          avatar: streamer.profilePicture || `/api/placeholder/40/40`,
          isEmailVerified: true, // Default to true since field doesn't exist in schema
          twoFactorEnabled: streamer.twoFactorEnabled,
          status: streamer.isActive ? 'active' : 'inactive',
          createdAt: streamer.createdAt,
          totalDonations,
          isLive,
          category: 'gaming', // TODO: Implement category system
          followers,
          streamTitle: null, // TODO: Implement streaming system
          game: null, // TODO: Implement game detection
          donationLink,
        };
      })
    );

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };

    return { streamers: transformedStreamers, pagination };
  }

  private async getDonationLinkForStreamer(streamerId: string): Promise<any> {
    try {
      // Convert string ID to ObjectId
      const streamerObjectId = new Types.ObjectId(streamerId);
      
      // First try to find the default donation link
      let donationLink = await this.donationLinkModel.findOne({
        streamerId: streamerObjectId,
        isActive: true,
        isExpired: false,
        isDefault: true,
      }).exec();

      // If no default link found, get any active donation link
      if (!donationLink) {
        donationLink = await this.donationLinkModel.findOne({
          streamerId: streamerObjectId,
          isActive: true,
          isExpired: false,
        }).exec();
      }

      if (!donationLink) return null;

      return {
        id: donationLink._id.toString(),
        streamerId: donationLink.streamerId.toString(),
        slug: donationLink.slug,
        title: donationLink.title,
        description: donationLink.description,
        customUrl: donationLink.customUrl,
        qrCodeUrl: donationLink.qrCodeUrl,
        isActive: donationLink.isActive,
        allowAnonymous: donationLink.allowAnonymous,
        theme: donationLink.theme,
        isDefault: donationLink.isDefault,
        createdAt: donationLink.createdAt,
        updatedAt: donationLink.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching donation link:', error);
      return null;
    }
  }

  private async getTotalDonationsForStreamer(streamerId: string): Promise<number> {
    try {
      const result = await this.donationModel.aggregate([
        { $match: { streamerId: new Types.ObjectId(streamerId) } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).exec();

      return result.length > 0 ? result[0].total : 0;
    } catch (error) {
      console.error('Error calculating total donations:', error);
      return 0;
    }
  }

  async getDonationTotals(userId: string): Promise<{ totalViaSystem: number; totalViaBank: number; totalAll: number }> {
    const streamerObjectId = new Types.ObjectId(userId);
    const [systemAgg, bankAgg] = await Promise.all([
      this.donationModel.aggregate([
        { $match: { streamerId: streamerObjectId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).exec(),
      this.bankTxModel.aggregate([
        { $match: { streamerId: streamerObjectId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).exec(),
    ]);

    const totalViaSystem = systemAgg?.[0]?.total || 0;
    const totalViaBank = bankAgg?.[0]?.total || 0;
    const totalAll = totalViaSystem + totalViaBank;
    return { totalViaSystem, totalViaBank, totalAll };
  }

  async getStreamerProfile(username: string, currentUserId?: string) {
    const streamer = await this.findByUsername(username);
    if (!streamer || streamer.role !== 'streamer') {
      throw new NotFoundException('Streamer not found');
    }

    // Get approved streamer application data
    const streamerApplication = await this.streamerApplicationModel.findOne({
      userId: streamer._id.toString(),
      status: 'approved'
    }).sort({ createdAt: -1 }).exec();

    // Get donation link information
    const donationLink = await this.getDonationLinkForStreamer(streamer._id.toString());
    
    // Get total donations amount
    const totalDonations = await this.getTotalDonationsForStreamer(streamer._id.toString());
    
    // Get real follower count
    const followers = await this.followModel.countDocuments({
      streamerId: streamer._id,
      isActive: true
    }).exec();
    
    // Get stream status (placeholder - implement based on your streaming system)
    const isLive = false; // TODO: Implement live streaming detection
    
    // Check if current user is following this streamer
    let isFollowed = false;
    if (currentUserId) {
      const followRelationship = await this.followModel.findOne({
        followerId: new Types.ObjectId(currentUserId),
        streamerId: streamer._id,
        isActive: true
      }).exec();
      isFollowed = !!followRelationship;
    }

    // Use streamer application data if available, otherwise fall back to user data
    const displayName = streamerApplication?.displayName || `${streamer.firstName} ${streamer.lastName}`;
    const bio = streamerApplication?.description || streamer.bio || 'Passionate content creator sharing amazing moments with the community!';
    const category = streamerApplication?.contentCategory || 'gaming';
    const platform = streamerApplication?.platform || 'other';
    const channelUrl = streamerApplication?.channelUrl || streamer.website;
    const monthlyViewers = streamerApplication?.monthlyViewers || 0;
    const joinedDate = streamerApplication?.createdAt || streamer.createdAt;

    return {
      id: streamer._id.toString(),
      email: streamer.email,
      name: displayName,
      username: streamer.username,
      role: streamer.role,
      profilePicture: streamer.profilePicture ? this.fileUploadService.getProfilePictureUrl(streamer.profilePicture) : null,
      coverPhoto: streamer.coverPhoto ? this.fileUploadService.getCoverPhotoUrl(streamer.coverPhoto) : null,
      isEmailVerified: true,
      twoFactorEnabled: streamer.twoFactorEnabled,
      status: streamer.isActive ? 'active' : 'inactive',
      createdAt: joinedDate,
      totalDonations,
      isLive,
      category,
      platform,
      channelUrl,
      monthlyViewers,
      followers,
      streamTitle: null, // TODO: Implement streaming system
      game: null, // TODO: Implement game detection
      bio,
      location: streamer.location,
      website: channelUrl,
      isFollowed,
      donationLink,
      // Include streamer application data for additional context
      streamerApplication: streamerApplication ? {
        platform: streamerApplication.platform,
        channelUrl: streamerApplication.channelUrl,
        description: streamerApplication.description,
        monthlyViewers: streamerApplication.monthlyViewers,
        contentCategory: streamerApplication.contentCategory,
        reasonForApplying: streamerApplication.reasonForApplying,
        referrer: streamerApplication.referrer,
        reviewedAt: streamerApplication.reviewedAt,
        reviewNotes: streamerApplication.reviewNotes
      } : null
    };
  }

  async toggleFollow(userId: string, streamerId: string) {
    // Validate that the target user is a streamer
    const streamer = await this.findById(streamerId);
    if (!streamer || streamer.role !== 'streamer') {
      throw new NotFoundException('Streamer not found');
    }

    // Prevent users from following themselves
    if (userId === streamerId) {
      throw new BadRequestException('Users cannot follow themselves');
    }

    // Check if the follow relationship already exists (regardless of active status)
    const existingFollow = await this.followModel.findOne({
      followerId: new Types.ObjectId(userId),
      streamerId: new Types.ObjectId(streamerId)
    }).exec();

    if (existingFollow) {
      if (existingFollow.isActive) {
        // Currently following, so unfollow
        await this.followModel.findByIdAndUpdate(existingFollow._id, {
          isActive: false
        }).exec();

        // Get updated follower count
        const followerCount = await this.followModel.countDocuments({
          streamerId: new Types.ObjectId(streamerId),
          isActive: true
        }).exec();

        return {
          isFollowed: false,
          followers: followerCount,
          message: 'Successfully unfollowed'
        };
      } else {
        // Previously followed but inactive, so reactivate
        await this.followModel.findByIdAndUpdate(existingFollow._id, {
          isActive: true
        }).exec();

        // Get updated follower count
        const followerCount = await this.followModel.countDocuments({
          streamerId: new Types.ObjectId(streamerId),
          isActive: true
        }).exec();

        return {
          isFollowed: true,
          followers: followerCount,
          message: 'Successfully followed'
        };
      }
    } else {
      // Never followed before, create new relationship
      const newFollow = new this.followModel({
        followerId: new Types.ObjectId(userId),
        streamerId: new Types.ObjectId(streamerId),
        isActive: true
      });
      await newFollow.save();

      // Get updated follower count
      const followerCount = await this.followModel.countDocuments({
        streamerId: new Types.ObjectId(streamerId),
        isActive: true
      }).exec();

      return {
        isFollowed: true,
        followers: followerCount,
        message: 'Successfully followed'
      };
    }
  }
}
