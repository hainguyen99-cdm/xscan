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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_service_1 = require("./notification.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async getNotificationPreferences(req) {
        return this.notificationService.getNotificationPreferences(req.user.id);
    }
    async updateNotificationPreferences(req, preferences) {
        return this.notificationService.updateNotificationPreferences(req.user.id, preferences);
    }
    async getUserNotifications(req, limit, offset) {
        const limitNum = limit ? parseInt(limit, 10) : 50;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        return this.notificationService.getUserNotifications(req.user.id, limitNum, offsetNum);
    }
    async getUnreadCount(req) {
        const count = await this.notificationService.getUnreadCount(req.user.id);
        return { count };
    }
    async markNotificationAsRead(req, notificationId) {
        await this.notificationService.markNotificationAsRead(notificationId, req.user.id);
    }
    async markAllNotificationsAsRead(req) {
        await this.notificationService.markAllNotificationsAsRead(req.user.id);
    }
    async deleteNotification(req, notificationId) {
        await this.notificationService.deleteNotification(notificationId, req.user.id);
    }
    async testDonationConfirmation(req) {
        if (req.user.role !== 'admin') {
            throw new Error('Admin access required');
        }
        await this.notificationService.sendDonationConfirmation(req.user.id, req.user.email, req.user.name, {
            donationId: 'test-donation-123',
            streamerName: 'Test Streamer',
            amount: 25.00,
            currency: 'VND',
            message: 'This is a test donation message',
            isAnonymous: false,
        });
    }
    async testStreamerUpdate(req) {
        if (req.user.role !== 'admin') {
            throw new Error('Admin access required');
        }
        await this.notificationService.sendStreamerUpdate([req.user.id], {
            streamerId: 'test-streamer-123',
            streamerName: 'Test Streamer',
            updateType: 'went_live',
            data: { streamTitle: 'Test Stream' },
        });
    }
    async testSecurityAlert(req) {
        if (req.user.role !== 'admin') {
            throw new Error('Admin access required');
        }
        await this.notificationService.sendSecurityAlert(req.user.id, req.user.email, req.user.name, 'login_attempt', 'New login attempt detected from unknown device');
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Get)('preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user notification preferences' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification preferences retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotificationPreferences", null);
__decorate([
    (0, common_1.Put)('preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user notification preferences' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification preferences updated successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "updateNotificationPreferences", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user notifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUserNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread notification count' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Unread count retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Put)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marked as read' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markNotificationAsRead", null);
__decorate([
    (0, common_1.Put)('mark-all-read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all notifications as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All notifications marked as read' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllNotificationsAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification deleted successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Post)('test-donation-confirmation'),
    (0, swagger_1.ApiOperation)({ summary: 'Test donation confirmation notification (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test notification sent successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "testDonationConfirmation", null);
__decorate([
    (0, common_1.Post)('test-streamer-update'),
    (0, swagger_1.ApiOperation)({ summary: 'Test streamer update notification (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test notification sent successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "testStreamerUpdate", null);
__decorate([
    (0, common_1.Post)('test-security-alert'),
    (0, swagger_1.ApiOperation)({ summary: 'Test security alert notification (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test notification sent successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "testSecurityAlert", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map