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
export declare class StreamerApplicationsService {
    private readonly applicationModel;
    private readonly usersService;
    private readonly notificationService;
    constructor(applicationModel: Model<StreamerApplicationDocument>, usersService: UsersService, notificationService: NotificationService);
    createApplication(input: CreateStreamerApplicationDto, userId: string): Promise<StreamerApplication>;
    listApplications(params: ListApplicationsParams): Promise<{
        items: StreamerApplication[];
        total: number;
        page: number;
        limit: number;
    }>;
    getApplicationsForAdmin(params: AdminListApplicationsParams, adminId: string): Promise<{
        items: StreamerApplication[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUserApplication(userId: string): Promise<StreamerApplication | null>;
    reviewApplication(id: string, action: 'approve' | 'reject', notes: string | undefined, adminId: string): Promise<StreamerApplication & {
        roleChangeInfo?: {
            previousRole: string;
            newRole: string;
            updated: boolean;
        };
    }>;
}
