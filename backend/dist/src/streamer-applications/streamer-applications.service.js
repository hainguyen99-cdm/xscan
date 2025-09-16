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
exports.StreamerApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const streamer_application_schema_1 = require("./streamer-application.schema");
const users_service_1 = require("../users/users.service");
const notification_service_1 = require("../notifications/notification.service");
let StreamerApplicationsService = class StreamerApplicationsService {
    constructor(applicationModel, usersService, notificationService) {
        this.applicationModel = applicationModel;
        this.usersService = usersService;
        this.notificationService = notificationService;
    }
    async createApplication(input, userId) {
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
    async listApplications(params) {
        const { status, search, limit = 20, page = 1 } = params;
        const filter = {};
        if (status)
            filter.status = status;
        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.applicationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
            this.applicationModel.countDocuments(filter).exec(),
        ]);
        return { items, total, page, limit };
    }
    async getApplicationsForAdmin(params, adminId) {
        return this.listApplications(params);
    }
    async getUserApplication(userId) {
        let application = await this.applicationModel.findOne({ userId }).sort({ createdAt: -1 }).exec();
        if (!application) {
            application = await this.applicationModel.findOne({}).sort({ createdAt: -1 }).exec();
            if (application) {
                try {
                    await this.applicationModel.updateOne({ _id: application._id }, { $set: { userId: userId } });
                }
                catch (updateError) {
                    console.error('Failed to update application with userId:', updateError);
                }
            }
        }
        return application ? application.toObject() : null;
    }
    async reviewApplication(id, action, notes, adminId) {
        const application = await this.applicationModel.findById(id).exec();
        if (!application)
            throw new common_1.NotFoundException('Application not found');
        application.status = action === 'approve' ? 'approved' : 'rejected';
        application.reviewNotes = notes;
        application.reviewedByAdminId = adminId;
        application.reviewedAt = new Date();
        let roleChangeInfo;
        if (action === 'approve' && application.userId) {
            try {
                const user = await this.usersService.findById(application.userId);
                const previousRole = user.role;
                if (user.role === 'streamer') {
                    console.log(`User ${application.userId} is already a streamer, skipping role update`);
                    roleChangeInfo = {
                        previousRole,
                        newRole: 'streamer',
                        updated: false
                    };
                }
                else {
                    console.log(`Updating user ${application.userId} role from ${user.role} to streamer after application approval`);
                    await this.usersService.update(application.userId, { role: 'streamer' });
                    console.log(`Successfully updated user ${application.userId} role to streamer`);
                    roleChangeInfo = {
                        previousRole,
                        newRole: 'streamer',
                        updated: true
                    };
                }
                try {
                    await this.notificationService.createSystemNotification(application.userId, 'Streamer Application Approved! 🎉', `Congratulations! Your streamer application has been approved. You can now access your streamer dashboard and start receiving donations.`, {
                        applicationId: application._id,
                        status: 'approved',
                        reviewedAt: new Date(),
                        roleChange: roleChangeInfo
                    });
                }
                catch (notificationError) {
                    console.error('Failed to send approval notification:', notificationError);
                }
            }
            catch (error) {
                console.error(`Failed to update user ${application.userId} role to streamer:`, error);
            }
        }
        else if (action === 'reject' && application.userId) {
            try {
                await this.notificationService.createSystemNotification(application.userId, 'Streamer Application Update', `Your streamer application has been reviewed. Unfortunately, it was not approved at this time. ${notes ? `Reason: ${notes}` : ''}`, {
                    applicationId: application._id,
                    status: 'rejected',
                    reviewedAt: new Date(),
                    reviewNotes: notes
                });
            }
            catch (notificationError) {
                console.error('Failed to send rejection notification:', notificationError);
            }
        }
        await application.save();
        return { ...application.toObject(), roleChangeInfo };
    }
};
exports.StreamerApplicationsService = StreamerApplicationsService;
exports.StreamerApplicationsService = StreamerApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(streamer_application_schema_1.StreamerApplication.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        users_service_1.UsersService,
        notification_service_1.NotificationService])
], StreamerApplicationsService);
//# sourceMappingURL=streamer-applications.service.js.map