import { Model } from 'mongoose';
import { EmailService } from '../email/email.service';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '../config/config.service';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { NotificationPreferences, NotificationPreferencesDocument } from './schemas/notification-preferences.schema';
export interface DonationNotificationData {
    donationId: string;
    streamerName: string;
    amount: number;
    currency: string;
    message?: string;
    isAnonymous: boolean;
}
export interface StreamerUpdateData {
    streamerId: string;
    streamerName: string;
    updateType: 'went_live' | 'ended_stream' | 'new_content' | 'milestone';
    data?: Record<string, any>;
}
export declare class NotificationService {
    private notificationModel;
    private preferencesModel;
    private emailService;
    private redisService;
    private configService;
    private readonly logger;
    constructor(notificationModel: Model<NotificationDocument>, preferencesModel: Model<NotificationPreferencesDocument>, emailService: EmailService, redisService: RedisService, configService: ConfigService);
    sendDonationConfirmation(donorId: string, donorEmail: string, donorName: string, data: DonationNotificationData): Promise<void>;
    sendStreamerUpdate(donorIds: string[], data: StreamerUpdateData): Promise<void>;
    sendSecurityAlert(userId: string, userEmail: string, userName: string, alertType: string, details: string): Promise<void>;
    createSystemNotification(userId: string, title: string, message: string, data?: Record<string, any>): Promise<NotificationDocument>;
    getNotificationPreferences(userId: string): Promise<NotificationPreferences | null>;
    updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
    getUserNotifications(userId: string, limit?: number, offset?: number): Promise<{
        notifications: Notification[];
        total: number;
    }>;
    markNotificationAsRead(notificationId: string, userId: string): Promise<void>;
    markAllNotificationsAsRead(userId: string): Promise<void>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    private sendRealTimeNotification;
    private sendPushNotification;
    private sendDonationConfirmationEmail;
    private sendSecurityAlertEmail;
    private getDonationConfirmationEmailTemplate;
    private getSecurityAlertEmailTemplate;
    private getStreamerUpdateTitle;
    private getStreamerUpdateMessage;
}
