import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationPreferences.name) private preferencesModel: Model<NotificationPreferencesDocument>,
    private emailService: EmailService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  /**
   * Send donation confirmation notification to donor
   */
  async sendDonationConfirmation(
    donorId: string,
    donorEmail: string,
    donorName: string,
    data: DonationNotificationData,
  ): Promise<void> {
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

    // Save to database
    const savedNotification = await notification.save();

    // Send email notification if enabled
    if (preferences.email && preferences.donationConfirmations) {
      await this.sendDonationConfirmationEmail(donorEmail, donorName, data);
      await this.notificationModel.findByIdAndUpdate(savedNotification._id, {
        isEmailSent: true,
      });
    }

    // Send real-time notification if enabled
    if (preferences.inApp) {
      await this.sendRealTimeNotification(donorId, savedNotification);
    }

    // Send push notification if enabled
    if (preferences.push) {
      await this.sendPushNotification(donorId, savedNotification);
    }

    this.logger.log(`Donation confirmation notification sent to donor ${donorId}`);
  }

  /**
   * Send streamer update notification to donors
   */
  async sendStreamerUpdate(
    donorIds: string[],
    data: StreamerUpdateData,
  ): Promise<void> {
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

      // Send real-time notification
      if (preferences.inApp) {
        await this.sendRealTimeNotification(donorId, savedNotification);
      }

      // Send push notification
      if (preferences.push) {
        await this.sendPushNotification(donorId, savedNotification);
      }
    }

    this.logger.log(`Streamer update notifications sent to ${donorIds.length} donors`);
  }

  /**
   * Send security alert notification
   */
  async sendSecurityAlert(
    userId: string,
    userEmail: string,
    userName: string,
    alertType: string,
    details: string,
  ): Promise<void> {
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

    // Send email for security alerts (always important)
    if (preferences.email) {
      await this.sendSecurityAlertEmail(userEmail, userName, alertType, details);
      await this.notificationModel.findByIdAndUpdate(savedNotification._id, {
        isEmailSent: true,
      });
    }

    // Send real-time notification
    if (preferences.inApp) {
      await this.sendRealTimeNotification(userId, savedNotification);
    }

    this.logger.log(`Security alert notification sent to user ${userId}`);
  }

  /**
   * Create a system notification for a user
   */
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<NotificationDocument> {
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

    // Send real-time notification
    await this.sendRealTimeNotification(userId, savedNotification);

    this.logger.log(`System notification created for user ${userId}: ${title}`);

    return savedNotification;
  }

  /**
   * Get user's notification preferences
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    let preferences = await this.preferencesModel.findOne({ userId }).exec();
    
    if (!preferences) {
      // Create default preferences
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

  /**
   * Update user's notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    return this.preferencesModel.findOneAndUpdate(
      { userId },
      preferences,
      { new: true, upsert: true },
    ).exec();
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ notifications: Notification[]; total: number }> {
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

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
    ).exec();
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    ).exec();
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await this.notificationModel.findOneAndDelete({
      _id: notificationId,
      userId,
    }).exec();
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId,
      isRead: false,
    }).exec();
  }

  /**
   * Send real-time notification via WebSocket/Redis
   */
  private async sendRealTimeNotification(userId: string, notification: Notification): Promise<void> {
    try {
      const channel = `notifications:${userId}`;
      await this.redisService.publish(channel, JSON.stringify(notification));
    } catch (error) {
      this.logger.error(`Failed to send real-time notification to user ${userId}:`, error);
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(userId: string, notification: Notification): Promise<void> {
    try {
      // TODO: Implement push notification service (Firebase, OneSignal, etc.)
      this.logger.log(`Push notification would be sent to user ${userId}: ${notification.title}`);
    } catch (error) {
      this.logger.error(`Failed to send push notification to user ${userId}:`, error);
    }
  }

  /**
   * Send donation confirmation email
   */
  private async sendDonationConfirmationEmail(
    email: string,
    name: string,
    data: DonationNotificationData,
  ): Promise<void> {
    const template = this.getDonationConfirmationEmailTemplate(name, data);
    await this.emailService.sendEmail(email, template);
  }

  /**
   * Send security alert email
   */
  private async sendSecurityAlertEmail(
    email: string,
    name: string,
    alertType: string,
    details: string,
  ): Promise<void> {
    const template = this.getSecurityAlertEmailTemplate(name, alertType, details);
    await this.emailService.sendEmail(email, template);
  }

  /**
   * Get donation confirmation email template
   */
  private getDonationConfirmationEmailTemplate(
    name: string,
    data: DonationNotificationData,
  ): { subject: string; html: string } {
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

  /**
   * Get security alert email template
   */
  private getSecurityAlertEmailTemplate(
    name: string,
    alertType: string,
    details: string,
  ): { subject: string; html: string } {
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

  /**
   * Get streamer update notification title
   */
  private getStreamerUpdateTitle(updateType: string, streamerName: string): string {
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

  /**
   * Get streamer update notification message
   */
  private getStreamerUpdateMessage(
    updateType: string,
    streamerName: string,
    data?: Record<string, any>,
  ): string {
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
} 