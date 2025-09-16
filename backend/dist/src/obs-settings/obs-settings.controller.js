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
const platform_express_1 = require("@nestjs/platform-express");
const obs_settings_service_1 = require("./obs-settings.service");
const obs_widget_gateway_1 = require("./obs-widget.gateway");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_enum_1 = require("../common/enums/roles.enum");
const media_upload_service_1 = require("../common/services/media-upload.service");
const configuration_dto_1 = require("./dto/configuration.dto");
const configuration_dto_2 = require("./dto/configuration.dto");
const security_dto_1 = require("./dto/security.dto");
const crypto_1 = require("crypto");
let OBSSettingsController = class OBSSettingsController {
    constructor(obsSettingsService, mediaUploadService, obsWidgetGateway) {
        this.obsSettingsService = obsSettingsService;
        this.mediaUploadService = mediaUploadService;
        this.obsWidgetGateway = obsWidgetGateway;
    }
    async create(createOBSSettingsDto, req) {
        if (req.user.role !== roles_enum_1.UserRole.ADMIN && req.user.sub !== createOBSSettingsDto.streamerId) {
            createOBSSettingsDto.streamerId = req.user.sub;
        }
        const settings = await this.obsSettingsService.create(createOBSSettingsDto);
        return settings.toObject();
    }
    async getMySettings(req) {
        const settings = await this.obsSettingsService.findByStreamerId(req.user.sub);
        const settingsObj = settings.toObject();
        const widgetUrlData = await this.obsSettingsService.getWidgetUrl(req.user.sub);
        settingsObj.widgetUrl = widgetUrlData.widgetUrl;
        return settingsObj;
    }
    async getByStreamerId(streamerId) {
        const settings = await this.obsSettingsService.findByStreamerId(streamerId);
        const settingsObj = settings.toObject();
        const widgetUrlData = await this.obsSettingsService.getWidgetUrl(streamerId);
        settingsObj.widgetUrl = widgetUrlData.widgetUrl;
        return settingsObj;
    }
    async getByAlertToken(alertToken) {
        const settings = await this.obsSettingsService.findByAlertToken(alertToken);
        return settings.toObject();
    }
    async getWidgetUrl(streamerId, req) {
        if (req.user.role !== roles_enum_1.UserRole.ADMIN && req.user.sub !== streamerId) {
            throw new common_1.BadRequestException('You can only access your own widget URL');
        }
        return this.obsSettingsService.getWidgetUrl(streamerId);
    }
    async getWidgetStatus(streamerId, req) {
        if (req.user.role !== roles_enum_1.UserRole.ADMIN && req.user.sub !== streamerId) {
            throw new common_1.BadRequestException('You can only access your own widget status');
        }
        return this.obsSettingsService.getWidgetStatus(streamerId);
    }
    async getFullWidgetUrl(streamerId, req) {
        if (req.user.role !== roles_enum_1.UserRole.ADMIN && req.user.sub !== streamerId) {
            throw new common_1.BadRequestException('You can only access your own full widget URL');
        }
        return this.obsSettingsService.getFullWidgetUrl(streamerId);
    }
    async verifyAlertToken(streamerId, alertToken) {
        try {
            const settings = await this.obsSettingsService.findByAlertToken(alertToken);
            if (settings.streamerId.toString() !== streamerId) {
                return {
                    isValid: false,
                    streamerId,
                    alertToken,
                    widgetUrl: '',
                    message: 'Alert token does not match the provided streamer ID'
                };
            }
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const widgetUrl = `${baseUrl}/widget/alert/${streamerId}/${alertToken}`;
            return {
                isValid: true,
                streamerId,
                alertToken,
                widgetUrl,
                message: 'Alert token verified successfully'
            };
        }
        catch (error) {
            return {
                isValid: false,
                streamerId,
                alertToken,
                widgetUrl: '',
                message: 'Alert token not found or invalid'
            };
        }
    }
    async renderAlertToken(streamerId) {
        try {
            const settings = await this.obsSettingsService.findByStreamerId(streamerId);
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const widgetUrl = `${baseUrl}/widget/alert/${streamerId}/${settings.alertToken}`;
            return {
                streamerId,
                alertToken: settings.alertToken,
                widgetUrl,
                message: 'Alert token rendered successfully for Widget URL'
            };
        }
        catch (error) {
            throw new common_1.NotFoundException('Streamer not found or no OBS settings configured');
        }
    }
    async getMyWidgetUrl(req) {
        return this.obsSettingsService.getWidgetUrl(req.user.sub);
    }
    async getMyWidgetStatus(req) {
        return this.obsSettingsService.getWidgetStatus(req.user.sub);
    }
    async regenerateMyWidgetUrl(req) {
        await this.obsSettingsService.regenerateAlertToken(req.user.sub);
        return this.obsSettingsService.getWidgetUrl(req.user.sub);
    }
    async testMyWidgetConnection(req) {
        const connectedWidgets = this.obsWidgetGateway.getStreamerClientCount(req.user.sub);
        const isConnected = connectedWidgets > 0;
        let testAlertSent = false;
        if (isConnected) {
            try {
                await this.obsSettingsService.triggerTestAlert(req.user.sub, {
                    donorName: 'Connection Test',
                    amount: '0.00',
                    message: 'Testing widget connection...',
                    useCurrentSettings: true
                });
                testAlertSent = true;
            }
            catch (error) {
                console.error('Failed to send test alert:', error);
            }
        }
        return {
            success: isConnected,
            message: isConnected
                ? 'Widget is connected and ready to receive alerts'
                : 'No widgets are currently connected. Please check your OBS setup.',
            connectedWidgets,
            testAlertSent
        };
    }
    async regenerateWidgetUrl(streamerId, req) {
        if (req.user.role !== roles_enum_1.UserRole.ADMIN && req.user.sub !== streamerId) {
            throw new common_1.BadRequestException('You can only regenerate your own widget URL');
        }
        const settings = await this.obsSettingsService.regenerateAlertToken(streamerId);
        return this.obsSettingsService.getWidgetUrl(streamerId);
    }
    async testWidgetConnection(streamerId, req) {
        if (req.user.role !== roles_enum_1.UserRole.ADMIN && req.user.sub !== streamerId) {
            throw new common_1.BadRequestException('You can only test your own widget connection');
        }
        const connectedWidgets = this.obsWidgetGateway.getStreamerClientCount(streamerId);
        const isConnected = connectedWidgets > 0;
        let testAlertSent = false;
        if (isConnected) {
            try {
                await this.obsSettingsService.triggerTestAlert(streamerId, {
                    donorName: 'Connection Test',
                    amount: '0.00',
                    message: 'Testing widget connection...',
                    useCurrentSettings: true
                });
                testAlertSent = true;
            }
            catch (error) {
                console.error('Failed to send test alert:', error);
            }
        }
        return {
            success: isConnected,
            message: isConnected
                ? 'Widget is connected and ready to receive alerts'
                : 'No widgets are currently connected. Please check your OBS setup.',
            connectedWidgets,
            testAlertSent
        };
    }
    async updateMySettings(updateOBSSettingsDto, req) {
        const settings = await this.obsSettingsService.update(req.user.sub, updateOBSSettingsDto);
        return settings.toObject();
    }
    async updateByStreamerId(streamerId, updateOBSSettingsDto) {
        const settings = await this.obsSettingsService.update(streamerId, updateOBSSettingsDto);
        return settings.toObject();
    }
    async deleteMySettings(req) {
        await this.obsSettingsService.delete(req.user.sub);
    }
    async deleteByStreamerId(streamerId) {
        await this.obsSettingsService.delete(streamerId);
    }
    async toggleMySettingsActive(req) {
        const settings = await this.obsSettingsService.toggleActive(req.user.sub);
        return settings.toObject();
    }
    async toggleActiveByStreamerId(streamerId) {
        const settings = await this.obsSettingsService.toggleActive(streamerId);
        return settings.toObject();
    }
    async regenerateMyAlertToken(req) {
        const settings = await this.obsSettingsService.regenerateAlertToken(req.user.sub);
        return settings.toObject();
    }
    async regenerateAlertTokenByStreamerId(streamerId) {
        const settings = await this.obsSettingsService.regenerateAlertToken(streamerId);
        return settings.toObject();
    }
    async findAll() {
        const settings = await this.obsSettingsService.findAll();
        return settings.map(setting => setting.toObject());
    }
    async getStats() {
        return this.obsSettingsService.getStats();
    }
    async uploadMediaForMySettings(req, file, mediaType, settingsType) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!mediaType || !settingsType) {
            throw new common_1.BadRequestException('Media type and settings type are required');
        }
        if (!['image', 'sound'].includes(settingsType)) {
            throw new common_1.BadRequestException('Settings type must be either "image" or "sound"');
        }
        const mediaFile = {
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            buffer: file.buffer,
            size: file.size,
        };
        try {
            const uploadedMedia = await this.mediaUploadService.uploadMedia(mediaFile, req.user.sub);
            const updateData = {};
            if (settingsType === 'image') {
                updateData.imageSettings = {
                    url: uploadedMedia.url,
                    mediaType: uploadedMedia.type === 'gif' ? 'gif' : uploadedMedia.type === 'video' ? 'video' : 'image',
                    width: uploadedMedia.dimensions?.width || 300,
                    height: uploadedMedia.dimensions?.height || 200,
                };
            }
            else if (settingsType === 'sound') {
                updateData.soundSettings = {
                    url: uploadedMedia.url,
                };
            }
            const updatedSettings = await this.obsSettingsService.update(req.user.sub, updateData);
            return updatedSettings.toObject();
        }
        catch (error) {
            throw new common_1.BadRequestException(`Media upload failed: ${error.message}`);
        }
    }
    async uploadMediaForStreamer(streamerId, file, mediaType, settingsType) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!mediaType || !settingsType) {
            throw new common_1.BadRequestException('Media type and settings type are required');
        }
        if (!['image', 'sound'].includes(settingsType)) {
            throw new common_1.BadRequestException('Settings type must be either "image" or "sound"');
        }
        const mediaFile = {
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            buffer: file.buffer,
            size: file.size,
        };
        try {
            const uploadedMedia = await this.mediaUploadService.uploadMedia(mediaFile, streamerId);
            const updateData = {};
            if (settingsType === 'image') {
                updateData.imageSettings = {
                    url: uploadedMedia.url,
                    mediaType: uploadedMedia.type === 'gif' ? 'gif' : uploadedMedia.type === 'video' ? 'video' : 'image',
                    width: uploadedMedia.dimensions?.width || 300,
                    height: uploadedMedia.dimensions?.height || 200,
                };
            }
            else if (settingsType === 'sound') {
                updateData.soundSettings = {
                    url: uploadedMedia.url,
                };
            }
            const updatedSettings = await this.obsSettingsService.update(streamerId, updateData);
            return updatedSettings.toObject();
        }
        catch (error) {
            throw new common_1.BadRequestException(`Media upload failed: ${error.message}`);
        }
    }
    async removeMediaFromMySettings(req, settingsType) {
        if (!settingsType) {
            throw new common_1.BadRequestException('Settings type is required');
        }
        if (!['image', 'sound'].includes(settingsType)) {
            throw new common_1.BadRequestException('Settings type must be either "image" or "sound"');
        }
        const updateData = {};
        if (settingsType === 'image') {
            updateData.imageSettings = { url: null };
        }
        else if (settingsType === 'sound') {
            updateData.soundSettings = { url: null };
        }
        const updatedSettings = await this.obsSettingsService.update(req.user.sub, updateData);
        return updatedSettings.toObject();
    }
    async removeMediaFromStreamer(streamerId, settingsType) {
        if (!settingsType) {
            throw new common_1.BadRequestException('Settings type is required');
        }
        if (!['image', 'sound'].includes(settingsType)) {
            throw new common_1.BadRequestException('Settings type must be either "image" or "sound"');
        }
        const updateData = {};
        if (settingsType === 'image') {
            updateData.imageSettings = { url: null };
        }
        else if (settingsType === 'sound') {
            updateData.soundSettings = { url: null };
        }
        const updatedSettings = await this.obsSettingsService.update(streamerId, updateData);
        return updatedSettings.toObject();
    }
    async savePreset(req, savePresetDto) {
        const result = await this.obsSettingsService.savePreset(req.user.sub, savePresetDto.presetName, savePresetDto.description);
        return result;
    }
    async getPresets(req) {
        const presets = await this.obsSettingsService.getPresets(req.user.sub);
        return presets;
    }
    async loadPreset(req, presetId) {
        const settings = await this.obsSettingsService.loadPreset(req.user.sub, presetId);
        return settings.toObject();
    }
    async deletePreset(req, presetId) {
        await this.obsSettingsService.deletePreset(req.user.sub, presetId);
    }
    async validateConfiguration(req, configuration) {
        const validation = await this.obsSettingsService.validateConfiguration(configuration);
        return validation;
    }
    async exportConfiguration(req) {
        const exportData = await this.obsSettingsService.exportConfiguration(req.user.sub);
        return exportData;
    }
    async importConfiguration(req, importConfigurationDto) {
        const settings = await this.obsSettingsService.importConfiguration(req.user.sub, importConfigurationDto.importData, importConfigurationDto.overwrite);
        return settings.toObject();
    }
    async testConfiguration(req, configuration) {
        const testResults = await this.obsSettingsService.testConfiguration(configuration);
        return testResults;
    }
    async resetToDefaults(req) {
        const settings = await this.obsSettingsService.resetToDefaults(req.user.sub);
        return settings.toObject();
    }
    async resetSection(req, resetSectionDto) {
        const settings = await this.obsSettingsService.resetSection(req.user.sub, resetSectionDto.section);
        return settings.toObject();
    }
    async getTemplates() {
        const templates = await this.obsSettingsService.getTemplates();
        return templates;
    }
    async applyTemplate(req, templateId) {
        const settings = await this.obsSettingsService.applyTemplate(req.user.sub, templateId);
        return settings.toObject();
    }
    async triggerTestAlert(req, testAlertDto) {
        const result = await this.obsSettingsService.triggerTestAlert(req.user.sub, testAlertDto);
        return result;
    }
    async getTestAlertHistory(req, limit) {
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        const history = await this.obsSettingsService.getTestAlertHistory(req.user.sub, limitNumber);
        return history;
    }
    async triggerTestAlertForStreamer(streamerId, testAlertDto) {
        const result = await this.obsSettingsService.triggerTestAlert(streamerId, testAlertDto);
        return result;
    }
    async triggerWidgetAlert(alertToken, testAlertDto) {
        const result = await this.obsSettingsService.triggerWidgetAlert(alertToken, testAlertDto);
        return result;
    }
    async triggerDonationAlert(alertToken, donationAlertDto, req) {
        console.log(`Processing donation alert request for token: ${alertToken.substring(0, 8)}...`);
        const clientIp = this.getClientIp(req);
        const userAgent = req.headers['user-agent'];
        console.log(`Client IP: ${clientIp}, User Agent: ${userAgent?.substring(0, 50)}...`);
        const rateLimitKey = `donation_alert:${clientIp}:${alertToken}`;
        const recentRequests = await this.checkRateLimit(rateLimitKey);
        if (recentRequests >= 10) {
            throw new common_1.BadRequestException('Rate limit exceeded. Please wait before making another request.');
        }
        const settings = await this.obsSettingsService.findByAlertTokenWithSecurity(alertToken, clientIp, userAgent);
        const streamerId = settings.streamerId.toString();
        console.log(`Found OBS settings for streamer: ${streamerId}`);
        if (!donationAlertDto.donorName || !donationAlertDto.amount || !donationAlertDto.currency) {
            throw new common_1.BadRequestException('Missing required donation fields: donorName, amount, and currency are required');
        }
        const alertData = {
            donorName: donationAlertDto.isAnonymous ? 'Anonymous' : donationAlertDto.donorName,
            amount: donationAlertDto.amount,
            currency: donationAlertDto.currency,
            message: donationAlertDto.message || 'Thank you for your donation!',
            donationId: donationAlertDto.donationId,
            paymentMethod: donationAlertDto.paymentMethod,
            isAnonymous: donationAlertDto.isAnonymous || false,
            timestamp: new Date(),
        };
        console.log(`Prepared alert data:`, {
            donorName: alertData.donorName,
            amount: alertData.amount,
            currency: alertData.currency,
            donationId: alertData.donationId,
            paymentMethod: alertData.paymentMethod,
        });
        const alertId = `donation_alert_${Date.now()}_${(0, crypto_1.randomBytes)(8).toString('hex')}`;
        const { widgetUrl } = await this.obsSettingsService.getWidgetUrl(streamerId);
        this.obsWidgetGateway.sendDonationAlert(streamerId, alertData.donorName, parseFloat(alertData.amount), alertData.currency, alertData.message);
        console.log(`Sent donation alert via WebSocket to streamer: ${streamerId}`);
        const connectedWidgets = this.obsWidgetGateway.getStreamerClientCount(streamerId);
        console.log(`Connected OBS widgets for streamer ${streamerId}: ${connectedWidgets}`);
        console.log('Donation alert triggered:', {
            streamerId,
            alertId,
            alertData,
            widgetUrl,
            connectedWidgets,
            clientIp,
            userAgent,
            settings: {
                imageSettings: settings.imageSettings,
                soundSettings: settings.soundSettings,
                animationSettings: settings.animationSettings,
                styleSettings: settings.styleSettings,
                positionSettings: settings.positionSettings,
                displaySettings: settings.displaySettings,
                generalSettings: settings.generalSettings,
            },
        });
        return {
            success: true,
            alertId,
            streamerId,
            alertData,
            widgetUrl,
            message: 'Donation alert triggered successfully',
            connectedWidgets: connectedWidgets,
        };
    }
    async sendTestAlertPublic(alertToken, testData) {
        try {
            const result = await this.obsSettingsService.triggerWidgetAlert(alertToken, {
                donorName: testData.donorName,
                amount: testData.amount,
                message: testData.message,
                useCurrentSettings: testData.useCurrentSettings ?? true
            });
            return {
                success: true,
                message: 'Test alert sent successfully',
                streamerId: result.streamerId,
                alertId: result.alertId,
                useCurrentSettings: testData.useCurrentSettings ?? true
            };
        }
        catch (error) {
            throw new common_1.NotFoundException('OBS settings not found for this alert token');
        }
    }
    getClientIp(req) {
        return req.ip || req.connection?.remoteAddress || '127.0.0.1';
    }
    async checkRateLimit(key) {
        return 0;
    }
    async revokeAlertToken(revokeTokenDto, req) {
        const streamerId = req.user.role === roles_enum_1.UserRole.ADMIN ? req.body.streamerId : req.user.sub;
        await this.obsSettingsService.revokeAlertToken(streamerId, revokeTokenDto.reason);
        return { message: 'Alert token revoked successfully' };
    }
    async regenerateAlertTokenWithSecurity(req) {
        const streamerId = req.user.role === roles_enum_1.UserRole.ADMIN ? req.body.streamerId : req.user.sub;
        const settings = await this.obsSettingsService.regenerateAlertToken(streamerId);
        return settings.toObject();
    }
    async updateSecuritySettings(updateSecuritySettingsDto, req) {
        const streamerId = req.user.role === roles_enum_1.UserRole.ADMIN ? req.body.streamerId : req.user.sub;
        const settings = await this.obsSettingsService.updateSecuritySettings(streamerId, updateSecuritySettingsDto.securitySettings);
        return settings.toObject();
    }
    async getSecurityStatus(req) {
        const streamerId = req.user.role === roles_enum_1.UserRole.ADMIN ? req.query.streamerId : req.user.sub;
        return this.obsSettingsService.getSecurityStatus(streamerId);
    }
    async getSecurityAuditLog(req, limit = '50') {
        const streamerId = req.user.role === roles_enum_1.UserRole.ADMIN ? req.query.streamerId : req.user.sub;
        const limitNum = parseInt(limit, 10);
        const violations = await this.obsSettingsService.getSecurityAuditLog(streamerId, limitNum);
        const settings = await this.obsSettingsService.findByStreamerId(streamerId);
        return {
            streamerId,
            violations: violations.map(v => ({
                ...v,
                timestamp: v.timestamp.toISOString(),
            })),
            totalViolations: violations.length,
            lastSecurityAudit: settings.securitySettings?.lastSecurityAudit?.toISOString() || settings.updatedAt.toISOString(),
        };
    }
    async validateAlertToken(body) {
        const { alertToken, clientIp, userAgent, signatureData } = body;
        if (!alertToken) {
            throw new common_1.BadRequestException('Alert token is required');
        }
        const validationResult = await this.obsSettingsService.findByAlertTokenWithSecurity(alertToken, clientIp, userAgent, signatureData);
        return {
            isValid: true,
            streamerId: validationResult.streamerId.toString(),
        };
    }
    async createRequestSignature(body, req) {
        const streamerId = req.user.role === roles_enum_1.UserRole.ADMIN ? req.body.streamerId : req.user.sub;
        const settings = await this.obsSettingsService.findByStreamerId(streamerId);
        if (!settings.securitySettings?.requestSignatureSecret) {
            throw new common_1.BadRequestException('Request signing is not enabled for this account');
        }
        const signature = this.obsSettingsService.createRequestSignature(body.timestamp, body.nonce, settings.securitySettings.requestSignatureSecret);
        return { signature };
    }
};
exports.OBSSettingsController = OBSSettingsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create OBS settings for a streamer' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'OBS settings created successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'OBS settings already exist for this streamer' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateOBSSettingsDto, Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-settings'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user\'s OBS settings' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OBS settings retrieved successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getMySettings", null);
__decorate([
    (0, common_1.Get)('streamer/:streamerId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get OBS settings by streamer ID (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OBS settings retrieved successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getByStreamerId", null);
__decorate([
    (0, common_1.Get)('token/:alertToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Get OBS settings by alert token (Public endpoint for OBS widget)' }),
    (0, swagger_1.ApiParam)({ name: 'alertToken', description: 'Alert token for OBS widget' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OBS settings retrieved successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('alertToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getByAlertToken", null);
__decorate([
    (0, common_1.Get)('widget-url/:streamerId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get widget URL for OBS setup' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Widget URL retrieved successfully',
        type: dto_1.WidgetUrlResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getWidgetUrl", null);
__decorate([
    (0, common_1.Get)('widget-status/:streamerId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get OBS widget connection status' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Widget status retrieved successfully',
        type: dto_1.WidgetConnectionStatusDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getWidgetStatus", null);
__decorate([
    (0, common_1.Get)('widget-url/:streamerId/full'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get full widget URL with alert token for verification' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Full widget URL retrieved successfully',
        type: dto_1.FullWidgetUrlResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getFullWidgetUrl", null);
__decorate([
    (0, common_1.Get)('verify/:streamerId/:alertToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify alert token for Widget URL format (Public endpoint)' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiParam)({ name: 'alertToken', description: 'Alert token for verification' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Alert token verified successfully',
        type: dto_1.TokenVerificationResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Alert token not found or invalid' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Param)('alertToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "verifyAlertToken", null);
__decorate([
    (0, common_1.Get)('render-token/:streamerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Render alert token for Widget URL format (Public endpoint)' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Alert token rendered successfully',
        type: dto_1.TokenRenderResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Streamer not found or no OBS settings' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "renderAlertToken", null);
__decorate([
    (0, common_1.Get)('my-widget-url'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user\'s widget URL for OBS setup' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Widget URL retrieved successfully',
        type: dto_1.WidgetUrlResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getMyWidgetUrl", null);
__decorate([
    (0, common_1.Get)('my-widget-status'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user\'s OBS widget connection status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Widget status retrieved successfully',
        type: dto_1.WidgetConnectionStatusDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getMyWidgetStatus", null);
__decorate([
    (0, common_1.Post)('my-widget-url/regenerate'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Regenerate current user\'s widget URL and alert token for security' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Widget URL regenerated successfully',
        type: dto_1.WidgetUrlResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "regenerateMyWidgetUrl", null);
__decorate([
    (0, common_1.Post)('my-widget-url/test-connection'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Test current user\'s OBS widget connection by sending a test alert' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Connection test completed',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                connectedWidgets: { type: 'number' },
                testAlertSent: { type: 'boolean' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "testMyWidgetConnection", null);
__decorate([
    (0, common_1.Post)('widget-url/:streamerId/regenerate'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Regenerate widget URL and alert token for security' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Widget URL regenerated successfully',
        type: dto_1.WidgetUrlResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "regenerateWidgetUrl", null);
__decorate([
    (0, common_1.Post)('widget-url/:streamerId/test-connection'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Test OBS widget connection by sending a test alert' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Connection test completed',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                connectedWidgets: { type: 'number' },
                testAlertSent: { type: 'boolean' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "testWidgetConnection", null);
__decorate([
    (0, common_1.Patch)('my-settings'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update current user\'s OBS settings' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OBS settings updated successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpdateOBSSettingsDto, Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "updateMySettings", null);
__decorate([
    (0, common_1.Patch)(':streamerId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update OBS settings by streamer ID (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OBS settings updated successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateOBSSettingsDto]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "updateByStreamerId", null);
__decorate([
    (0, common_1.Delete)('my-settings'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete current user\'s OBS settings' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'OBS settings deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "deleteMySettings", null);
__decorate([
    (0, common_1.Delete)(':streamerId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete OBS settings by streamer ID (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'OBS settings deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "deleteByStreamerId", null);
__decorate([
    (0, common_1.Post)('my-settings/toggle-active'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle current user\'s OBS settings active status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OBS settings active status toggled successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "toggleMySettingsActive", null);
__decorate([
    (0, common_1.Post)(':streamerId/toggle-active'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle OBS settings active status by streamer ID (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OBS settings active status toggled successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "toggleActiveByStreamerId", null);
__decorate([
    (0, common_1.Post)('my-settings/regenerate-token'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Regenerate alert token for current user\'s OBS settings' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Alert token regenerated successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "regenerateMyAlertToken", null);
__decorate([
    (0, common_1.Post)(':streamerId/regenerate-token'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Regenerate alert token for OBS settings by streamer ID (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Alert token regenerated successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "regenerateAlertTokenByStreamerId", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all OBS settings (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'All OBS settings retrieved successfully',
        type: [dto_1.OBSSettingsResponseDto],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get OBS settings statistics (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                totalSettings: { type: 'number' },
                activeSettings: { type: 'number' },
                totalAlerts: { type: 'number' },
                averageAlertsPerSetting: { type: 'number' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('my-settings/upload-media'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Upload media for current user\'s OBS settings' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Media file to upload (image, gif, video, or audio)',
                },
                mediaType: {
                    type: 'string',
                    enum: ['image', 'gif', 'video', 'audio'],
                    description: 'Type of media being uploaded',
                },
                settingsType: {
                    type: 'string',
                    enum: ['image', 'sound'],
                    description: 'Which settings to update (image or sound)',
                },
            },
            required: ['file', 'mediaType', 'settingsType'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Media uploaded and OBS settings updated successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file or validation error' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('mediaType')),
    __param(3, (0, common_1.Body)('settingsType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "uploadMediaForMySettings", null);
__decorate([
    (0, common_1.Post)(':streamerId/upload-media'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Upload media for OBS settings by streamer ID (Admin only)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Media file to upload (image, gif, video, or audio)',
                },
                mediaType: {
                    type: 'string',
                    enum: ['image', 'gif', 'video', 'audio'],
                    description: 'Type of media being uploaded',
                },
                settingsType: {
                    type: 'string',
                    enum: ['image', 'sound'],
                    description: 'Which settings to update (image or sound)',
                },
            },
            required: ['file', 'mediaType', 'settingsType'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Media uploaded and OBS settings updated successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file or validation error' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('mediaType')),
    __param(3, (0, common_1.Body)('settingsType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "uploadMediaForStreamer", null);
__decorate([
    (0, common_1.Delete)('my-settings/remove-media'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Remove media from current user\'s OBS settings' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                settingsType: {
                    type: 'string',
                    enum: ['image', 'sound'],
                    description: 'Which settings to clear (image or sound)',
                },
            },
            required: ['settingsType'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Media removed from OBS settings successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('settingsType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "removeMediaFromMySettings", null);
__decorate([
    (0, common_1.Delete)(':streamerId/remove-media'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Remove media from OBS settings by streamer ID (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                settingsType: {
                    type: 'string',
                    enum: ['image', 'sound'],
                    description: 'Which settings to clear (image or sound)',
                },
            },
            required: ['settingsType'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Media removed from OBS settings successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Body)('settingsType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "removeMediaFromStreamer", null);
__decorate([
    (0, common_1.Post)('my-settings/save-preset'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Save current OBS settings as a preset' }),
    (0, swagger_1.ApiBody)({ type: configuration_dto_2.SavePresetDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Preset saved successfully',
        schema: {
            type: 'object',
            properties: {
                presetId: { type: 'string' },
                presetName: { type: 'string' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, configuration_dto_2.SavePresetDto]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "savePreset", null);
__decorate([
    (0, common_1.Get)('my-settings/presets'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all saved presets for current user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Presets retrieved successfully',
        type: [configuration_dto_2.PresetDto],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getPresets", null);
__decorate([
    (0, common_1.Post)('my-settings/load-preset/:presetId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Load a saved preset for current user' }),
    (0, swagger_1.ApiParam)({ name: 'presetId', description: 'Preset ID to load' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Preset loaded successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Preset not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('presetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "loadPreset", null);
__decorate([
    (0, common_1.Delete)('my-settings/preset/:presetId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a saved preset for current user' }),
    (0, swagger_1.ApiParam)({ name: 'presetId', description: 'Preset ID to delete' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Preset deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Preset not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('presetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "deletePreset", null);
__decorate([
    (0, common_1.Post)('my-settings/validate'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Validate OBS settings configuration without saving' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateOBSSettingsDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Configuration validation completed',
        type: configuration_dto_2.ConfigurationValidationDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateOBSSettingsDto]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "validateConfiguration", null);
__decorate([
    (0, common_1.Get)('my-settings/export'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Export current OBS settings configuration' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Configuration exported successfully',
        type: configuration_dto_2.ExportConfigurationDto,
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "exportConfiguration", null);
__decorate([
    (0, common_1.Post)('my-settings/import'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Import OBS settings configuration' }),
    (0, swagger_1.ApiBody)({ type: configuration_dto_2.ImportConfigurationDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Configuration imported successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid import data' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, configuration_dto_2.ImportConfigurationDto]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "importConfiguration", null);
__decorate([
    (0, common_1.Post)('my-settings/test-configuration'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Test OBS settings configuration without saving' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateOBSSettingsDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Configuration test completed',
        type: configuration_dto_2.TestResultDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateOBSSettingsDto]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "testConfiguration", null);
__decorate([
    (0, common_1.Post)('my-settings/reset-to-defaults'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Reset OBS settings to default values' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Settings reset to defaults successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "resetToDefaults", null);
__decorate([
    (0, common_1.Post)('my-settings/reset-section'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Reset a specific section of OBS settings to defaults' }),
    (0, swagger_1.ApiBody)({ type: configuration_dto_2.ResetSectionDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Section reset to defaults successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, configuration_dto_2.ResetSectionDto]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "resetSection", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available OBS settings templates' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Templates retrieved successfully',
        type: [configuration_dto_2.TemplateDto],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Post)('my-settings/apply-template/:templateId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Apply a template to current user\'s OBS settings' }),
    (0, swagger_1.ApiParam)({ name: 'templateId', description: 'Template ID to apply' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Template applied successfully',
        type: dto_1.OBSSettingsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "applyTemplate", null);
__decorate([
    (0, common_1.Post)('my-settings/test-alert'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger a test alert using current OBS settings' }),
    (0, swagger_1.ApiBody)({ type: configuration_dto_1.TestAlertDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Test alert triggered successfully',
        type: configuration_dto_1.TestAlertResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, configuration_dto_1.TestAlertDto]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "triggerTestAlert", null);
__decorate([
    (0, common_1.Get)('my-settings/test-alert-history'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get test alert history for current user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Test alert history retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                streamerId: { type: 'string' },
                testAlerts: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            alertId: { type: 'string' },
                            donorName: { type: 'string' },
                            amount: { type: 'string' },
                            message: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                            success: { type: 'boolean' },
                        },
                    },
                },
                total: { type: 'number' },
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getTestAlertHistory", null);
__decorate([
    (0, common_1.Post)('streamer/:streamerId/test-alert'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger a test alert for a specific streamer (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiBody)({ type: configuration_dto_1.TestAlertDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Test alert triggered successfully',
        type: configuration_dto_1.TestAlertResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, configuration_dto_1.TestAlertDto]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "triggerTestAlertForStreamer", null);
__decorate([
    (0, common_1.Post)('widget/:alertToken/alert'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger an alert for OBS widget using alert token' }),
    (0, swagger_1.ApiParam)({ name: 'alertToken', description: 'Alert token for OBS widget' }),
    (0, swagger_1.ApiBody)({ type: configuration_dto_1.TestAlertDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Alert triggered successfully',
        type: configuration_dto_1.TestAlertResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('alertToken')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, configuration_dto_1.TestAlertDto]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "triggerWidgetAlert", null);
__decorate([
    (0, common_1.Post)('widget/:alertToken/donation-alert'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger donation alert for OBS widget' }),
    (0, swagger_1.ApiParam)({ name: 'alertToken', description: '64-character alert token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Donation alert triggered successfully', type: configuration_dto_1.DonationAlertResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Rate limit exceeded' }),
    __param(0, (0, common_1.Param)('alertToken')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, configuration_dto_1.DonationAlertDto, Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "triggerDonationAlert", null);
__decorate([
    (0, common_1.Post)('widget/:alertToken/test-alert-public'),
    (0, swagger_1.ApiOperation)({ summary: 'Send test alert to OBS widget (Public endpoint for testing)' }),
    (0, swagger_1.ApiParam)({ name: 'alertToken', description: 'Alert token for OBS widget' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                donorName: { type: 'string', example: 'Test User' },
                amount: { type: 'string', example: '$10.00' },
                message: { type: 'string', example: 'This is a test alert!' },
                useCurrentSettings: { type: 'boolean', example: true, description: 'Whether to use saved OBS settings' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test alert sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('alertToken')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "sendTestAlertPublic", null);
__decorate([
    (0, common_1.Post)('security/revoke-token'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke alert token for security' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token revoked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [security_dto_1.RevokeTokenDto, Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "revokeAlertToken", null);
__decorate([
    (0, common_1.Post)('security/regenerate-token'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Regenerate alert token with enhanced security' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token regenerated successfully', type: dto_1.OBSSettingsResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "regenerateAlertTokenWithSecurity", null);
__decorate([
    (0, common_1.Patch)('security/settings'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update security settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security settings updated successfully', type: dto_1.OBSSettingsResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [security_dto_1.UpdateSecuritySettingsDto, Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "updateSecuritySettings", null);
__decorate([
    (0, common_1.Get)('security/status'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get security status for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security status retrieved successfully', type: security_dto_1.SecurityStatusDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getSecurityStatus", null);
__decorate([
    (0, common_1.Get)('security/audit-log'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get security audit log' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security audit log retrieved successfully', type: security_dto_1.SecurityAuditResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "getSecurityAuditLog", null);
__decorate([
    (0, common_1.Post)('security/validate-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate alert token with security checks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token validation result' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "validateAlertToken", null);
__decorate([
    (0, common_1.Post)('security/create-signature'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create request signature for secure API calls' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Signature created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OBSSettingsController.prototype, "createRequestSignature", null);
exports.OBSSettingsController = OBSSettingsController = __decorate([
    (0, swagger_1.ApiTags)('OBS Settings'),
    (0, common_1.Controller)('obs-settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [obs_settings_service_1.OBSSettingsService,
        media_upload_service_1.MediaUploadService,
        obs_widget_gateway_1.OBSWidgetGateway])
], OBSSettingsController);
//# sourceMappingURL=obs-settings.controller.js.map