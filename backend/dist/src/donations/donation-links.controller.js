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
exports.DonationLinksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const donations_service_1 = require("./donations.service");
const analytics_service_1 = require("./analytics.service");
const create_donation_link_dto_1 = require("./dto/create-donation-link.dto");
const update_donation_link_dto_1 = require("./dto/update-donation-link.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_enum_1 = require("../common/enums/roles.enum");
let DonationLinksController = class DonationLinksController {
    constructor(donationsService, analyticsService) {
        this.donationsService = donationsService;
        this.analyticsService = analyticsService;
    }
    async getDonationLinks(req, page = 1, limit = 10, search, status) {
        const donationLinks = await this.donationsService.getDonationLinks(req.user.id, { page, limit, search, status });
        return {
            success: true,
            data: donationLinks,
        };
    }
    async checkUrlAvailability(url, req) {
        const isAvailable = await this.donationsService.checkUrlAvailability(url, req.user.id);
        return {
            success: true,
            data: { isAvailable },
        };
    }
    async getDonationLink(id, req) {
        const donationLink = await this.donationsService.getDonationLink(id, req.user.id);
        return {
            success: true,
            data: donationLink,
        };
    }
    async createDonationLink(req, createDto) {
        const donationLink = await this.donationsService.createDonationLink(req.user.id, createDto);
        return {
            success: true,
            data: donationLink,
            message: 'Donation link created successfully',
        };
    }
    async updateDonationLink(id, req, updateDto) {
        const donationLink = await this.donationsService.updateDonationLink(id, req.user.id, updateDto);
        return {
            success: true,
            data: donationLink,
            message: 'Donation link updated successfully',
        };
    }
    async deleteDonationLink(id, req) {
        await this.donationsService.deleteDonationLink(id, req.user.id);
    }
    async updateTheme(id, req, themeDto) {
        const donationLink = await this.donationsService.updateTheme(id, req.user.id, themeDto);
        return {
            success: true,
            data: donationLink,
            message: 'Theme updated successfully',
        };
    }
    async updateSocialMedia(id, req, socialMediaDto) {
        const donationLink = await this.donationsService.updateSocialMedia(id, req.user.id, socialMediaDto);
        return {
            success: true,
            data: donationLink,
            message: 'Social media links updated successfully',
        };
    }
    async toggleDonationLinkStatus(id, req) {
        const donationLink = await this.donationsService.toggleDonationLinkStatus(id, req.user.id);
        return {
            success: true,
            data: donationLink,
            message: `Donation link ${donationLink.isActive ? 'activated' : 'deactivated'} successfully`,
        };
    }
    async toggleDonationLinkFeatured(id, req) {
        const donationLink = await this.donationsService.toggleDonationLinkFeatured(id, req.user.id);
        return {
            success: true,
            data: donationLink,
            message: `Donation link ${donationLink.isFeatured ? 'featured' : 'unfeatured'} successfully`,
        };
    }
    async getDonationLinkStats(id, req) {
        const stats = await this.donationsService.getDonationLinkStats(id, req.user.id);
        return {
            success: true,
            data: stats,
        };
    }
};
exports.DonationLinksController = DonationLinksController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all donation links for the authenticated streamer' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search term' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation links retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], DonationLinksController.prototype, "getDonationLinks", null);
__decorate([
    (0, common_1.Get)('check-url'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Check if a custom URL is available' }),
    (0, swagger_1.ApiQuery)({ name: 'url', required: true, description: 'Custom URL to check' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'URL availability checked successfully',
    }),
    __param(0, (0, common_1.Query)('url')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DonationLinksController.prototype, "checkUrlAvailability", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific donation link by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation link retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found or access denied',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DonationLinksController.prototype, "getDonationLink", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new donation link' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Donation link created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation failed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - slug or custom URL already exists',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_donation_link_dto_1.CreateDonationLinkDto]),
    __metadata("design:returntype", Promise)
], DonationLinksController.prototype, "createDonationLink", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Update a donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation link updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found or access denied',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_donation_link_dto_1.UpdateDonationLinkDto]),
    __metadata("design:returntype", Promise)
], DonationLinksController.prototype, "updateDonationLink", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Donation link deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found or access denied',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DonationLinksController.prototype, "deleteDonationLink", null);
__decorate([
    (0, common_1.Put)(':id/theme'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Update donation link theme' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Theme updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found or access denied',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_donation_link_dto_1.UpdateThemeDto]),
    __metadata("design:returntype", Promise)
], DonationLinksController.prototype, "updateTheme", null);
__decorate([
    (0, common_1.Put)(':id/social-media'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Update donation link social media links' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Social media links updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found or access denied',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_donation_link_dto_1.UpdateSocialMediaDto]),
    __metadata("design:returntype", Promise)
], DonationLinksController.prototype, "updateSocialMedia", null);
__decorate([
    (0, common_1.Put)(':id/toggle-status'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle donation link active status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation link status toggled successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found or access denied',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DonationLinksController.prototype, "toggleDonationLinkStatus", null);
__decorate([
    (0, common_1.Put)(':id/toggle-featured'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle donation link featured status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation link featured status toggled successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found or access denied',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DonationLinksController.prototype, "toggleDonationLinkFeatured", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Get donation link statistics' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statistics retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found or access denied',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DonationLinksController.prototype, "getDonationLinkStats", null);
exports.DonationLinksController = DonationLinksController = __decorate([
    (0, swagger_1.ApiTags)('donation-links'),
    (0, common_1.Controller)('donation-links'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [donations_service_1.DonationsService,
        analytics_service_1.AnalyticsService])
], DonationLinksController);
//# sourceMappingURL=donation-links.controller.js.map