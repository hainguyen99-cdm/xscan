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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const follow_schema_1 = require("./schemas/follow.schema");
const streamer_application_schema_1 = require("../streamer-applications/streamer-application.schema");
const bank_transaction_schema_1 = require("../bank-sync/schemas/bank-transaction.schema");
const file_upload_service_1 = require("./services/file-upload.service");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(userModel, followModel, streamerApplicationModel, donationLinkModel, donationModel, bankTxModel, fileUploadService) {
        this.userModel = userModel;
        this.followModel = followModel;
        this.streamerApplicationModel = streamerApplicationModel;
        this.donationLinkModel = donationLinkModel;
        this.donationModel = donationModel;
        this.bankTxModel = bankTxModel;
        this.fileUploadService = fileUploadService;
    }
    async create(createUserDto) {
        const existingUser = await this.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        if (createUserDto.username) {
            const existingUsername = await this.findByUsername(createUserDto.username);
            if (existingUsername) {
                throw new common_1.ConflictException('Username is already taken');
            }
        }
        const createdUser = new this.userModel(createUserDto);
        const savedUser = await createdUser.save();
        await this.calculateProfileCompletion(savedUser._id.toString());
        return savedUser;
    }
    async findAll() {
        return this.userModel.find({}, { password: 0 }).exec();
    }
    async findById(id) {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async findUsersWithBankToken() {
        return this.userModel
            .find({ role: 'streamer', bankToken: { $exists: true, $ne: '' } })
            .select('_id bankToken')
            .lean();
    }
    async findByUsername(username) {
        return this.userModel.findOne({ username }).exec();
    }
    async findByPasswordResetToken(token) {
        return this.userModel.findOne({ passwordResetToken: token }).exec();
    }
    async update(id, updateUserDto) {
        if (updateUserDto.email) {
            const existingUser = await this.findByEmail(updateUserDto.email);
            if (existingUser && existingUser._id.toString() !== id) {
                throw new common_1.ConflictException('Email is already taken by another user');
            }
        }
        if (updateUserDto.username) {
            const existingUser = await this.findByUsername(updateUserDto.username);
            if (existingUser && existingUser._id.toString() !== id) {
                throw new common_1.ConflictException('Username is already taken by another user');
            }
        }
        const updatedUser = await this.userModel
            .findByIdAndUpdate(id, {
            ...updateUserDto,
            lastProfileUpdate: new Date(),
        }, { new: true })
            .exec();
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.calculateProfileCompletion(id);
        return updatedUser;
    }
    async changePassword(id, changePasswordDto) {
        const user = await this.findById(id);
        const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
        await this.userModel
            .findByIdAndUpdate(id, { password: hashedNewPassword })
            .exec();
    }
    async setPasswordResetToken(userId, token, expires) {
        await this.userModel
            .findByIdAndUpdate(userId, {
            passwordResetToken: token,
            passwordResetExpires: expires,
        })
            .exec();
    }
    async resetPassword(userId, hashedPassword) {
        await this.userModel
            .findByIdAndUpdate(userId, {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
        })
            .exec();
    }
    async setTwoFactorSecret(userId, secret) {
        await this.userModel
            .findByIdAndUpdate(userId, { twoFactorSecret: secret })
            .exec();
    }
    async enableTwoFactor(userId) {
        const user = await this.userModel
            .findByIdAndUpdate(userId, { twoFactorEnabled: true }, { new: true })
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async disableTwoFactor(userId) {
        const user = await this.userModel
            .findByIdAndUpdate(userId, {
            twoFactorEnabled: false,
            twoFactorSecret: null,
        }, { new: true })
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateLastLogin(userId) {
        await this.userModel
            .findByIdAndUpdate(userId, { lastLoginAt: new Date() })
            .exec();
    }
    async deactivate(id) {
        const user = await this.userModel
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async activate(id) {
        const user = await this.userModel
            .findByIdAndUpdate(id, { isActive: true }, { new: true })
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async remove(id) {
        const result = await this.userModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async findActiveUsers() {
        return this.userModel.find({ isActive: true }, { password: 0 }).exec();
    }
    async findUsersByRole(role) {
        return this.userModel.find({ role }, { password: 0 }).exec();
    }
    async countUsers() {
        return this.userModel.countDocuments().exec();
    }
    async countActiveUsers() {
        return this.userModel.countDocuments({ isActive: true }).exec();
    }
    async calculateProfileCompletion(userId) {
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
        const user = await this.findById(userId);
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
        const user = await this.findById(userId);
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
        return exportData;
    }
    isSensitiveField(field) {
        const sensitiveFields = [
            'password',
            'passwordResetToken',
            'twoFactorSecret',
        ];
        return sensitiveFields.includes(field);
    }
    async requestDeletion(userId, deletionDto) {
        const user = await this.findById(userId);
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
        const user = await this.findById(userId);
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
    async discoverStreamers(search, category, page = 1, limit = 20) {
        const filter = {
            role: 'streamer',
            isActive: true,
        };
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { username: searchRegex },
            ];
        }
        if (category && category !== 'all') {
        }
        const skip = (page - 1) * limit;
        const total = await this.userModel.countDocuments(filter);
        const streamers = await this.userModel
            .find(filter, { password: 0, passwordResetToken: 0, twoFactorSecret: 0 })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const transformedStreamers = await Promise.all(streamers.map(async (streamer) => {
            const donationLink = await this.getDonationLinkForStreamer(streamer._id.toString());
            const totalDonations = await this.getTotalDonationsForStreamer(streamer._id.toString());
            const followers = 0;
            const isLive = false;
            return {
                id: streamer._id.toString(),
                email: streamer.email,
                name: `${streamer.firstName} ${streamer.lastName}`,
                username: streamer.username,
                role: streamer.role,
                avatar: streamer.profilePicture || `/api/placeholder/40/40`,
                isEmailVerified: true,
                twoFactorEnabled: streamer.twoFactorEnabled,
                status: streamer.isActive ? 'active' : 'inactive',
                createdAt: streamer.createdAt,
                totalDonations,
                isLive,
                category: 'gaming',
                followers,
                streamTitle: null,
                game: null,
                donationLink,
            };
        }));
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
    async getDonationLinkForStreamer(streamerId) {
        try {
            const streamerObjectId = new mongoose_2.Types.ObjectId(streamerId);
            let donationLink = await this.donationLinkModel.findOne({
                streamerId: streamerObjectId,
                isActive: true,
                isExpired: false,
                isDefault: true,
            }).exec();
            if (!donationLink) {
                donationLink = await this.donationLinkModel.findOne({
                    streamerId: streamerObjectId,
                    isActive: true,
                    isExpired: false,
                }).exec();
            }
            if (!donationLink)
                return null;
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
        }
        catch (error) {
            console.error('Error fetching donation link:', error);
            return null;
        }
    }
    async getTotalDonationsForStreamer(streamerId) {
        try {
            const result = await this.donationModel.aggregate([
                { $match: { streamerId: new mongoose_2.Types.ObjectId(streamerId) } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]).exec();
            return result.length > 0 ? result[0].total : 0;
        }
        catch (error) {
            console.error('Error calculating total donations:', error);
            return 0;
        }
    }
    async getDonationTotals(userId) {
        const streamerObjectId = new mongoose_2.Types.ObjectId(userId);
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
    async getStreamerProfile(username, currentUserId) {
        const streamer = await this.findByUsername(username);
        if (!streamer || streamer.role !== 'streamer') {
            throw new common_1.NotFoundException('Streamer not found');
        }
        const streamerApplication = await this.streamerApplicationModel.findOne({
            userId: streamer._id.toString(),
            status: 'approved'
        }).sort({ createdAt: -1 }).exec();
        const donationLink = await this.getDonationLinkForStreamer(streamer._id.toString());
        const totalDonations = await this.getTotalDonationsForStreamer(streamer._id.toString());
        const followers = await this.followModel.countDocuments({
            streamerId: streamer._id,
            isActive: true
        }).exec();
        const isLive = false;
        let isFollowed = false;
        if (currentUserId) {
            const followRelationship = await this.followModel.findOne({
                followerId: new mongoose_2.Types.ObjectId(currentUserId),
                streamerId: streamer._id,
                isActive: true
            }).exec();
            isFollowed = !!followRelationship;
        }
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
            streamTitle: null,
            game: null,
            bio,
            location: streamer.location,
            website: channelUrl,
            isFollowed,
            donationLink,
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
    async toggleFollow(userId, streamerId) {
        const streamer = await this.findById(streamerId);
        if (!streamer || streamer.role !== 'streamer') {
            throw new common_1.NotFoundException('Streamer not found');
        }
        if (userId === streamerId) {
            throw new common_1.BadRequestException('Users cannot follow themselves');
        }
        const existingFollow = await this.followModel.findOne({
            followerId: new mongoose_2.Types.ObjectId(userId),
            streamerId: new mongoose_2.Types.ObjectId(streamerId)
        }).exec();
        if (existingFollow) {
            if (existingFollow.isActive) {
                await this.followModel.findByIdAndUpdate(existingFollow._id, {
                    isActive: false
                }).exec();
                const followerCount = await this.followModel.countDocuments({
                    streamerId: new mongoose_2.Types.ObjectId(streamerId),
                    isActive: true
                }).exec();
                return {
                    isFollowed: false,
                    followers: followerCount,
                    message: 'Successfully unfollowed'
                };
            }
            else {
                await this.followModel.findByIdAndUpdate(existingFollow._id, {
                    isActive: true
                }).exec();
                const followerCount = await this.followModel.countDocuments({
                    streamerId: new mongoose_2.Types.ObjectId(streamerId),
                    isActive: true
                }).exec();
                return {
                    isFollowed: true,
                    followers: followerCount,
                    message: 'Successfully followed'
                };
            }
        }
        else {
            const newFollow = new this.followModel({
                followerId: new mongoose_2.Types.ObjectId(userId),
                streamerId: new mongoose_2.Types.ObjectId(streamerId),
                isActive: true
            });
            await newFollow.save();
            const followerCount = await this.followModel.countDocuments({
                streamerId: new mongoose_2.Types.ObjectId(streamerId),
                isActive: true
            }).exec();
            return {
                isFollowed: true,
                followers: followerCount,
                message: 'Successfully followed'
            };
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(follow_schema_1.Follow.name)),
    __param(2, (0, mongoose_1.InjectModel)(streamer_application_schema_1.StreamerApplication.name)),
    __param(3, (0, mongoose_1.InjectModel)('DonationLink')),
    __param(4, (0, mongoose_1.InjectModel)('Donation')),
    __param(5, (0, mongoose_1.InjectModel)(bank_transaction_schema_1.BankTransaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        file_upload_service_1.FileUploadService])
], UsersService);
//# sourceMappingURL=users.service.js.map