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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const email_service_1 = require("../email/email.service");
const redis_service_1 = require("../redis/redis.service");
const config_service_1 = require("../config/config.service");
const notification_schema_1 = require("./schemas/notification.schema");
const notification_preferences_schema_1 = require("./schemas/notification-preferences.schema");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notificationModel, preferencesModel, emailService, redisService, configService) {
        this.notificationModel = notificationModel;
        this.preferencesModel = preferencesModel;
        this.emailService = emailService;
        this.redisService = redisService;
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async sendDonationConfirmation(donorId, donorEmail, donorName, data) {
        const preferences = await this.getNotificationPreferences(donorId);
        if (!preferences) {
            this.logger.warn(`No notification preferences found for user ${donorId}`);
            return;
        }
        const notification = new this.notificationModel({
            userId: donorId,
            type: 'donation_confirmation',
            title: 'Donation Confirmed',
            message: `Your donation of ${data.currency} ${data.amount} to ${data.streamerName} has been confirmed.`,
            data,
            isRead: false,
            isEmailSent: false,
            isPushSent: false,
        });
        const savedNotification = await notification.save();
        if (preferences.email && preferences.donationConfirmations) {
            await this.sendDonationConfirmationEmail(donorEmail, donorName, data);
            await this.notificationModel.findByIdAndUpdate(savedNotification._id, {
                isEmailSent: true,
            });
        }
        if (preferences.inApp) {
            await this.sendRealTimeNotification(donorId, savedNotification);
        }
        if (preferences.push) {
            await this.sendPushNotification(donorId, savedNotification);
        }
        this.logger.log(`Donation confirmation notification sent to donor ${donorId}`);
    }
    async sendStreamerUpdate(donorIds, data) {
        for (const donorId of donorIds) {
            const preferences = await this.getNotificationPreferences(donorId);
            if (!preferences || !preferences.streamerUpdates) {
                continue;
            }
            const notification = new this.notificationModel({
                userId: donorId,
                type: 'streamer_update',
                title: this.getStreamerUpdateTitle(data.updateType, data.streamerName),
                message: this.getStreamerUpdateMessage(data.updateType, data.streamerName, data.data),
                data,
                isRead: false,
                isEmailSent: false,
                isPushSent: false,
            });
            const savedNotification = await notification.save();
            if (preferences.inApp) {
                await this.sendRealTimeNotification(donorId, savedNotification);
            }
            if (preferences.push) {
                await this.sendPushNotification(donorId, savedNotification);
            }
        }
        this.logger.log(`Streamer update notifications sent to ${donorIds.length} donors`);
    }
    async sendSecurityAlert(userId, userEmail, userName, alertType, details) {
        const preferences = await this.getNotificationPreferences(userId);
        if (!preferences || !preferences.securityAlerts) {
            return;
        }
        const notification = new this.notificationModel({
            userId,
            type: 'security_alert',
            title: 'Security Alert',
            message: `Security alert: ${details}`,
            data: { alertType, details },
            isRead: false,
            isEmailSent: false,
            isPushSent: false,
        });
        const savedNotification = await notification.save();
        if (preferences.email) {
            await this.sendSecurityAlertEmail(userEmail, userName, alertType, details);
            await this.notificationModel.findByIdAndUpdate(savedNotification._id, {
                isEmailSent: true,
            });
        }
        if (preferences.inApp) {
            await this.sendRealTimeNotification(userId, savedNotification);
        }
        this.logger.log(`Security alert notification sent to user ${userId}`);
    }
    async createSystemNotification(userId, title, message, data) {
        const notification = new this.notificationModel({
            userId,
            type: 'system',
            title,
            message,
            data,
            isRead: false,
            isEmailSent: false,
            isPushSent: false,
        });
        const savedNotification = await notification.save();
        await this.sendRealTimeNotification(userId, savedNotification);
        this.logger.log(`System notification created for user ${userId}: ${title}`);
        return savedNotification;
    }
    async getNotificationPreferences(userId) {
        let preferences = await this.preferencesModel.findOne({ userId }).exec();
        if (!preferences) {
            preferences = await this.preferencesModel.create({
                userId,
                email: true,
                inApp: true,
                push: false,
                donationConfirmations: true,
                streamerUpdates: true,
                securityAlerts: true,
                marketing: false,
            });
        }
        return preferences;
    }
    async updateNotificationPreferences(userId, preferences) {
        return this.preferencesModel.findOneAndUpdate({ userId }, preferences, { new: true, upsert: true }).exec();
    }
    async getUserNotifications(userId, limit = 50, offset = 0) {
        const [notifications, total] = await Promise.all([
            this.notificationModel
                .find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(offset)
                .exec(),
            this.notificationModel.countDocuments({ userId }).exec(),
        ]);
        return { notifications, total };
    }
    async markNotificationAsRead(notificationId, userId) {
        await this.notificationModel.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true, readAt: new Date() }).exec();
    }
    async markAllNotificationsAsRead(userId) {
        await this.notificationModel.updateMany({ userId, isRead: false }, { isRead: true, readAt: new Date() }).exec();
    }
    async deleteNotification(notificationId, userId) {
        await this.notificationModel.findOneAndDelete({
            _id: notificationId,
            userId,
        }).exec();
    }
    async getUnreadCount(userId) {
        return this.notificationModel.countDocuments({
            userId,
            isRead: false,
        }).exec();
    }
    async sendRealTimeNotification(userId, notification) {
        try {
            const channel = `notifications:${userId}`;
            await this.redisService.publish(channel, JSON.stringify(notification));
        }
        catch (error) {
            this.logger.error(`Failed to send real-time notification to user ${userId}:`, error);
        }
    }
    async sendPushNotification(userId, notification) {
        try {
            this.logger.log(`Push notification would be sent to user ${userId}: ${notification.title}`);
        }
        catch (error) {
            this.logger.error(`Failed to send push notification to user ${userId}:`, error);
        }
    }
    async sendDonationConfirmationEmail(email, name, data) {
        const template = this.getDonationConfirmationEmailTemplate(name, data);
        await this.emailService.sendEmail(email, template);
    }
    async sendSecurityAlertEmail(email, name, alertType, details) {
        const template = this.getSecurityAlertEmailTemplate(name, alertType, details);
        await this.emailService.sendEmail(email, template);
    }
    getDonationConfirmationEmailTemplate(name, data) {
        const subject = `Donation Confirmed - ${data.currency} ${data.amount} to ${data.streamerName}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Donation Confirmed</h2>
        <p>Hi ${name},</p>
        <p>Your donation has been successfully processed!</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Donation Details</h3>
          <p><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
          <p><strong>To:</strong> ${data.streamerName}</p>
          ${data.message ? `<p><strong>Message:</strong> "${data.message}"</p>` : ''}
          <p><strong>Anonymous:</strong> ${data.isAnonymous ? 'Yes' : 'No'}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p>Thank you for supporting content creators!</p>
        <p>Best regards,<br>The XScan Team</p>
      </div>
    `;
        return { subject, html };
    }
    getSecurityAlertEmailTemplate(name, alertType, details) {
        const subject = `Security Alert - ${alertType}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">Security Alert</h2>
        <p>Hi ${name},</p>
        <p>We detected a security event on your account that requires your attention.</p>
        
        <div style="background-color: #FEF2F2; border: 1px solid #FECACA; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #DC2626;">Alert Details</h3>
          <p><strong>Type:</strong> ${alertType}</p>
          <p><strong>Details:</strong> ${details}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <p>If you didn't perform this action, please contact our support team immediately.</p>
        <p>Best regards,<br>The XScan Security Team</p>
      </div>
    `;
        return { subject, html };
    }
    getStreamerUpdateTitle(updateType, streamerName) {
        switch (updateType) {
            case 'went_live':
                return `${streamerName} is now live!`;
            case 'ended_stream':
                return `${streamerName} ended their stream`;
            case 'new_content':
                return `${streamerName} posted new content`;
            case 'milestone':
                return `${streamerName} reached a milestone!`;
            default:
                return `${streamerName} update`;
        }
    }
    getStreamerUpdateMessage(updateType, streamerName, data) {
        switch (updateType) {
            case 'went_live':
                return `${streamerName} just went live! Don't miss out on the action.`;
            case 'ended_stream':
                return `${streamerName} has ended their stream. Check out their content later!`;
            case 'new_content':
                return `${streamerName} has posted new content for you to enjoy.`;
            case 'milestone':
                const milestone = data?.milestone || 'a milestone';
                return `Congratulations! ${streamerName} has reached ${milestone}!`;
            default:
                return `${streamerName} has an update for you.`;
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(1, (0, mongoose_1.InjectModel)(notification_preferences_schema_1.NotificationPreferences.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        email_service_1.EmailService,
        redis_service_1.RedisService,
        config_service_1.ConfigService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map