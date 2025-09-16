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
exports.DonationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const donations_service_1 = require("./donations.service");
const common_2 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const donation_processing_service_1 = require("./donation-processing.service");
const donation_webhook_service_1 = require("./donation-webhook.service");
const create_donation_link_dto_1 = require("./dto/create-donation-link.dto");
const update_donation_link_dto_1 = require("./dto/update-donation-link.dto");
const create_donation_dto_1 = require("./dto/create-donation.dto");
const update_donation_dto_1 = require("./dto/update-donation.dto");
const donation_history_dto_1 = require("./dto/donation-history.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const roles_enum_1 = require("../common/enums/roles.enum");
const webhook_management_service_1 = require("./webhook-management.service");
let DonationsController = class DonationsController {
    constructor(donationsService, analyticsService, donationProcessingService, donationWebhookService, webhookManagementService) {
        this.donationsService = donationsService;
        this.analyticsService = analyticsService;
        this.donationProcessingService = donationProcessingService;
        this.donationWebhookService = donationWebhookService;
        this.webhookManagementService = webhookManagementService;
    }
    async createDonationLink(req, createDto) {
        const donationLink = await this.donationsService.createDonationLink(req.user.id, createDto);
        return {
            success: true,
            data: donationLink,
            message: 'Donation link created successfully',
        };
    }
    async setDefaultLink(req, id) {
        const updated = await this.donationsService.setDefaultDonationLink(req.user.id, id);
        return { success: true, data: updated };
    }
    async createBulkDonationLinks(req, createDtos) {
        const donationLinks = await this.donationsService.createBulkDonationLinks(req.user.id, createDtos);
        return {
            success: true,
            data: donationLinks,
            message: `${donationLinks.length} donation links created successfully`,
        };
    }
    async getAllDonationLinks(streamerId, isActive, isFeatured, limit = 20, page = 1) {
        const result = await this.donationsService.findAllDonationLinks(streamerId, isActive, isFeatured, limit, page);
        return {
            success: true,
            data: result.donationLinks,
            pagination: result.pagination,
            message: 'Donation links retrieved successfully',
        };
    }
    async getFeaturedDonationLinks(limit = 10) {
        const donationLinks = await this.donationsService.getFeaturedDonationLinks(limit);
        return {
            success: true,
            data: donationLinks,
            message: 'Featured donation links retrieved successfully',
        };
    }
    async getDonationLinkById(id) {
        const donationLink = await this.donationsService.findDonationLinkById(id);
        return {
            success: true,
            data: donationLink,
            message: 'Donation link retrieved successfully',
        };
    }
    async getDonationLinkBySlug(slug, req) {
        const donationLink = await this.donationsService.findDonationLinkBySlug(slug);
        await this.analyticsService.trackPageView(donationLink._id.toString(), req);
        return {
            success: true,
            data: donationLink,
            message: 'Donation link retrieved successfully',
        };
    }
    async getDonationLinkByCustomUrl(customUrl, req) {
        const donationLink = await this.donationsService.findDonationLinkByCustomUrl(customUrl);
        await this.analyticsService.trackPageView(donationLink._id.toString(), req);
        return {
            success: true,
            data: donationLink,
            message: 'Donation link retrieved successfully',
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
    async updateDonationLinkTheme(id, req, themeDto) {
        const donationLink = await this.donationsService.updateDonationLinkTheme(id, req.user.id, themeDto);
        return {
            success: true,
            data: donationLink,
            message: 'Theme updated successfully',
        };
    }
    async updateDonationLinkSocialMedia(id, req, socialMediaDto) {
        const donationLink = await this.donationsService.updateDonationLinkSocialMedia(id, req.user.id, socialMediaDto.socialMediaLinks);
        return {
            success: true,
            data: donationLink,
            message: 'Social media links updated successfully',
        };
    }
    async deleteDonationLink(id, req) {
        await this.donationsService.deleteDonationLink(id, req.user.id);
    }
    async deleteBulkDonationLinks(req, ids) {
        await this.donationsService.deleteBulkDonationLinks(ids, req.user.id);
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
            message: 'Statistics retrieved successfully',
        };
    }
    async getDonationLinkQRCode(id) {
        const donationLink = await this.donationsService.findDonationLinkById(id);
        return {
            success: true,
            data: {
                qrCodeUrl: donationLink.qrCodeUrl,
                customUrl: donationLink.customUrl,
            },
            message: 'QR code retrieved successfully',
        };
    }
    async regenerateDonationLinkQRCode(id, req) {
        const donationLink = await this.donationsService.regenerateQRCode(id, req.user.id);
        return {
            success: true,
            data: {
                qrCodeUrl: donationLink.qrCodeUrl,
                customUrl: donationLink.customUrl,
            },
            message: 'QR code regenerated successfully',
        };
    }
    async downloadDonationLinkQRCode(id) {
        const qrCodeBuffer = await this.donationsService.generateQRCodeBuffer(id);
        return {
            success: true,
            data: {
                qrCodeBuffer: qrCodeBuffer.toString('base64'),
                contentType: 'image/png',
            },
            message: 'QR code generated for download',
        };
    }
    async getDonationLinkSocialShare(id) {
        const socialShareData = await this.donationsService.getSocialShareData(id);
        return {
            success: true,
            data: socialShareData,
            message: 'Social sharing data retrieved successfully',
        };
    }
    async trackAnalyticsEvent(id, eventData) {
        await this.donationsService.trackAnalyticsEvent(id, eventData);
        return {
            success: true,
            message: 'Analytics event tracked successfully',
        };
    }
    async getAnalyticsSummary(id, days = 30, req) {
        await this.donationsService.findDonationLinkById(id);
        const analyticsSummary = await this.analyticsService.getAnalyticsSummary(id, days);
        return {
            success: true,
            data: analyticsSummary,
            message: 'Analytics summary retrieved successfully',
        };
    }
    async getRealTimeAnalytics(id, req) {
        const realTimeAnalytics = await this.analyticsService.getRealTimeAnalytics(id);
        return {
            success: true,
            data: realTimeAnalytics,
            message: 'Real-time analytics retrieved successfully',
        };
    }
    async getConversionFunnel(id, days = 30) {
        const funnelData = await this.analyticsService.getConversionFunnel(id, days);
        return {
            success: true,
            data: funnelData,
            message: 'Conversion funnel analysis retrieved successfully',
        };
    }
    async getGeographicAnalytics(id, days = 30) {
        const geoData = await this.analyticsService.getGeographicAnalytics(id, days);
        return {
            success: true,
            data: geoData,
            message: 'Geographic analytics retrieved successfully',
        };
    }
    async getPerformanceMetrics(id, days = 30) {
        const performanceData = await this.analyticsService.getPerformanceMetrics(id, days);
        return {
            success: true,
            data: performanceData,
            message: 'Performance metrics retrieved successfully',
        };
    }
    async getSocialMediaAnalytics(id, days = 30) {
        const socialData = await this.analyticsService.getSocialMediaAnalytics(id, days);
        return {
            success: true,
            data: socialData,
            message: 'Social media analytics retrieved successfully',
        };
    }
    async getUTMAnalytics(id, days = 30) {
        const utmData = await this.analyticsService.getUTMAnalytics(id, days);
        return {
            success: true,
            data: utmData,
            message: 'UTM analytics retrieved successfully',
        };
    }
    async exportAnalyticsData(id, startDate, endDate, format = 'json') {
        const exportData = await this.analyticsService.exportAnalyticsData(id, new Date(startDate), new Date(endDate), format);
        return {
            success: true,
            data: exportData,
            message: 'Analytics data exported successfully',
        };
    }
    async getStreamerAnalyticsDashboard(streamerId, days = 30) {
        const dashboardData = await this.analyticsService.getStreamerAnalyticsDashboard(streamerId, days);
        return {
            success: true,
            data: dashboardData,
            message: 'Streamer analytics dashboard retrieved successfully',
        };
    }
    async trackPageView(id, req, metadata) {
        await this.analyticsService.trackPageView(id, req, metadata);
        return {
            success: true,
            message: 'Page view tracked successfully',
        };
    }
    async trackDonationStarted(id, req, metadata) {
        await this.analyticsService.trackDonationStarted(id, req, metadata);
        return {
            success: true,
            message: 'Donation started event tracked successfully',
        };
    }
    async trackDonationCompleted(id, req, metadata) {
        await this.analyticsService.trackDonationCompleted(id, req, metadata);
        return {
            success: true,
            message: 'Donation completed event tracked successfully',
        };
    }
    async trackQRCodeScanned(id, req, metadata) {
        await this.analyticsService.trackQRCodeScanned(id, req, metadata);
        return {
            success: true,
            message: 'QR code scan event tracked successfully',
        };
    }
    async trackSocialShare(id, req, metadata) {
        await this.analyticsService.trackSocialShare(id, req, metadata);
        return {
            success: true,
            message: 'Social share event tracked successfully',
        };
    }
    async trackLinkClick(id, req, metadata) {
        await this.analyticsService.trackLinkClick(id, req, metadata);
        return {
            success: true,
            message: 'Link click tracked successfully',
        };
    }
    async createDonation(req, createDto) {
        createDto.donorId = req.user.id;
        const donation = await this.donationsService.createDonation(createDto);
        return {
            success: true,
            data: donation,
            message: 'Donation created successfully',
        };
    }
    async getDonations(streamerId, donorId, status, limit = 20, page = 1) {
        const result = await this.donationsService.findDonations(streamerId, donorId, status, limit, page);
        return {
            success: true,
            data: result.donations,
            pagination: result.pagination,
            message: 'Donations retrieved successfully',
        };
    }
    async getDonationById(id) {
        const donation = await this.donationsService.findDonationById(id);
        return {
            success: true,
            data: donation,
            message: 'Donation retrieved successfully',
        };
    }
    async updateDonation(id, updateDto) {
        const donation = await this.donationsService.updateDonation(id, updateDto);
        return {
            success: true,
            data: donation,
            message: 'Donation updated successfully',
        };
    }
    async deleteDonation(id) {
        await this.donationsService.deleteDonation(id);
        return {
            success: true,
            message: 'Donation deleted successfully',
        };
    }
    async getDonationStats(streamerId, timeRange) {
        const stats = await this.donationsService.getDonationStats(streamerId, timeRange);
        return {
            success: true,
            data: stats,
            message: 'Donation statistics retrieved successfully',
        };
    }
    async getDonationHistory(query) {
        const result = await this.donationsService.getDonationHistory(query.streamerId, query.donorId, query.status, query.paymentMethod, query.currency, query.minAmount, query.maxAmount, query.startDate ? new Date(query.startDate) : undefined, query.endDate ? new Date(query.endDate) : undefined, query.isAnonymous, query.sortBy, query.sortOrder, query.limit, query.page);
        return {
            success: true,
            data: result.donations,
            pagination: result.pagination,
            summary: result.summary,
            message: 'Donation history retrieved successfully',
        };
    }
    async getTopDonors(streamerId, query) {
        const topDonors = await this.donationsService.getTopDonors(streamerId, query.limit, query.timeRange);
        return {
            success: true,
            data: topDonors,
            message: 'Top donors retrieved successfully',
        };
    }
    async getDonationAnalytics(query) {
        const analytics = await this.donationsService.getDonationAnalytics(query.streamerId, query.timeRange);
        return {
            success: true,
            data: analytics,
            message: 'Donation analytics retrieved successfully',
        };
    }
    async getDonationTrends(query) {
        const trends = await this.donationsService.getDonationTrends(query.streamerId, query.period, query.days);
        return {
            success: true,
            data: trends,
            message: 'Donation trends retrieved successfully',
        };
    }
    async getDonationComparison(query) {
        const comparison = await this.donationsService.getDonationComparison(query.streamerId, query.currentPeriod, query.previousPeriod);
        return {
            success: true,
            data: comparison,
            message: 'Donation comparison retrieved successfully',
        };
    }
    async getDonationsByCurrency(streamerId) {
        const donationsByCurrency = await this.donationsService.getDonationsByCurrency(streamerId);
        return {
            success: true,
            data: donationsByCurrency,
            message: 'Donations by currency retrieved successfully',
        };
    }
    async processDonation(req, createDto) {
        createDto.donorId = req.user.id;
        const result = await this.donationProcessingService.processDonation(createDto);
        return {
            success: true,
            data: result,
            message: 'Donation processed successfully',
        };
    }
    async confirmExternalPayment(donationId, body) {
        const result = await this.donationProcessingService.confirmExternalPayment(donationId, body.paymentIntentId);
        return {
            success: true,
            data: result,
            message: 'Payment confirmed and donation completed',
        };
    }
    async getProcessingStatus(donationId) {
        const status = await this.donationProcessingService.getProcessingStatus(donationId);
        return {
            success: true,
            data: status,
            message: 'Donation processing status retrieved',
        };
    }
    async processStripeWebhook(signature, webhookData, request) {
        await this.donationWebhookService.handleStripeWebhook(webhookData, signature);
        return {
            success: true,
            message: 'Stripe webhook processed successfully',
        };
    }
    async processPayPalWebhook(signature, webhookData, request) {
        await this.donationWebhookService.handlePayPalWebhook(webhookData, signature);
        return {
            success: true,
            message: 'PayPal webhook processed successfully',
        };
    }
    async processDonationCompletedWebhook(signature, webhookData, request) {
        await this.donationWebhookService.processDonationCompletedWebhook(signature, webhookData);
        return {
            success: true,
            message: 'Donation completed webhook processed successfully',
        };
    }
    async processDonationStartedWebhook(signature, webhookData, request) {
        await this.donationWebhookService.processDonationStartedWebhook(signature, webhookData);
        return {
            success: true,
            message: 'Donation started webhook processed successfully',
        };
    }
    async processQRScannedWebhook(signature, webhookData, request) {
        await this.donationWebhookService.processQRScannedWebhook(signature, webhookData);
        return {
            success: true,
            message: 'QR code scanned webhook processed successfully',
        };
    }
    async processSocialShareWebhook(signature, webhookData, request) {
        await this.donationWebhookService.processSocialShareWebhook(signature, webhookData);
        return {
            success: true,
            message: 'Social media share webhook processed successfully',
        };
    }
    async processLinkClickWebhook(signature, webhookData, request) {
        await this.donationWebhookService.processLinkClickWebhook(signature, webhookData);
        return {
            success: true,
            message: 'Link click webhook processed successfully',
        };
    }
    async getWebhookEndpoints() {
        const endpoints = await this.webhookManagementService.getWebhookEndpoints();
        return {
            success: true,
            data: endpoints,
            message: 'Webhook endpoints retrieved successfully',
        };
    }
    async getWebhookEndpoint(id) {
        const endpoint = await this.webhookManagementService.getWebhookEndpoint(id);
        if (!endpoint) {
            throw new common_1.NotFoundException('Webhook endpoint not found');
        }
        return {
            success: true,
            data: endpoint,
            message: 'Webhook endpoint retrieved successfully',
        };
    }
    async upsertWebhookEndpoint(endpointData) {
        const endpoint = await this.webhookManagementService.upsertWebhookEndpoint(endpointData);
        return {
            success: true,
            data: endpoint,
            message: 'Webhook endpoint created/updated successfully',
        };
    }
    async deleteWebhookEndpoint(id) {
        const deleted = await this.webhookManagementService.deleteWebhookEndpoint(id);
        if (!deleted) {
            throw new common_1.NotFoundException('Webhook endpoint not found');
        }
        return {
            success: true,
            message: 'Webhook endpoint deleted successfully',
        };
    }
    async testWebhookEndpoint(id, testData) {
        const success = await this.webhookManagementService.testWebhookEndpoint(id, testData);
        return {
            success: true,
            data: { success },
            message: success
                ? 'Webhook endpoint tested successfully'
                : 'Webhook endpoint test failed',
        };
    }
    async getWebhookEvents(provider, eventType, status, limit, offset) {
        const filters = { provider, eventType, status, limit, offset };
        const result = await this.webhookManagementService.getWebhookEvents(filters);
        return {
            success: true,
            data: result,
            message: 'Webhook events retrieved successfully',
        };
    }
    async getWebhookEvent(eventId) {
        const event = await this.webhookManagementService.getWebhookEvent(eventId);
        if (!event) {
            throw new common_1.NotFoundException('Webhook event not found');
        }
        return {
            success: true,
            data: event,
            message: 'Webhook event retrieved successfully',
        };
    }
    async getWebhookStats() {
        const stats = await this.webhookManagementService.getWebhookStats();
        return {
            success: true,
            data: stats,
            message: 'Webhook statistics retrieved successfully',
        };
    }
    async retryFailedWebhooks() {
        const retryCount = await this.webhookManagementService.retryFailedWebhooks();
        return {
            success: true,
            data: { retryCount },
            message: `Retry process completed. ${retryCount} webhooks scheduled for retry.`,
        };
    }
    async cleanupOldWebhookEvents(daysToKeep = 30) {
        const deletedCount = await this.webhookManagementService.cleanupOldWebhookEvents(daysToKeep);
        return {
            success: true,
            data: { deletedCount, daysToKeep },
            message: `Cleanup completed. ${deletedCount} old webhook events deleted.`,
        };
    }
};
exports.DonationsController = DonationsController;
__decorate([
    (0, common_1.Post)('links'),
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
], DonationsController.prototype, "createDonationLink", null);
__decorate([
    (0, common_2.Patch)('links/:id/set-default'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Set a donation link as default for the streamer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Default link set successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "setDefaultLink", null);
__decorate([
    (0, common_1.Post)('links/bulk'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple donation links in bulk' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Donation links created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation failed',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "createBulkDonationLinks", null);
__decorate([
    (0, common_1.Get)('links'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all donation links (Public endpoint)' }),
    (0, swagger_1.ApiQuery)({
        name: 'streamerId',
        required: false,
        description: 'Filter by streamer ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isActive',
        required: false,
        description: 'Filter by active status',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isFeatured',
        required: false,
        description: 'Filter by featured status',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Number of links to return',
        type: Number,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        description: 'Page number for pagination',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation links retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('streamerId')),
    __param(1, (0, common_1.Query)('isActive')),
    __param(2, (0, common_1.Query)('isFeatured')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Boolean, Number, Number]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getAllDonationLinks", null);
__decorate([
    (0, common_1.Get)('links/featured'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured donation links (Public endpoint)' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Number of links to return',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Featured donation links retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getFeaturedDonationLinks", null);
__decorate([
    (0, common_1.Get)('links/:id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get donation link by ID (Public endpoint)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation link retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonationLinkById", null);
__decorate([
    (0, common_1.Get)('links/slug/:slug'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get donation link by slug (Public endpoint)' }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Slug of the donation link' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation link retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found or inactive',
    }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonationLinkBySlug", null);
__decorate([
    (0, common_1.Get)('links/url/:customUrl'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get donation link by custom URL (Public endpoint)' }),
    (0, swagger_1.ApiParam)({
        name: 'customUrl',
        description: 'Custom URL of the donation link',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation link retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found or inactive',
    }),
    __param(0, (0, common_1.Param)('customUrl')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonationLinkByCustomUrl", null);
__decorate([
    (0, common_1.Put)('links/:id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Update donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation link updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found or access denied',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - slug or custom URL already exists',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_donation_link_dto_1.UpdateDonationLinkDto]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "updateDonationLink", null);
__decorate([
    (0, common_1.Put)('links/:id/theme'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Update donation link theme customization' }),
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
], DonationsController.prototype, "updateDonationLinkTheme", null);
__decorate([
    (0, common_1.Put)('links/:id/social-media'),
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
], DonationsController.prototype, "updateDonationLinkSocialMedia", null);
__decorate([
    (0, common_1.Delete)('links/:id'),
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
], DonationsController.prototype, "deleteDonationLink", null);
__decorate([
    (0, common_1.Delete)('links/bulk'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete multiple donation links in bulk' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Donation links deleted successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "deleteBulkDonationLinks", null);
__decorate([
    (0, common_1.Put)('links/:id/toggle-status'),
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
], DonationsController.prototype, "toggleDonationLinkStatus", null);
__decorate([
    (0, common_1.Put)('links/:id/toggle-featured'),
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
], DonationsController.prototype, "toggleDonationLinkFeatured", null);
__decorate([
    (0, common_1.Get)('links/:id/stats'),
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
], DonationsController.prototype, "getDonationLinkStats", null);
__decorate([
    (0, common_1.Get)('links/:id/qr-code'),
    (0, swagger_1.ApiOperation)({ summary: 'Get QR code for donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'QR code retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonationLinkQRCode", null);
__decorate([
    (0, common_1.Post)('links/:id/qr-code/regenerate'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Regenerate QR code for donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'QR code regenerated successfully',
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
], DonationsController.prototype, "regenerateDonationLinkQRCode", null);
__decorate([
    (0, common_1.Get)('links/:id/qr-code/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Download QR code as PNG image' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'QR code downloaded successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "downloadDonationLinkQRCode", null);
__decorate([
    (0, common_1.Get)('links/:id/social-share'),
    (0, swagger_1.ApiOperation)({ summary: 'Get social media sharing data for donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Social sharing data retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonationLinkSocialShare", null);
__decorate([
    (0, common_1.Post)('links/:id/analytics/event'),
    (0, swagger_1.ApiOperation)({ summary: 'Track analytics event for donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Analytics event tracked successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_donation_link_dto_1.AnalyticsEventDto]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "trackAnalyticsEvent", null);
__decorate([
    (0, common_1.Get)('links/:id/analytics/summary'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER),
    (0, swagger_1.ApiOperation)({ summary: 'Get analytics summary for donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'days',
        required: false,
        description: 'Number of days to analyze',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Analytics summary retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found or access denied',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('days')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getAnalyticsSummary", null);
__decorate([
    (0, common_1.Get)('links/:id/analytics/realtime'),
    (0, swagger_1.ApiOperation)({ summary: 'Get real-time analytics for donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Real-time analytics retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getRealTimeAnalytics", null);
__decorate([
    (0, common_1.Get)('links/:id/analytics/funnel'),
    (0, swagger_1.ApiOperation)({ summary: 'Get conversion funnel analysis for donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'days',
        required: false,
        description: 'Number of days to analyze',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Conversion funnel analysis retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getConversionFunnel", null);
__decorate([
    (0, common_1.Get)('links/:id/analytics/geographic'),
    (0, swagger_1.ApiOperation)({ summary: 'Get geographic analytics for donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'days',
        required: false,
        description: 'Number of days to analyze',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Geographic analytics retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getGeographicAnalytics", null);
__decorate([
    (0, common_1.Get)('links/:id/analytics/performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance metrics for donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'days',
        required: false,
        description: 'Number of days to analyze',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Performance metrics retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getPerformanceMetrics", null);
__decorate([
    (0, common_1.Get)('links/:id/analytics/social-media'),
    (0, swagger_1.ApiOperation)({ summary: 'Get social media analytics for donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'days',
        required: false,
        description: 'Number of days to analyze',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Social media analytics retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getSocialMediaAnalytics", null);
__decorate([
    (0, common_1.Get)('links/:id/analytics/utm'),
    (0, swagger_1.ApiOperation)({ summary: 'Get UTM campaign analytics for donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'days',
        required: false,
        description: 'Number of days to analyze',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'UTM analytics retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getUTMAnalytics", null);
__decorate([
    (0, common_1.Get)('links/:id/analytics/export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export analytics data for donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: true,
        description: 'Start date (ISO string)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: true,
        description: 'End date (ISO string)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'format',
        required: false,
        description: 'Export format (json or csv)',
        enum: ['json', 'csv'],
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Analytics data exported successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "exportAnalyticsData", null);
__decorate([
    (0, common_1.Get)('streamer/:streamerId/analytics/dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get analytics dashboard for streamer' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'days',
        required: false,
        description: 'Number of days to analyze',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Streamer analytics dashboard retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getStreamerAnalyticsDashboard", null);
__decorate([
    (0, common_1.Post)('links/:id/analytics/pageview'),
    (0, swagger_1.ApiOperation)({ summary: 'Track page view for donation link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Page view tracked successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "trackPageView", null);
__decorate([
    (0, common_1.Post)('links/:id/analytics/donation-started'),
    (0, swagger_1.ApiOperation)({ summary: 'Track donation started event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation started event tracked successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "trackDonationStarted", null);
__decorate([
    (0, common_1.Post)('links/:id/analytics/donation-completed'),
    (0, swagger_1.ApiOperation)({ summary: 'Track donation completed event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation completed event tracked successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "trackDonationCompleted", null);
__decorate([
    (0, common_1.Post)('links/:id/analytics/qr-scanned'),
    (0, swagger_1.ApiOperation)({ summary: 'Track QR code scan event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'QR code scan event tracked successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "trackQRCodeScanned", null);
__decorate([
    (0, common_1.Post)('links/:id/analytics/social-share'),
    (0, swagger_1.ApiOperation)({ summary: 'Track social media share event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation link ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Social share event tracked successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "trackSocialShare", null);
__decorate([
    (0, common_1.Post)('links/:id/analytics/track-link-click'),
    (0, swagger_1.ApiOperation)({ summary: 'Track link click event' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Link click tracked successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "trackLinkClick", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new donation' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Donation created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation failed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation link not found',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_donation_dto_1.CreateDonationDto]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "createDonation", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all donations with pagination' }),
    (0, swagger_1.ApiQuery)({
        name: 'streamerId',
        required: false,
        description: 'Filter by streamer ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'donorId',
        required: false,
        description: 'Filter by donor ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        description: 'Filter by donation status',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Number of donations per page',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donations retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('streamerId')),
    __param(1, (0, common_1.Query)('donorId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonations", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get donation by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonationById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update donation' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_donation_dto_1.UpdateDonationDto]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "updateDonation", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete donation' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Donation ID' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Donation deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "deleteDonation", null);
__decorate([
    (0, common_1.Get)('stats/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get donation statistics' }),
    (0, swagger_1.ApiQuery)({
        name: 'streamerId',
        required: false,
        description: 'Filter by streamer ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'timeRange',
        required: false,
        description: 'Time range (24h, 7d, 30d, 90d)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation statistics retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('streamerId')),
    __param(1, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonationStats", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get comprehensive donation history with advanced filtering',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation history retrieved successfully',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [donation_history_dto_1.DonationHistoryQueryDto]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonationHistory", null);
__decorate([
    (0, common_1.Get)('top-donors/:streamerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top donors for a streamer' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Top donors retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, donation_history_dto_1.TopDonorsQueryDto]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getTopDonors", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get comprehensive donation analytics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation analytics retrieved successfully',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [donation_history_dto_1.DonationAnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonationAnalytics", null);
__decorate([
    (0, common_1.Get)('trends'),
    (0, swagger_1.ApiOperation)({ summary: 'Get donation trends over time' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation trends retrieved successfully',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [donation_history_dto_1.DonationTrendsQueryDto]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonationTrends", null);
__decorate([
    (0, common_1.Get)('comparison'),
    (0, swagger_1.ApiOperation)({ summary: 'Compare donation metrics between time periods' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation comparison retrieved successfully',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [donation_history_dto_1.DonationComparisonQueryDto]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonationComparison", null);
__decorate([
    (0, common_1.Get)('by-currency'),
    (0, swagger_1.ApiOperation)({ summary: 'Get donations grouped by currency' }),
    (0, swagger_1.ApiQuery)({
        name: 'streamerId',
        required: false,
        description: 'Filter by streamer ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donations by currency retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('streamerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonationsByCurrency", null);
__decorate([
    (0, common_1.Post)('process'),
    (0, swagger_1.ApiOperation)({ summary: 'Process a complete donation flow' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Donation processed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation failed',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_donation_dto_1.CreateDonationDto]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "processDonation", null);
__decorate([
    (0, common_1.Post)('confirm-payment/:donationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm external payment for a donation' }),
    (0, swagger_1.ApiParam)({ name: 'donationId', description: 'Donation ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment confirmed and donation completed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - payment confirmation failed',
    }),
    __param(0, (0, common_1.Param)('donationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "confirmExternalPayment", null);
__decorate([
    (0, common_1.Get)('processing-status/:donationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get donation processing status' }),
    (0, swagger_1.ApiParam)({ name: 'donationId', description: 'Donation ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation processing status retrieved',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation not found',
    }),
    __param(0, (0, common_1.Param)('donationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getProcessingStatus", null);
__decorate([
    (0, common_1.Post)('webhooks/stripe'),
    (0, swagger_1.ApiOperation)({ summary: 'Process Stripe webhook' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Stripe webhook processed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - invalid signature or payload',
    }),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "processStripeWebhook", null);
__decorate([
    (0, common_1.Post)('webhooks/paypal'),
    (0, swagger_1.ApiOperation)({ summary: 'Process PayPal webhook' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'PayPal webhook processed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - invalid signature or payload',
    }),
    __param(0, (0, common_1.Headers)('paypal-signature')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "processPayPalWebhook", null);
__decorate([
    (0, common_1.Post)('webhooks/donation-completed'),
    (0, swagger_1.ApiOperation)({ summary: 'Process donation completed webhook' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation completed webhook processed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation failed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation not found',
    }),
    __param(0, (0, common_1.Headers)('x-signature')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "processDonationCompletedWebhook", null);
__decorate([
    (0, common_1.Post)('webhooks/donation-started'),
    (0, swagger_1.ApiOperation)({ summary: 'Process donation started webhook' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Donation started webhook processed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation failed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation not found',
    }),
    __param(0, (0, common_1.Headers)('x-signature')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "processDonationStartedWebhook", null);
__decorate([
    (0, common_1.Post)('webhooks/qr-scanned'),
    (0, swagger_1.ApiOperation)({ summary: 'Process QR code scanned webhook' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'QR code scanned webhook processed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation failed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation not found',
    }),
    __param(0, (0, common_1.Headers)('x-signature')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "processQRScannedWebhook", null);
__decorate([
    (0, common_1.Post)('webhooks/social-share'),
    (0, swagger_1.ApiOperation)({ summary: 'Process social media share webhook' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Social media share webhook processed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation failed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation not found',
    }),
    __param(0, (0, common_1.Headers)('x-signature')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "processSocialShareWebhook", null);
__decorate([
    (0, common_1.Post)('webhooks/track-link-click'),
    (0, swagger_1.ApiOperation)({ summary: 'Process link click webhook' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Link click webhook processed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation failed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Donation not found',
    }),
    __param(0, (0, common_1.Headers)('x-signature')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "processLinkClickWebhook", null);
__decorate([
    (0, common_1.Get)('webhooks/endpoints'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all webhook endpoints' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook endpoints retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getWebhookEndpoints", null);
__decorate([
    (0, common_1.Get)('webhooks/endpoints/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get webhook endpoint by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook endpoint retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Webhook endpoint not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getWebhookEndpoint", null);
__decorate([
    (0, common_1.Post)('webhooks/endpoints'),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update webhook endpoint' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Webhook endpoint created/updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation failed',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "upsertWebhookEndpoint", null);
__decorate([
    (0, common_1.Delete)('webhooks/endpoints/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete webhook endpoint' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook endpoint deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Webhook endpoint not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "deleteWebhookEndpoint", null);
__decorate([
    (0, common_1.Post)('webhooks/endpoints/:id/test'),
    (0, swagger_1.ApiOperation)({ summary: 'Test webhook endpoint' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook endpoint tested successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - endpoint not active',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Webhook endpoint not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "testWebhookEndpoint", null);
__decorate([
    (0, common_1.Get)('webhooks/events'),
    (0, swagger_1.ApiOperation)({ summary: 'Get webhook events with filtering' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook events retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('provider')),
    __param(1, (0, common_1.Query)('eventType')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getWebhookEvents", null);
__decorate([
    (0, common_1.Get)('webhooks/events/:eventId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get webhook event by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook event retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Webhook event not found',
    }),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getWebhookEvent", null);
__decorate([
    (0, common_1.Get)('webhooks/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get webhook statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook statistics retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getWebhookStats", null);
__decorate([
    (0, common_1.Post)('webhooks/retry-failed'),
    (0, swagger_1.ApiOperation)({ summary: 'Retry failed webhook events' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Failed webhooks retry process completed',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "retryFailedWebhooks", null);
__decorate([
    (0, common_1.Post)('webhooks/cleanup'),
    (0, swagger_1.ApiOperation)({ summary: 'Clean up old webhook events' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook cleanup completed successfully',
    }),
    __param(0, (0, common_1.Query)('daysToKeep')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "cleanupOldWebhookEvents", null);
exports.DonationsController = DonationsController = __decorate([
    (0, swagger_1.ApiTags)('donations'),
    (0, common_1.Controller)('donations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [donations_service_1.DonationsService,
        analytics_service_1.AnalyticsService,
        donation_processing_service_1.DonationProcessingService,
        donation_webhook_service_1.DonationWebhookService,
        webhook_management_service_1.WebhookManagementService])
], DonationsController);
//# sourceMappingURL=donations.controller.js.map