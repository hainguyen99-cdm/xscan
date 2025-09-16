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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const file_upload_service_1 = require("./services/file-upload.service");
const profile_service_1 = require("./services/profile.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const profile_privacy_dto_1 = require("./dto/profile-privacy.dto");
const profile_export_dto_1 = require("./dto/profile-export.dto");
const profile_deletion_dto_1 = require("./dto/profile-deletion.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const optional_jwt_guard_1 = require("../auth/guards/optional-jwt.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const roles_enum_1 = require("../common/enums/roles.enum");
const multer = require("multer");
const bank_account_service_1 = require("./services/bank-account.service");
const bank_account_dto_1 = require("./dto/bank-account.dto");
let UsersController = class UsersController {
    constructor(usersService, fileUploadService, profileService, bankAccountService) {
        this.usersService = usersService;
        this.fileUploadService = fileUploadService;
        this.profileService = profileService;
        this.bankAccountService = bankAccountService;
    }
    async discoverStreamers(search, category, page = 1, limit = 20) {
        return this.usersService.discoverStreamers(search, category, page, limit);
    }
    create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    findAll(role, active) {
        if (role) {
            return this.usersService.findUsersByRole(role);
        }
        if (active === 'true') {
            return this.usersService.findActiveUsers();
        }
        return this.usersService.findAll();
    }
    getProfile(req) {
        return this.usersService.findById(req.user.sub);
    }
    getProfileStats(req) {
        return this.usersService.getProfileStats(req.user.sub);
    }
    getDonationTotals(req) {
        return this.usersService.getDonationTotals(req.user.sub);
    }
    getProfileCompletion(req) {
        return this.usersService.calculateProfileCompletion(req.user.sub);
    }
    getPublicProfile(id, req) {
        const viewerId = req.user?.sub;
        return this.usersService.getPublicProfile(id, viewerId);
    }
    async getStats() {
        const [totalUsers, activeUsers] = await Promise.all([
            this.usersService.countUsers(),
            this.usersService.countActiveUsers(),
        ]);
        return {
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers,
        };
    }
    findOne(id) {
        return this.usersService.findById(id);
    }
    update(id, updateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }
    updateProfile(req, updateUserDto) {
        return this.usersService.update(req.user.sub, updateUserDto);
    }
    updatePrivacySettings(req, privacyDto) {
        return this.usersService.updatePrivacySettings(req.user.sub, privacyDto);
    }
    async uploadProfilePicture(req, file) {
        if (!file) {
            throw new Error('No file provided');
        }
        const filePath = await this.fileUploadService.uploadProfilePicture(file, req.user.sub);
        const updatedUser = await this.usersService.update(req.user.sub, {
            profilePicture: filePath,
        });
        return {
            message: 'Profile picture uploaded successfully',
            profilePicture: this.fileUploadService.getProfilePictureUrl(filePath),
            user: updatedUser,
        };
    }
    async uploadCoverPhoto(req, file) {
        if (!file) {
            throw new Error('No file provided');
        }
        const filePath = await this.fileUploadService.uploadCoverPhoto(file, req.user.sub);
        const updatedUser = await this.usersService.update(req.user.sub, {
            coverPhoto: filePath,
        });
        return {
            message: 'Cover photo uploaded successfully',
            coverPhoto: this.fileUploadService.getCoverPhotoUrl(filePath),
            user: updatedUser,
        };
    }
    exportProfile(req, exportDto) {
        return this.usersService.exportProfile(req.user.sub, exportDto);
    }
    requestDeletion(req, deletionDto) {
        return this.usersService.requestDeletion(req.user.sub, deletionDto);
    }
    cancelDeletionRequest(req) {
        return this.usersService.cancelDeletionRequest(req.user.sub);
    }
    changePassword(req, changePasswordDto) {
        return this.usersService.changePassword(req.user.sub, changePasswordDto);
    }
    activate(id) {
        return this.usersService.activate(id);
    }
    deactivate(id) {
        return this.usersService.deactivate(id);
    }
    addVerificationBadge(id, badge) {
        return this.usersService.addVerificationBadge(id, badge);
    }
    removeVerificationBadge(id, badge) {
        return this.usersService.removeVerificationBadge(id, badge);
    }
    async remove(id) {
        return this.usersService.remove(id);
    }
    async getStreamerProfile(username, req) {
        const currentUserId = req.user?.sub;
        return this.usersService.getStreamerProfile(username, currentUserId);
    }
    async toggleFollow(req, streamerId) {
        return this.usersService.toggleFollow(req.user.sub, streamerId);
    }
    async getUserBankAccounts(req) {
        return this.bankAccountService.getUserBankAccounts(req.user.sub);
    }
    async createBankAccount(req, createBankAccountDto) {
        return this.bankAccountService.createBankAccount(req.user.sub, createBankAccountDto);
    }
    async getBankAccount(req, accountId) {
        return this.bankAccountService.getBankAccount(req.user.sub, accountId);
    }
    async updateBankAccount(req, accountId, updateBankAccountDto) {
        return this.bankAccountService.updateBankAccount(req.user.sub, accountId, updateBankAccountDto);
    }
    async deleteBankAccount(req, accountId) {
        return this.bankAccountService.deleteBankAccount(req.user.sub, accountId);
    }
    async setDefaultBankAccount(req, accountId) {
        return this.bankAccountService.setDefaultBankAccount(req.user.sub, accountId);
    }
    async getBankAccountStats(req) {
        return this.bankAccountService.getBankAccountStats(req.user.sub);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('discover/streamers'),
    (0, swagger_1.ApiOperation)({ summary: 'Discover streamers for donation (Public endpoint)' }),
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        description: 'Search query for streamer name, username, or category',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'category',
        required: false,
        description: 'Filter by streamer category',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        description: 'Page number for pagination',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Number of results per page',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Streamers retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "discoverStreamers", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermissions)('users.create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermissions)('users.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users (Admin only)' }),
    (0, swagger_1.ApiQuery)({
        name: 'role',
        required: false,
        description: 'Filter by user role',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'active',
        required: false,
        description: 'Filter by active status',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('active')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('profile.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('profile/stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('profile.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile statistics retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfileStats", null);
__decorate([
    (0, common_1.Get)('profile/donations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('profile.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get donation totals for current user (streamer)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Donation totals retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getDonationTotals", null);
__decorate([
    (0, common_1.Get)('profile/completion'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('profile.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile completion percentage' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile completion retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfileCompletion", null);
__decorate([
    (0, common_1.Get)('public/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public profile by user ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Public profile retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'User not found or profile is private',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getPublicProfile", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermissions)('users.stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user statistics (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statistics retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('id/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermissions)('users.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('id/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermissions)('users.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user by ID (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('profile/update'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('profile.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('profile/privacy'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('profile.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current user privacy settings' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Privacy settings updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, profile_privacy_dto_1.ProfilePrivacyDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updatePrivacySettings", null);
__decorate([
    (0, common_1.Post)('profile/picture'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('profile.update'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            }
            else {
                cb(new Error('Only image files are allowed'), false);
            }
        },
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload profile picture' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile picture uploaded successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Invalid file' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadProfilePicture", null);
__decorate([
    (0, common_1.Post)('profile/cover'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('profile.update'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            }
            else {
                cb(new Error('Only image files are allowed'), false);
            }
        },
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload cover photo' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cover photo uploaded successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Invalid file' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadCoverPhoto", null);
__decorate([
    (0, common_1.Post)('profile/export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('profile.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Export current user profile data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile exported successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, profile_export_dto_1.ProfileExportDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "exportProfile", null);
__decorate([
    (0, common_1.Post)('profile/deletion-request'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('profile.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Request account deletion' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Deletion request submitted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Invalid password' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, profile_deletion_dto_1.ProfileDeletionDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "requestDeletion", null);
__decorate([
    (0, common_1.Delete)('profile/deletion-request'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('profile.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel account deletion request' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Deletion request cancelled successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "cancelDeletionRequest", null);
__decorate([
    (0, common_1.Patch)('profile/change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('profile.password'),
    (0, swagger_1.ApiOperation)({ summary: 'Change current user password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password changed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Patch)('id/:id/activate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermissions)('users.activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate user account (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User activated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)('id/:id/deactivate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermissions)('users.deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate user account (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deactivated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Patch)('id/:id/badges/:badge'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermissions)('users.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Add verification badge to user (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiParam)({ name: 'badge', description: 'Badge name' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Badge added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('badge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "addVerificationBadge", null);
__decorate([
    (0, common_1.Delete)('id/:id/badges/:badge'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermissions)('users.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove verification badge from user (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiParam)({ name: 'badge', description: 'Badge name' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Badge removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('badge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "removeVerificationBadge", null);
__decorate([
    (0, common_1.Delete)('id/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermissions)('users.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('streamer/:username'),
    (0, common_1.UseGuards)(optional_jwt_guard_1.OptionalJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get streamer profile by username (Public endpoint, optional auth to resolve follow state)' }),
    (0, swagger_1.ApiParam)({ name: 'username', description: 'Streamer username' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Streamer profile retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Streamer not found' }),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getStreamerProfile", null);
__decorate([
    (0, common_1.Post)(':id/follow'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Follow or unfollow a streamer' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Streamer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Follow status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Streamer not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "toggleFollow", null);
__decorate([
    (0, common_1.Get)('bank-accounts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get user bank accounts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bank accounts retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserBankAccounts", null);
__decorate([
    (0, common_1.Post)('bank-accounts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new bank account' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bank account created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Bank account already exists' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, bank_account_dto_1.CreateBankAccountDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createBankAccount", null);
__decorate([
    (0, common_1.Get)('bank-accounts/:accountId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific bank account' }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: 'Bank account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bank account retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bank account not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getBankAccount", null);
__decorate([
    (0, common_1.Patch)('bank-accounts/:accountId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update a bank account' }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: 'Bank account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bank account updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bank account not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Bank account already exists' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('accountId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, bank_account_dto_1.UpdateBankAccountDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateBankAccount", null);
__decorate([
    (0, common_1.Delete)('bank-accounts/:accountId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a bank account' }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: 'Bank account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bank account deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bank account not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteBankAccount", null);
__decorate([
    (0, common_1.Patch)('bank-accounts/:accountId/set-default'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Set a bank account as default' }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: 'Bank account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Default bank account updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bank account not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setDefaultBankAccount", null);
__decorate([
    (0, common_1.Get)('bank-accounts/stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get bank account statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bank account statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getBankAccountStats", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        file_upload_service_1.FileUploadService,
        profile_service_1.ProfileService,
        bank_account_service_1.BankAccountService])
], UsersController);
//# sourceMappingURL=users.controller.js.map