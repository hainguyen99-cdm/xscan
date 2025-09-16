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
exports.AdminUserManagementService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const transaction_schema_1 = require("../payments/schemas/transaction.schema");
const donation_schema_1 = require("../donations/schemas/donation.schema");
const obs_settings_schema_1 = require("../obs-settings/obs-settings.schema");
let AdminUserManagementService = class AdminUserManagementService {
    constructor(userModel, transactionModel, donationModel, obsSettingsModel) {
        this.userModel = userModel;
        this.transactionModel = transactionModel;
        this.donationModel = donationModel;
        this.obsSettingsModel = obsSettingsModel;
    }
    async getUsers(filters, adminId) {
        const { page = 1, limit = 20, ...filterCriteria } = filters;
        const skip = (page - 1) * limit;
        const query = {};
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
        const total = await this.userModel.countDocuments(query);
        const users = await this.userModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-password')
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
    async getUserById(userId, adminId) {
        const user = await this.userModel
            .findById(userId)
            .select('-password')
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateUser(userId, updateData, adminId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (updateData.username) {
            const existingUser = await this.userModel.findOne({
                username: updateData.username,
                _id: { $ne: userId }
            }).exec();
            if (existingUser) {
                throw new common_1.BadRequestException('Username already taken');
            }
            user.username = updateData.username;
        }
        if (updateData.email) {
            const existingUser = await this.userModel.findOne({
                email: updateData.email,
                _id: { $ne: userId }
            }).exec();
            if (existingUser) {
                throw new common_1.BadRequestException('Email already taken');
            }
            user.email = updateData.email;
        }
        if (updateData.role) {
            user.role = updateData.role;
        }
        if (typeof updateData.bankToken === 'string') {
            user.bankToken = updateData.bankToken.trim();
        }
        if (updateData.firstName) {
            user.firstName = updateData.firstName;
        }
        if (updateData.lastName) {
            user.lastName = updateData.lastName;
        }
        if (updateData.twoFactorEnabled !== undefined) {
            user.twoFactorEnabled = Boolean(updateData.twoFactorEnabled);
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
        await this.logAdminActivity(adminId, 'user_updated', `Updated user ${user.username}`, 'user', userId, updateData);
        return await user.save();
    }
    async updateUserStatus(userId, statusData, adminId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const previousStatus = user.isActive;
        user.isActive = statusData.status === 'active';
        await this.logAdminActivity(adminId, 'user_status_changed', `Changed user ${user.username} status from ${previousStatus} to ${statusData.status}`, 'user', userId, statusData);
        return await user.save();
    }
    async verifyUser(userId, adminId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.verificationBadges) {
            user.verificationBadges = [];
        }
        if (user.verificationBadges.includes('admin_verified')) {
            throw new common_1.BadRequestException('User is already verified');
        }
        user.verificationBadges.push('admin_verified');
        await this.logAdminActivity(adminId, 'user_verified', `Verified user ${user.username}`, 'user', userId);
        return await user.save();
    }
    async unverifyUser(userId, adminId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.verificationBadges || !user.verificationBadges.includes('admin_verified')) {
            throw new common_1.BadRequestException('User is not verified');
        }
        user.verificationBadges = user.verificationBadges.filter(badge => badge !== 'admin_verified');
        await this.logAdminActivity(adminId, 'user_unverified', `Removed verification from user ${user.username}`, 'user', userId);
        return await user.save();
    }
    async deleteUser(userId, adminId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
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
            throw new common_1.BadRequestException('Cannot delete user with active transactions or donations');
        }
        user.isActive = false;
        user.deletionRequestedAt = new Date();
        user.deletionReason = 'Admin deletion';
        await this.logAdminActivity(adminId, 'user_deleted', `Deleted user ${user.username}`, 'user', userId);
        await user.save();
    }
    async getUserStats(userId, adminId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const [totalTransactions, totalDonations, totalRevenue, totalFees, obsSettings,] = await Promise.all([
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
                            { userId: new mongoose_2.Types.ObjectId(userId) },
                            { recipientId: new mongoose_2.Types.ObjectId(userId) }
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
                            { userId: new mongoose_2.Types.ObjectId(userId) },
                            { recipientId: new mongoose_2.Types.ObjectId(userId) }
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
    async exportUsers(format, filters, adminId) {
        const query = {};
        if (filters.searchTerm) {
            query.$or = [
                { username: { $regex: filters.searchTerm, $options: 'i' } },
                { email: { $regex: filters.searchTerm, $options: 'i' } },
            ];
        }
        if (filters.role)
            query.role = filters.role;
        if (filters.status)
            query.isActive = filters.status === 'active';
        if (filters.isVerified !== undefined) {
            query.verificationBadges = { $exists: true, $ne: [] };
        }
        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate)
                query.createdAt.$gte = new Date(filters.startDate);
            if (filters.endDate)
                query.createdAt.$lte = new Date(filters.endDate);
        }
        const users = await this.userModel
            .find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .exec();
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
                throw new common_1.BadRequestException(`Unsupported export format: ${format}`);
        }
    }
    convertToCSV(data) {
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
    convertToPDF(data) {
        const content = data.map(user => `ID: ${user._id}\nUsername: ${user.username}\nEmail: ${user.email}\nRole: ${user.role}\nActive: ${user.isActive ? 'Yes' : 'No'}\nVerified: ${user.verificationBadges && user.verificationBadges.length > 0 ? 'Yes' : 'No'}\nCreated: ${user.createdAt}\n`).join('\n');
        return Buffer.from(content);
    }
    convertToExcel(data) {
        return this.convertToCSV(data);
    }
    async logAdminActivity(adminId, type, description, resourceType, resourceId, metadata) {
        console.log(`Admin Activity: ${adminId} - ${type} - ${description} - ${resourceType}:${resourceId}`, metadata);
    }
};
exports.AdminUserManagementService = AdminUserManagementService;
exports.AdminUserManagementService = AdminUserManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __param(2, (0, mongoose_1.InjectModel)(donation_schema_1.Donation.name)),
    __param(3, (0, mongoose_1.InjectModel)(obs_settings_schema_1.OBSSettings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AdminUserManagementService);
//# sourceMappingURL=admin-user-management.service.js.map