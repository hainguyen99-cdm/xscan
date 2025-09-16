import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import {
  ProfilePrivacyDto,
  ProfileVisibility,
} from '../dto/profile-privacy.dto';
import { ProfileExportDto, ExportFormat } from '../dto/profile-export.dto';
import { ProfileDeletionDto } from '../dto/profile-deletion.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ProfileService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async calculateProfileCompletion(userId: string): Promise<number> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

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
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check profile visibility
    if (user.profileVisibility === ProfileVisibility.PRIVATE) {
      throw new NotFoundException('Profile is private');
    }

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
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

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

    // Format based on export format
    switch (exportDto.format) {
      case ExportFormat.JSON:
        return exportData;
      case ExportFormat.CSV:
        return this.convertToCSV(exportData);
      case ExportFormat.PDF:
        return this.convertToPDF(exportData);
      default:
        return exportData;
    }
  }

  private isSensitiveField(field: string): boolean {
    const sensitiveFields = [
      'password',
      'passwordResetToken',
      'twoFactorSecret',
    ];
    return sensitiveFields.includes(field);
  }

  private convertToCSV(data: any): string {
    const headers = Object.keys(data);
    const values = Object.values(data);
    return [headers.join(','), values.join(',')].join('\n');
  }

  private convertToPDF(data: any): any {
    // This would typically use a PDF library like pdfkit
    // For now, return the data as-is
    return data;
  }

  async requestDeletion(
    userId: string,
    deletionDto: ProfileDeletionDto,
  ): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

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
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

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
}
