import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StreamerApplication, StreamerApplicationDocument } from './streamer-application.schema';
import { CreateStreamerApplicationDto } from './dto/create-streamer-application.dto';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notifications/notification.service';

export interface ListApplicationsParams {
  readonly status?: 'pending' | 'approved' | 'rejected';
  readonly search?: string;
  readonly limit?: number;
  readonly page?: number;
}

export interface AdminListApplicationsParams {
  readonly status?: 'pending' | 'approved' | 'rejected';
  readonly search?: string;
  readonly limit?: number;
  readonly page?: number;
}

@Injectable()
export class StreamerApplicationsService {
  constructor(
    @InjectModel(StreamerApplication.name)
    private readonly applicationModel: Model<StreamerApplicationDocument>,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}

  async createApplication(input: CreateStreamerApplicationDto, userId: string): Promise<StreamerApplication> {
    // Check if user already has a pending application
    const existingApplication = await this.applicationModel.findOne({ 
      $or: [
        { userId: userId },
        { email: input.email }
      ],
      status: 'pending'
    }).exec();
    
    if (existingApplication) {
      throw new Error('You already have a pending streamer application. Please wait for it to be reviewed.');
    }
    
    const created = await this.applicationModel.create({ 
      ...input, 
      userId,
      status: 'pending', 
      reviewedByAdminId: undefined, 
      reviewedAt: undefined 
    });
    return created.toObject();
  }

  async listApplications(params: ListApplicationsParams): Promise<{ items: StreamerApplication[]; total: number; page: number; limit: number; }> {
    const { status, search, limit = 20, page = 1 } = params;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip: number = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.applicationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      this.applicationModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async getApplicationsForAdmin(params: AdminListApplicationsParams, adminId: string): Promise<{ items: StreamerApplication[]; total: number; page: number; limit: number; }> {
    // For admin, we can see all applications regardless of status
    // This method is essentially the same as listApplications but with admin context
    return this.listApplications(params);
  }

  async getUserApplication(userId: string): Promise<StreamerApplication | null> {
    // Only return the application that belongs to this userId
    const application = await this.applicationModel
      .findOne({ userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return application ?? null;
  }

  async reviewApplication(id: string, action: 'approve' | 'reject', notes: string | undefined, adminId: string): Promise<StreamerApplication & { roleChangeInfo?: { previousRole: string; newRole: string; updated: boolean } }> {
    const application = await this.applicationModel.findById(id).exec();
    if (!application) throw new NotFoundException('Application not found');
    
    application.status = action === 'approve' ? 'approved' : 'rejected';
    application.reviewNotes = notes;
    application.reviewedByAdminId = adminId;
    application.reviewedAt = new Date();
    
    let roleChangeInfo: { previousRole: string; newRole: string; updated: boolean } | undefined;
    
    // If application is approved, update the user's role to 'streamer'
    if (action === 'approve' && application.userId) {
      try {
        // Check if user is already a streamer to avoid unnecessary updates
        const user = await this.usersService.findById(application.userId);
        const previousRole = user.role;
        
        if (user.role === 'streamer') {
          console.log(`User ${application.userId} is already a streamer, skipping role update`);
          roleChangeInfo = {
            previousRole,
            newRole: 'streamer',
            updated: false
          };
        } else {
          console.log(`Updating user ${application.userId} role from ${user.role} to streamer after application approval`);
          await this.usersService.update(application.userId, { role: 'streamer' });
          console.log(`Successfully updated user ${application.userId} role to streamer`);
          roleChangeInfo = {
            previousRole,
            newRole: 'streamer',
            updated: true
          };
        }
        
        // Send notification to user about application approval
        try {
          await this.notificationService.createSystemNotification(
            application.userId,
            'Streamer Application Approved! 🎉',
            `Congratulations! Your streamer application has been approved. You can now access your streamer dashboard and start receiving donations.`,
            {
              applicationId: application._id,
              status: 'approved',
              reviewedAt: new Date(),
              roleChange: roleChangeInfo
            }
          );
        } catch (notificationError) {
          console.error('Failed to send approval notification:', notificationError);
          // Don't fail the application review if notification fails
        }
      } catch (error) {
        console.error(`Failed to update user ${application.userId} role to streamer:`, error);
        // Don't fail the application review if role update fails
        // The admin can manually update the user role later
        // You might want to add this to a retry queue or admin notification system
      }
    } else if (action === 'reject' && application.userId) {
      // Send notification to user about application rejection
      try {
        await this.notificationService.createSystemNotification(
          application.userId,
          'Streamer Application Update',
          `Your streamer application has been reviewed. Unfortunately, it was not approved at this time. ${notes ? `Reason: ${notes}` : ''}`,
          {
            applicationId: application._id,
            status: 'rejected',
            reviewedAt: new Date(),
            reviewNotes: notes
          }
        );
      } catch (notificationError) {
        console.error('Failed to send rejection notification:', notificationError);
        // Don't fail the application review if notification fails
      }
    }
    
    await application.save();
    return { ...application.toObject(), roleChangeInfo };
  }
}


