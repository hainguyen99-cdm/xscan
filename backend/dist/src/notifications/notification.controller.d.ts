import { NotificationService } from './notification.service';
import { NotificationPreferences } from './schemas/notification-preferences.schema';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    getNotificationPreferences(req: any): Promise<NotificationPreferences>;
    updateNotificationPreferences(req: any, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
    getUserNotifications(req: any, limit?: string, offset?: string): Promise<{
        notifications: import("./schemas/notification.schema").Notification[];
        total: number;
    }>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markNotificationAsRead(req: any, notificationId: string): Promise<void>;
    markAllNotificationsAsRead(req: any): Promise<void>;
    deleteNotification(req: any, notificationId: string): Promise<void>;
    testDonationConfirmation(req: any): Promise<void>;
    testStreamerUpdate(req: any): Promise<void>;
    testSecurityAlert(req: any): Promise<void>;
}
