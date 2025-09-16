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
exports.StreamerApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const streamer_applications_service_1 = require("./streamer-applications.service");
const create_streamer_application_dto_1 = require("./dto/create-streamer-application.dto");
let StreamerApplicationsController = class StreamerApplicationsController {
    constructor(applicationsService) {
        this.applicationsService = applicationsService;
    }
    async getMyApplication(req) {
        const userId = req.user?.id;
        return await this.applicationsService.getUserApplication(userId);
    }
    async apply(body, req) {
        const userId = req.user?.id;
        return await this.applicationsService.createApplication(body, userId);
    }
};
exports.StreamerApplicationsController = StreamerApplicationsController;
__decorate([
    (0, common_1.Get)('my-application'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user\'s streamer application' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreamerApplicationsController.prototype, "getMyApplication", null);
__decorate([
    (0, common_1.Post)('apply'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a streamer application' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_streamer_application_dto_1.CreateStreamerApplicationDto, Object]),
    __metadata("design:returntype", Promise)
], StreamerApplicationsController.prototype, "apply", null);
exports.StreamerApplicationsController = StreamerApplicationsController = __decorate([
    (0, swagger_1.ApiTags)('streamer-applications'),
    (0, common_1.Controller)('streamer-applications'),
    __metadata("design:paramtypes", [streamer_applications_service_1.StreamerApplicationsService])
], StreamerApplicationsController);
//# sourceMappingURL=streamer-applications.controller.js.map