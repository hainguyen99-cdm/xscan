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
exports.ScansController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const scans_service_1 = require("./scans.service");
const create_scan_dto_1 = require("./dto/create-scan.dto");
const update_scan_dto_1 = require("./dto/update-scan.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const ownership_guard_1 = require("../common/guards/ownership.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const ownership_decorator_1 = require("../common/decorators/ownership.decorator");
const roles_enum_1 = require("../common/enums/roles.enum");
let ScansController = class ScansController {
    constructor(scansService) {
        this.scansService = scansService;
    }
    create(createScanDto, req) {
        createScanDto.userId = req.user.sub;
        return this.scansService.create(createScanDto);
    }
    findAll() {
        return this.scansService.findAll();
    }
    getMyScans(req) {
        return this.scansService.findByUser(req.user.sub);
    }
    getPublicScans() {
        return this.scansService.findPublicScans();
    }
    findByUser(userId) {
        return this.scansService.findByUser(userId);
    }
    findOne(id) {
        return this.scansService.findOne(id);
    }
    update(id, updateScanDto) {
        return this.scansService.update(id, updateScanDto);
    }
    remove(id) {
        return this.scansService.remove(id);
    }
    startScan(id) {
        return this.scansService.startScan(id);
    }
    completeScan(id, body) {
        return this.scansService.completeScan(id, body.results);
    }
    failScan(id, body) {
        return this.scansService.failScan(id, body.errorMessage);
    }
};
exports.ScansController = ScansController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN, roles_enum_1.UserRole.STREAMER),
    (0, permissions_decorator_1.RequirePermissions)('scans.create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new scan (Admin and Streamer only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Scan created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin or Streamer role required',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_scan_dto_1.CreateScanDto, Object]),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, permissions_decorator_1.RequirePermissions)('scans.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all scans (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scans retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-scans'),
    (0, permissions_decorator_1.RequirePermissions)('scans.read.own'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user scans' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User scans retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "getMyScans", null);
__decorate([
    (0, common_1.Get)('public'),
    (0, permissions_decorator_1.RequirePermissions)('scans.read.public'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get public scans (visible to all authenticated users)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Public scans retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "getPublicScans", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, common_1.UseGuards)(ownership_guard_1.OwnershipGuard),
    (0, ownership_decorator_1.RequireOwnership)(),
    (0, permissions_decorator_1.RequirePermissions)('scans.read.own'),
    (0, swagger_1.ApiOperation)({ summary: 'Get scans by user ID (own scans or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User scans retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Can only access own scans',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('scans.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get scan by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Scan ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scan retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Scan not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(ownership_guard_1.OwnershipGuard),
    (0, ownership_decorator_1.RequireOwnership)(),
    (0, permissions_decorator_1.RequirePermissions)('scans.update.own'),
    (0, swagger_1.ApiOperation)({ summary: 'Update scan by ID (own scans or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Scan ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scan updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Can only update own scans',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Scan not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_scan_dto_1.UpdateScanDto]),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(ownership_guard_1.OwnershipGuard),
    (0, ownership_decorator_1.RequireOwnership)(),
    (0, permissions_decorator_1.RequirePermissions)('scans.delete.own'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete scan by ID (own scans or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Scan ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scan deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Can only delete own scans',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Scan not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, common_1.UseGuards)(ownership_guard_1.OwnershipGuard),
    (0, ownership_decorator_1.RequireOwnership)(),
    (0, permissions_decorator_1.RequirePermissions)('scans.start.own'),
    (0, swagger_1.ApiOperation)({ summary: 'Start a scan (own scans or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Scan ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scan started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Can only start own scans',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Scan not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "startScan", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, common_1.UseGuards)(ownership_guard_1.OwnershipGuard),
    (0, ownership_decorator_1.RequireOwnership)(),
    (0, permissions_decorator_1.RequirePermissions)('scans.complete.own'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete a scan (own scans or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Scan ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scan completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Can only complete own scans',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Scan not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "completeScan", null);
__decorate([
    (0, common_1.Post)(':id/fail'),
    (0, common_1.UseGuards)(ownership_guard_1.OwnershipGuard),
    (0, ownership_decorator_1.RequireOwnership)(),
    (0, permissions_decorator_1.RequirePermissions)('scans.fail.own'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a scan as failed (own scans or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Scan ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Scan marked as failed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Can only fail own scans',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Scan not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "failScan", null);
exports.ScansController = ScansController = __decorate([
    (0, swagger_1.ApiTags)('Scans'),
    (0, common_1.Controller)('scans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [scans_service_1.ScansService])
], ScansController);
//# sourceMappingURL=scans.controller.js.map