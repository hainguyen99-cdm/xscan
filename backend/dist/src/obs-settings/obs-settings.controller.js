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
exports.OBSSettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_enum_1 = require("../common/enums/roles.enum");
const obs_settings_service_1 = require("./obs-settings.service");
const dto_1 = require("./dto");
let OBSSettingsController = class OBSSettingsController {
    constructor(obsSettingsService) {
        this.obsSettingsService = obsSettingsService;
    }
    async create(createOBSSettingsDto, req) {
        if (req.user?.role !== roles_enum_1.UserRole.ADMIN && req.user?.sub && req.user?.sub !== createOBSSettingsDto.streamerId) {
            createOBSSettingsDto.streamerId = req.user.sub;
        }
        const settings = await this.obsSettingsService.create(createOBSSettingsDto);
        return settings.toObject();
    }
    async getMySettings(req) {
        const settings = await this.obsSettingsService.findByStreamerId(req.user.sub);
        return settings.toObject();
    }
    async getDonationLevels(req) {
        const settings = await this.obsSettingsService.findByStreamerId(req.user.sub);
        return { donationLevels: (settings.donationLevels || []) };
    }
    async updateDonationLevel(levelId, body, req) {
        console.log('[OBS Settings] updateDonationLevel called', {
            streamerId: req?.user?.sub,
            levelId,
            hasCustomization: !!body?.customization,
            hasConfiguration: !!body?.configuration,
            hasPrimitives: !!(body?.levelName || body?.minAmount || body?.maxAmount || body?.currency || typeof body?.isEnabled === 'boolean')
        });
        await this.obsSettingsService.updateDonationLevel(req.user.sub, levelId, body);
        return { success: true, message: 'Donation level updated successfully' };
    }
};
exports.OBSSettingsController = OBSSettingsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'OBS settings created successfully', type: dto_1.OBSSettingsResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateOBSSettingsDto, Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-settings'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OBS settings retrieved successfully', type: dto_1.OBSSettingsResponseDto }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getMySettings", null);
__decorate([
    (0, common_1.Get)('donation-levels'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Donation levels retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getDonationLevels", null);
__decorate([
    (0, common_1.Put)('donation-levels/:levelId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Donation level updated successfully' }),
    __param(0, (0, common_1.Param)('levelId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "updateDonationLevel", null);
exports.OBSSettingsController = OBSSettingsController = __decorate([
    (0, swagger_1.ApiTags)('OBS Settings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('obs-settings'),
    __metadata("design:paramtypes", [obs_settings_service_1.OBSSettingsService])
], OBSSettingsController);
//# sourceMappingURL=obs-settings.controller.js.map