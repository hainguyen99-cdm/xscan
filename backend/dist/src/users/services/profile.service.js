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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../schemas/user.schema");
const profile_privacy_dto_1 = require("../dto/profile-privacy.dto");
const profile_export_dto_1 = require("../dto/profile-export.dto");
const bcrypt = require("bcryptjs");
let ProfileService = class ProfileService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async calculateProfileCompletion(userId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
        requiredFields.forEach((field) => {
            if (user[field]) {
                completedFields++;
            }
        });
        optionalFields.forEach((field) => {
            if (user[field]) {
                completedFields++;
            }
        });
        const completionPercentage = Math.round((completedFields / totalFields) * 100);
        await this.userModel.findByIdAndUpdate(userId, {
            profileCompletionPercentage: completionPercentage,
            profileCompletedAt: completionPercentage === 100 ? new Date() : null,
        });
        return completionPercentage;
    }
    async updatePrivacySettings(userId, privacyDto) {
        const user = await this.userModel
            .findByIdAndUpdate(userId, {
            ...privacyDto,
            lastProfileUpdate: new Date(),
        }, { new: true })
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getPublicProfile(userId, viewerId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.profileVisibility === profile_privacy_dto_1.ProfileVisibility.PRIVATE) {
            throw new common_1.NotFoundException('Profile is private');
        }
        if (viewerId && viewerId !== userId) {
            await this.trackProfileView(userId, viewerId);
        }
        const publicProfile = {
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
    async trackProfileView(profileUserId, viewerId) {
        await this.userModel
            .findByIdAndUpdate(profileUserId, {
            $inc: { profileViews: 1 },
            $addToSet: { profileViewers: viewerId },
        })
            .exec();
    }
    async exportProfile(userId, exportDto) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const exportData = {};
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
        const fieldsToExport = exportDto.fields || availableFields;
        const finalFields = fieldsToExport.filter((field) => availableFields.includes(field));
        finalFields.forEach((field) => {
            if (exportDto.includeSensitiveData || !this.isSensitiveField(field)) {
                exportData[field] = user[field];
            }
        });
        switch (exportDto.format) {
            case profile_export_dto_1.ExportFormat.JSON:
                return exportData;
            case profile_export_dto_1.ExportFormat.CSV:
                return this.convertToCSV(exportData);
            case profile_export_dto_1.ExportFormat.PDF:
                return this.convertToPDF(exportData);
            default:
                return exportData;
        }
    }
    isSensitiveField(field) {
        const sensitiveFields = [
            'password',
            'passwordResetToken',
            'twoFactorSecret',
        ];
        return sensitiveFields.includes(field);
    }
    convertToCSV(data) {
        const headers = Object.keys(data);
        const values = Object.values(data);
        return [headers.join(','), values.join(',')].join('\n');
    }
    convertToPDF(data) {
        return data;
    }
    async requestDeletion(userId, deletionDto) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(deletionDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.NotFoundException('Invalid password');
        }
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
    async cancelDeletionRequest(userId) {
        await this.userModel
            .findByIdAndUpdate(userId, {
            deletionRequestedAt: null,
            deletionReason: null,
            scheduledDeletionAt: null,
        })
            .exec();
    }
    async getProfileStats(userId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            profileCompletionPercentage: user.profileCompletionPercentage,
            profileViews: user.profileViews,
            profileViewers: user.profileViewers?.length || 0,
            lastProfileUpdate: user.lastProfileUpdate,
            profileCompletedAt: user.profileCompletedAt,
            verificationBadges: user.verificationBadges,
            daysSinceRegistration: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        };
    }
    async addVerificationBadge(userId, badge) {
        await this.userModel
            .findByIdAndUpdate(userId, {
            $addToSet: { verificationBadges: badge },
        })
            .exec();
    }
    async removeVerificationBadge(userId, badge) {
        await this.userModel
            .findByIdAndUpdate(userId, {
            $pull: { verificationBadges: badge },
        })
            .exec();
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProfileService);
//# sourceMappingURL=profile.service.js.map