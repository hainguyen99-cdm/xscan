import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { NotificationPreferences } from './schemas/notification-preferences.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('preferences')
  @ApiOperation({ summary: 'Get user notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences retrieved successfully' })
  async getNotificationPreferences(@Request() req): Promise<NotificationPreferences> {
    return this.notificationService.getNotificationPreferences(req.user.id);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated successfully' })
  async updateNotificationPreferences(
    @Request() req,
    @Body() preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    return this.notificationService.updateNotificationPreferences(req.user.id, preferences);
  }

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getUserNotifications(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    
    return this.notificationService.getUserNotifications(req.user.id, limitNum, offsetNum);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Request() req): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { count };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markNotificationAsRead(
    @Request() req,
    @Param('id') notificationId: string,
  ): Promise<void> {
    await this.notificationService.markNotificationAsRead(notificationId, req.user.id);
  }

  @Put('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllNotificationsAsRead(@Request() req): Promise<void> {
    await this.notificationService.markAllNotificationsAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  async deleteNotification(
    @Request() req,
    @Param('id') notificationId: string,
  ): Promise<void> {
    await this.notificationService.deleteNotification(notificationId, req.user.id);
  }

  @Post('test-donation-confirmation')
  @ApiOperation({ summary: 'Test donation confirmation notification (admin only)' })
  @ApiResponse({ status: 200, description: 'Test notification sent successfully' })
  async testDonationConfirmation(@Request() req): Promise<void> {
    // This is a test endpoint for development purposes
    if (req.user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await this.notificationService.sendDonationConfirmation(
      req.user.id,
      req.user.email,
      req.user.name,
      {
        donationId: 'test-donation-123',
        streamerName: 'Test Streamer',
        amount: 25.00,
        currency: 'VND',
        message: 'This is a test donation message',
        isAnonymous: false,
      },
    );
  }

  @Post('test-streamer-update')
  @ApiOperation({ summary: 'Test streamer update notification (admin only)' })
  @ApiResponse({ status: 200, description: 'Test notification sent successfully' })
  async testStreamerUpdate(@Request() req): Promise<void> {
    // This is a test endpoint for development purposes
    if (req.user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await this.notificationService.sendStreamerUpdate(
      [req.user.id],
      {
        streamerId: 'test-streamer-123',
        streamerName: 'Test Streamer',
        updateType: 'went_live',
        data: { streamTitle: 'Test Stream' },
      },
    );
  }

  @Post('test-security-alert')
  @ApiOperation({ summary: 'Test security alert notification (admin only)' })
  @ApiResponse({ status: 200, description: 'Test notification sent successfully' })
  async testSecurityAlert(@Request() req): Promise<void> {
    // This is a test endpoint for development purposes
    if (req.user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await this.notificationService.sendSecurityAlert(
      req.user.id,
      req.user.email,
      req.user.name,
      'login_attempt',
      'New login attempt detected from unknown device',
    );
  }
} 