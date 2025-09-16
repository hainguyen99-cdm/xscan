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
exports.OBSSettingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const obs_settings_schema_1 = require("./obs-settings.schema");
const obs_widget_gateway_1 = require("./obs-widget.gateway");
const obs_security_service_1 = require("./obs-security.service");
const crypto_1 = require("crypto");
let OBSSettingsService = class OBSSettingsService {
    constructor(obsSettingsModel, obsWidgetGateway, obsSecurityService) {
        this.obsSettingsModel = obsSettingsModel;
        this.obsWidgetGateway = obsWidgetGateway;
        this.obsSecurityService = obsSecurityService;
    }
    generateAlertToken() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    generateWidgetUrl(streamerId, alertToken) {
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        return `${baseUrl}/api/widget-public/alert/${streamerId}/${alertToken}`;
    }
    generateWidgetUrlWithoutToken(streamerId) {
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        return `${baseUrl}/widget-public/alert/${streamerId}`;
    }
    generateLegacyWidgetUrl(alertToken) {
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        return `${baseUrl}/widget-public/alert/${alertToken}`;
    }
    async create(createOBSSettingsDto) {
        const existingSettings = await this.obsSettingsModel.findOne({
            streamerId: new mongoose_2.Types.ObjectId(createOBSSettingsDto.streamerId),
        });
        if (existingSettings) {
            throw new common_1.ConflictException('OBS settings already exist for this streamer');
        }
        const alertToken = this.generateAlertToken();
        const obsSettings = new this.obsSettingsModel({
            ...createOBSSettingsDto,
            streamerId: new mongoose_2.Types.ObjectId(createOBSSettingsDto.streamerId),
            alertToken,
            imageSettings: {
                enabled: true,
                mediaType: 'image',
                width: 300,
                height: 200,
                borderRadius: 8,
                shadow: true,
                shadowColor: '#000000',
                shadowBlur: 10,
                shadowOffsetX: 2,
                shadowOffsetY: 2,
                ...createOBSSettingsDto.imageSettings,
            },
            soundSettings: {
                enabled: true,
                volume: 80,
                fadeIn: 0,
                fadeOut: 0,
                loop: false,
                ...createOBSSettingsDto.soundSettings,
            },
            animationSettings: {
                enabled: true,
                animationType: 'fade',
                duration: 500,
                easing: 'ease-out',
                direction: 'right',
                bounceIntensity: 20,
                zoomScale: 1.2,
                ...createOBSSettingsDto.animationSettings,
            },
            styleSettings: {
                backgroundColor: '#1a1a1a',
                textColor: '#ffffff',
                accentColor: '#00ff00',
                borderColor: '#333333',
                borderWidth: 2,
                borderStyle: 'solid',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                fontSize: 16,
                fontWeight: 'normal',
                fontStyle: 'normal',
                textShadow: true,
                textShadowColor: '#000000',
                textShadowBlur: 3,
                textShadowOffsetX: 1,
                textShadowOffsetY: 1,
                ...createOBSSettingsDto.styleSettings,
            },
            positionSettings: {
                x: 100,
                y: 100,
                anchor: 'top-left',
                zIndex: 1000,
                responsive: true,
                mobileScale: 0.8,
                ...createOBSSettingsDto.positionSettings,
            },
            displaySettings: {
                duration: 5000,
                fadeInDuration: 300,
                fadeOutDuration: 300,
                autoHide: true,
                showProgress: false,
                progressColor: '#00ff00',
                progressHeight: 3,
                ...createOBSSettingsDto.displaySettings,
            },
            generalSettings: {
                enabled: true,
                maxAlerts: 3,
                alertSpacing: 20,
                cooldown: 1000,
                priority: 'medium',
                ...createOBSSettingsDto.generalSettings,
            },
            isActive: createOBSSettingsDto.isActive ?? false,
            totalAlerts: 0,
        });
        return obsSettings.save();
    }
    async findByStreamerId(streamerId) {
        const settings = await this.obsSettingsModel.findOne({
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
            isActive: true,
        });
        if (!settings) {
            throw new common_1.NotFoundException('OBS settings not found for this streamer');
        }
        return settings;
    }
    async findByAlertToken(alertToken) {
        const validationResult = await this.obsSecurityService.validateAlertToken(alertToken);
        if (!validationResult.isValid) {
            throw new common_1.NotFoundException(validationResult.error || 'OBS settings not found for this alert token');
        }
        return validationResult.settings;
    }
    async findByAlertTokenWithSecurity(alertToken, clientIp, userAgent, signatureData) {
        const validationResult = await this.obsSecurityService.validateAlertToken(alertToken, clientIp, userAgent, signatureData);
        if (!validationResult.isValid) {
            throw new common_1.NotFoundException(validationResult.error || 'OBS settings not found for this alert token');
        }
        return validationResult.settings;
    }
    async update(streamerId, updateOBSSettingsDto) {
        const settings = await this.obsSettingsModel.findOne({
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (!settings) {
            throw new common_1.NotFoundException('OBS settings not found for this streamer');
        }
        const mappedUpdateData = this.mapFrontendToBackendFormat(updateOBSSettingsDto, settings);
        Object.assign(settings, mappedUpdateData);
        settings.updatedAt = new Date();
        return settings.save();
    }
    mapFrontendToBackendFormat(updateData, currentSettings) {
        const mappedData = {};
        if (updateData.alertToken && updateData.alertToken.length >= 32) {
            mappedData.alertToken = updateData.alertToken;
        }
        else if (updateData.alertToken && updateData.alertToken.length < 32) {
            console.log(`⚠️ Skipping partial alert token update: ${updateData.alertToken.substring(0, 8)}... (length: ${updateData.alertToken.length})`);
        }
        if (updateData.customization) {
            const { customization } = updateData;
            if (customization.image) {
                const defaultImageSettings = {
                    enabled: true,
                    mediaType: 'image',
                    width: 300,
                    height: 200,
                    borderRadius: 8,
                    shadow: true,
                    shadowColor: '#000000',
                    shadowBlur: 10,
                    shadowOffsetX: 2,
                    shadowOffsetY: 2,
                };
                mappedData.imageSettings = {
                    ...defaultImageSettings,
                    ...(currentSettings.imageSettings || {}),
                    url: customization.image.url,
                    mediaType: customization.image.type,
                };
            }
            if (customization.sound) {
                const defaultSoundSettings = {
                    enabled: true,
                    volume: 80,
                    fadeIn: 0,
                    fadeOut: 0,
                    loop: false,
                };
                mappedData.soundSettings = {
                    ...defaultSoundSettings,
                    ...(currentSettings.soundSettings || {}),
                    url: customization.sound.url,
                    volume: customization.sound.volume,
                };
            }
            if (customization.text) {
                const defaultStyleSettings = {
                    backgroundColor: '#1a1a1a',
                    textColor: '#ffffff',
                    accentColor: '#00ff00',
                    borderColor: '#333333',
                    borderWidth: 2,
                    borderStyle: 'solid',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                    fontSize: 16,
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    textShadow: true,
                    textShadowColor: '#000000',
                    textShadowBlur: 3,
                    textShadowOffsetX: 1,
                    textShadowOffsetY: 1,
                };
                mappedData.styleSettings = {
                    ...defaultStyleSettings,
                    ...(currentSettings.styleSettings || {}),
                    fontFamily: customization.text.font,
                    fontSize: customization.text.fontSize,
                    textColor: customization.text.color,
                    backgroundColor: customization.text.backgroundColor,
                };
                if (customization.text.animation) {
                    const defaultAnimationSettings = {
                        enabled: true,
                        animationType: 'fade',
                        duration: 500,
                        easing: 'ease-out',
                        direction: 'right',
                        bounceIntensity: 20,
                        zoomScale: 1.2,
                    };
                    mappedData.animationSettings = {
                        ...defaultAnimationSettings,
                        ...(currentSettings.animationSettings || {}),
                        animationType: customization.text.animation === 'none' ? 'none' : 'fade',
                        duration: customization.text.animation === 'none' ? 0 : 500,
                    };
                }
            }
            if (customization.position) {
                const defaultPositionSettings = {
                    x: 100,
                    y: 100,
                    anchor: 'top-left',
                    zIndex: 1000,
                    responsive: true,
                    mobileScale: 0.8,
                };
                mappedData.positionSettings = {
                    ...defaultPositionSettings,
                    ...(currentSettings.positionSettings || {}),
                    anchor: customization.position,
                };
            }
            if (customization.duration) {
                console.log(`🔄 Processing duration: ${customization.duration} (type: ${typeof customization.duration})`);
                const defaultDisplaySettings = {
                    duration: 5000,
                    fadeInDuration: 300,
                    fadeOutDuration: 300,
                    autoHide: true,
                    showProgress: false,
                    progressColor: '#00ff00',
                    progressHeight: 3,
                };
                let durationMs = customization.duration;
                if (customization.duration < 1000) {
                    durationMs = customization.duration * 1000;
                    console.log(`🔄 Converting duration from ${customization.duration} to ${durationMs}ms`);
                }
                else {
                    console.log(`✅ Duration already in milliseconds: ${durationMs}ms`);
                }
                mappedData.displaySettings = {
                    ...defaultDisplaySettings,
                    ...(currentSettings.displaySettings || {}),
                    duration: durationMs,
                };
                console.log(`✅ Final duration set to: ${durationMs}ms`);
            }
        }
        console.log(`📝 Final mapped data:`, JSON.stringify(mappedData, null, 2));
        return mappedData;
    }
    async delete(streamerId) {
        const result = await this.obsSettingsModel.deleteOne({
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('OBS settings not found for this streamer');
        }
    }
    async toggleActive(streamerId) {
        const settings = await this.obsSettingsModel.findOne({
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (!settings) {
            throw new common_1.NotFoundException('OBS settings not found for this streamer');
        }
        settings.isActive = !settings.isActive;
        settings.updatedAt = new Date();
        return settings.save();
    }
    async regenerateAlertToken(streamerId) {
        const settings = await this.obsSettingsModel.findOne({
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (!settings) {
            throw new common_1.NotFoundException('OBS settings not found for this streamer');
        }
        const newToken = await this.obsSecurityService.regenerateAlertTokenWithSecurity(streamerId);
        return this.findByStreamerId(streamerId);
    }
    async revokeAlertToken(streamerId, reason) {
        await this.obsSecurityService.revokeAlertToken(streamerId, reason);
    }
    async updateSecuritySettings(streamerId, securitySettings) {
        await this.obsSecurityService.updateSecuritySettings(streamerId, securitySettings);
        return this.findByStreamerId(streamerId);
    }
    async getSecurityAuditLog(streamerId, limit = 50) {
        return this.obsSecurityService.getSecurityAuditLog(streamerId, limit);
    }
    async getSecurityStatus(streamerId) {
        const settings = await this.findByStreamerId(streamerId);
        const violations = await this.getSecurityAuditLog(streamerId);
        return {
            streamerId,
            isTokenActive: settings.isActive && !settings.securitySettings?.isTokenRevoked,
            isTokenRevoked: settings.securitySettings?.isTokenRevoked || false,
            revocationReason: settings.securitySettings?.revocationReason,
            revokedAt: settings.securitySettings?.revokedAt,
            tokenExpiresAt: settings.securitySettings?.tokenExpiresAt,
            requireIPValidation: settings.securitySettings?.requireIPValidation || false,
            requireRequestSigning: settings.securitySettings?.requireRequestSigning || false,
            maxConnections: settings.securitySettings?.maxConnections || 10,
            allowedIPs: settings.securitySettings?.allowedIPs || [],
            totalViolations: violations.length,
            lastSecurityAudit: settings.securitySettings?.lastSecurityAudit || settings.updatedAt,
        };
    }
    createRequestSignature(timestamp, nonce, secret) {
        return this.obsSecurityService.createRequestSignature(timestamp, nonce, secret);
    }
    async incrementAlertCount(alertToken) {
        await this.obsSettingsModel.updateOne({ alertToken }, {
            $inc: { totalAlerts: 1 },
            $set: { lastUsedAt: new Date() }
        });
    }
    async findAll() {
        return this.obsSettingsModel.find().sort({ createdAt: -1 });
    }
    async getStats() {
        const totalSettings = await this.obsSettingsModel.countDocuments();
        const activeSettings = await this.obsSettingsModel.countDocuments({ isActive: true });
        const averageAlertsPerSetting = totalSettings > 0 ? 0 : 0;
        return {
            totalSettings,
            activeSettings,
            totalAlerts: 0,
            averageAlertsPerSetting,
        };
    }
    async savePreset(streamerId, presetName, description) {
        const settings = await this.findByStreamerId(streamerId);
        const presetData = {
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
            presetName,
            description,
            configuration: {
                imageSettings: settings.imageSettings,
                soundSettings: settings.soundSettings,
                animationSettings: settings.animationSettings,
                styleSettings: settings.styleSettings,
                positionSettings: settings.positionSettings,
                displaySettings: settings.displaySettings,
                generalSettings: settings.generalSettings,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const presetId = `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (!settings.presets) {
            settings.presets = [];
        }
        settings.presets.push({
            presetId,
            presetName,
            description,
            configuration: presetData.configuration,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await settings.save();
        return {
            presetId,
            presetName,
            message: 'Preset saved successfully',
        };
    }
    async getPresets(streamerId) {
        const settings = await this.findByStreamerId(streamerId);
        return settings.presets || [];
    }
    async loadPreset(streamerId, presetId) {
        const settings = await this.findByStreamerId(streamerId);
        if (!settings.presets) {
            throw new common_1.NotFoundException('No presets found');
        }
        const preset = settings.presets.find(p => p.presetId === presetId);
        if (!preset) {
            throw new common_1.NotFoundException('Preset not found');
        }
        settings.imageSettings = { ...settings.imageSettings, ...preset.configuration.imageSettings };
        settings.soundSettings = { ...settings.soundSettings, ...preset.configuration.soundSettings };
        settings.animationSettings = { ...settings.animationSettings, ...preset.configuration.animationSettings };
        settings.styleSettings = { ...settings.styleSettings, ...preset.configuration.styleSettings };
        settings.positionSettings = { ...settings.positionSettings, ...preset.configuration.positionSettings };
        settings.displaySettings = { ...settings.displaySettings, ...preset.configuration.displaySettings };
        settings.generalSettings = { ...settings.generalSettings, ...preset.configuration.generalSettings };
        return await settings.save();
    }
    async deletePreset(streamerId, presetId) {
        const settings = await this.findByStreamerId(streamerId);
        if (!settings.presets) {
            throw new common_1.NotFoundException('No presets found');
        }
        const presetIndex = settings.presets.findIndex(p => p.presetId === presetId);
        if (presetIndex === -1) {
            throw new common_1.NotFoundException('Preset not found');
        }
        settings.presets.splice(presetIndex, 1);
        await settings.save();
    }
    async validateConfiguration(configuration) {
        const errors = [];
        const warnings = [];
        if (configuration.imageSettings) {
            if (configuration.imageSettings.width && configuration.imageSettings.width > 1920) {
                errors.push({ field: 'imageSettings.width', message: 'Width cannot exceed 1920px' });
            }
            if (configuration.imageSettings.height && configuration.imageSettings.height > 1080) {
                errors.push({ field: 'imageSettings.height', message: 'Height cannot exceed 1080px' });
            }
        }
        if (configuration.soundSettings) {
            if (configuration.soundSettings.volume && (configuration.soundSettings.volume < 0 || configuration.soundSettings.volume > 100)) {
                errors.push({ field: 'soundSettings.volume', message: 'Volume must be between 0 and 100' });
            }
        }
        if (configuration.positionSettings) {
            if (configuration.positionSettings.x && (configuration.positionSettings.x < 0 || configuration.positionSettings.x > 1920)) {
                errors.push({ field: 'positionSettings.x', message: 'X position must be between 0 and 1920' });
            }
            if (configuration.positionSettings.y && (configuration.positionSettings.y < 0 || configuration.positionSettings.y > 1080)) {
                errors.push({ field: 'positionSettings.y', message: 'Y position must be between 0 and 1080' });
            }
        }
        if (configuration.displaySettings) {
            if (configuration.displaySettings.duration && (configuration.displaySettings.duration < 1000 || configuration.displaySettings.duration > 30000)) {
                errors.push({ field: 'displaySettings.duration', message: 'Display duration must be between 1000ms and 30000ms' });
            }
        }
        if (configuration.imageSettings?.url && !configuration.imageSettings.url.startsWith('http')) {
            warnings.push({ field: 'imageSettings.url', message: 'Image URL should be a valid HTTP/HTTPS URL' });
        }
        if (configuration.soundSettings?.url && !configuration.soundSettings.url.startsWith('http')) {
            warnings.push({ field: 'soundSettings.url', message: 'Sound URL should be a valid HTTP/HTTPS URL' });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    async exportConfiguration(streamerId) {
        const settings = await this.findByStreamerId(streamerId);
        const exportData = {
            imageSettings: settings.imageSettings,
            soundSettings: settings.soundSettings,
            animationSettings: settings.animationSettings,
            styleSettings: settings.styleSettings,
            positionSettings: settings.positionSettings,
            displaySettings: settings.displaySettings,
            generalSettings: settings.generalSettings,
        };
        return {
            exportData,
            exportDate: new Date().toISOString(),
            version: '1.0.0',
        };
    }
    async importConfiguration(streamerId, importData, overwrite = false) {
        const settings = await this.findByStreamerId(streamerId);
        if (overwrite) {
            Object.assign(settings, importData);
        }
        else {
            if (importData.imageSettings) {
                settings.imageSettings = { ...settings.imageSettings, ...importData.imageSettings };
            }
            if (importData.soundSettings) {
                settings.soundSettings = { ...settings.soundSettings, ...importData.soundSettings };
            }
            if (importData.animationSettings) {
                settings.animationSettings = { ...settings.animationSettings, ...importData.animationSettings };
            }
            if (importData.styleSettings) {
                settings.styleSettings = { ...settings.styleSettings, ...importData.styleSettings };
            }
            if (importData.positionSettings) {
                settings.positionSettings = { ...settings.positionSettings, ...importData.positionSettings };
            }
            if (importData.displaySettings) {
                settings.displaySettings = { ...settings.displaySettings, ...importData.displaySettings };
            }
            if (importData.generalSettings) {
                settings.generalSettings = { ...settings.generalSettings, ...importData.generalSettings };
            }
        }
        return await settings.save();
    }
    async testConfiguration(configuration) {
        const testResults = {
            mediaValidation: true,
            animationValidation: true,
            positionValidation: true,
            styleValidation: true,
        };
        if (configuration.imageSettings?.url) {
            try {
                new URL(configuration.imageSettings.url);
            }
            catch {
                testResults.mediaValidation = false;
            }
        }
        if (configuration.soundSettings?.url) {
            try {
                new URL(configuration.soundSettings.url);
            }
            catch {
                testResults.mediaValidation = false;
            }
        }
        if (configuration.animationSettings) {
            if (configuration.animationSettings.duration && (configuration.animationSettings.duration < 200 || configuration.animationSettings.duration > 5000)) {
                testResults.animationValidation = false;
            }
        }
        if (configuration.positionSettings) {
            if (configuration.positionSettings.x && (configuration.positionSettings.x < 0 || configuration.positionSettings.x > 1920)) {
                testResults.positionValidation = false;
            }
            if (configuration.positionSettings.y && (configuration.positionSettings.y < 0 || configuration.positionSettings.y > 1080)) {
                testResults.positionValidation = false;
            }
        }
        if (configuration.styleSettings) {
            if (configuration.styleSettings.fontSize && (configuration.styleSettings.fontSize < 12 || configuration.styleSettings.fontSize > 72)) {
                testResults.styleValidation = false;
            }
        }
        const success = Object.values(testResults).every(result => result === true);
        return {
            success,
            testResults,
            message: success ? 'Configuration test passed' : 'Configuration test failed - check validation results',
        };
    }
    async resetToDefaults(streamerId) {
        const settings = await this.findByStreamerId(streamerId);
        settings.imageSettings = {
            enabled: true,
            mediaType: 'image',
            width: 300,
            height: 200,
            borderRadius: 8,
            shadow: true,
            shadowColor: '#000000',
            shadowBlur: 10,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
        };
        settings.soundSettings = {
            enabled: true,
            volume: 80,
            fadeIn: 0,
            fadeOut: 0,
            loop: false,
        };
        settings.animationSettings = {
            enabled: true,
            animationType: 'fade',
            duration: 500,
            easing: 'ease-out',
            direction: 'right',
            bounceIntensity: 20,
            zoomScale: 1.2,
        };
        settings.styleSettings = {
            backgroundColor: '#1a1a1a',
            textColor: '#ffffff',
            accentColor: '#00ff00',
            borderColor: '#333333',
            borderWidth: 2,
            borderStyle: 'solid',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            fontSize: 16,
            fontWeight: 'normal',
            fontStyle: 'normal',
            textShadow: true,
            textShadowColor: '#000000',
            textShadowBlur: 3,
            textShadowOffsetX: 1,
            textShadowOffsetY: 1,
        };
        settings.positionSettings = {
            x: 100,
            y: 100,
            anchor: 'top-left',
            zIndex: 1000,
            responsive: true,
            mobileScale: 0.8,
        };
        settings.displaySettings = {
            duration: 5000,
            fadeInDuration: 300,
            fadeOutDuration: 300,
            autoHide: true,
            showProgress: false,
            progressColor: '#00ff00',
            progressHeight: 3,
        };
        settings.generalSettings = {
            enabled: true,
            maxAlerts: 3,
            alertSpacing: 20,
            cooldown: 1000,
            priority: 'medium',
        };
        return await settings.save();
    }
    async resetSection(streamerId, section) {
        const settings = await this.findByStreamerId(streamerId);
        switch (section) {
            case 'image':
                settings.imageSettings = {
                    enabled: true,
                    mediaType: 'image',
                    width: 300,
                    height: 200,
                    borderRadius: 8,
                    shadow: true,
                    shadowColor: '#000000',
                    shadowBlur: 10,
                    shadowOffsetX: 2,
                    shadowOffsetY: 2,
                };
                break;
            case 'sound':
                settings.soundSettings = {
                    enabled: true,
                    volume: 80,
                    fadeIn: 0,
                    fadeOut: 0,
                    loop: false,
                };
                break;
            case 'animation':
                settings.animationSettings = {
                    enabled: true,
                    animationType: 'fade',
                    duration: 500,
                    easing: 'ease-out',
                    direction: 'right',
                    bounceIntensity: 20,
                    zoomScale: 1.2,
                };
                break;
            case 'style':
                settings.styleSettings = {
                    backgroundColor: '#1a1a1a',
                    textColor: '#ffffff',
                    accentColor: '#00ff00',
                    borderColor: '#333333',
                    borderWidth: 2,
                    borderStyle: 'solid',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                    fontSize: 16,
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    textShadow: true,
                    textShadowColor: '#000000',
                    textShadowBlur: 3,
                    textShadowOffsetX: 1,
                    textShadowOffsetY: 1,
                };
                break;
            case 'position':
                settings.positionSettings = {
                    x: 100,
                    y: 100,
                    anchor: 'top-left',
                    zIndex: 1000,
                    responsive: true,
                    mobileScale: 0.8,
                };
                break;
            case 'display':
                settings.displaySettings = {
                    duration: 5000,
                    fadeInDuration: 300,
                    fadeOutDuration: 300,
                    autoHide: true,
                    showProgress: false,
                    progressColor: '#00ff00',
                    progressHeight: 3,
                };
                break;
            case 'general':
                settings.generalSettings = {
                    enabled: true,
                    maxAlerts: 3,
                    alertSpacing: 20,
                    cooldown: 1000,
                    priority: 'medium',
                };
                break;
            default:
                throw new common_1.BadRequestException(`Invalid section: ${section}`);
        }
        return await settings.save();
    }
    async getTemplates() {
        return [
            {
                templateId: 'gaming',
                name: 'Gaming Stream',
                description: 'High-energy gaming stream with vibrant colors and animations',
                category: 'gaming',
                preview: 'gaming-preview.png',
            },
            {
                templateId: 'just-chatting',
                name: 'Just Chatting',
                description: 'Clean, professional look for chat-focused streams',
                category: 'chat',
                preview: 'chat-preview.png',
            },
            {
                templateId: 'creative',
                name: 'Creative Stream',
                description: 'Artistic and creative stream with smooth animations',
                category: 'creative',
                preview: 'creative-preview.png',
            },
            {
                templateId: 'minimal',
                name: 'Minimal',
                description: 'Simple, clean design with minimal distractions',
                category: 'minimal',
                preview: 'minimal-preview.png',
            },
        ];
    }
    async applyTemplate(streamerId, templateId) {
        const settings = await this.findByStreamerId(streamerId);
        switch (templateId) {
            case 'gaming':
                settings.styleSettings.backgroundColor = '#1a1a1a';
                settings.styleSettings.accentColor = '#ff6b6b';
                settings.animationSettings.animationType = 'bounce';
                settings.animationSettings.duration = 800;
                settings.generalSettings.priority = 'high';
                break;
            case 'just-chatting':
                settings.styleSettings.backgroundColor = '#ffffff';
                settings.styleSettings.textColor = '#333333';
                settings.styleSettings.accentColor = '#007acc';
                settings.animationSettings.animationType = 'fade';
                settings.animationSettings.duration = 400;
                settings.generalSettings.priority = 'medium';
                break;
            case 'creative':
                settings.styleSettings.backgroundColor = '#2d1b69';
                settings.styleSettings.accentColor = '#ffd700';
                settings.animationSettings.animationType = 'slide';
                settings.animationSettings.duration = 600;
                settings.generalSettings.priority = 'medium';
                break;
            case 'minimal':
                settings.styleSettings.backgroundColor = '#f8f9fa';
                settings.styleSettings.textColor = '#212529';
                settings.styleSettings.accentColor = '#6c757d';
                settings.animationSettings.animationType = 'fade';
                settings.animationSettings.duration = 300;
                settings.generalSettings.priority = 'low';
                break;
            default:
                throw new common_1.NotFoundException(`Template ${templateId} not found`);
        }
        return await settings.save();
    }
    async triggerTestAlert(streamerId, testAlertDto) {
        const settings = await this.findByStreamerId(streamerId);
        let alertData;
        if (testAlertDto.useCurrentSettings) {
            alertData = {
                donorName: testAlertDto.donorName || 'Test Donor',
                amount: testAlertDto.amount || '25.00',
                message: testAlertDto.message || 'This is a test alert using your saved OBS settings!',
                timestamp: new Date(),
                imageSettings: settings.imageSettings,
                soundSettings: settings.soundSettings,
                animationSettings: settings.animationSettings,
                styleSettings: settings.styleSettings,
                positionSettings: settings.positionSettings,
                displaySettings: settings.displaySettings,
                generalSettings: settings.generalSettings,
            };
        }
        else {
            alertData = {
                donorName: testAlertDto.donorName || 'Test Donor',
                amount: testAlertDto.amount || '25.00',
                message: testAlertDto.message || 'This is a test alert!',
                timestamp: new Date(),
            };
        }
        const alertId = `test_alert_${Date.now()}_${(0, crypto_1.randomBytes)(8).toString('hex')}`;
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const widgetUrl = this.generateWidgetUrl(streamerId, settings.alertToken);
        this.obsWidgetGateway.sendTestAlert(streamerId, alertData.donorName, alertData.amount, alertData.message, testAlertDto.useCurrentSettings ? {
            imageSettings: settings.imageSettings,
            soundSettings: settings.soundSettings,
            animationSettings: settings.animationSettings,
            styleSettings: settings.styleSettings,
            positionSettings: settings.positionSettings,
            displaySettings: settings.displaySettings,
            generalSettings: settings.generalSettings,
        } : undefined);
        console.log('Test alert triggered:', {
            streamerId,
            alertId,
            alertData,
            widgetUrl,
            useCurrentSettings: testAlertDto.useCurrentSettings,
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
            message: testAlertDto.useCurrentSettings
                ? 'Test alert triggered successfully using your saved OBS settings'
                : 'Test alert triggered successfully',
        };
    }
    async triggerWidgetAlert(alertToken, testAlertDto) {
        const settings = await this.findByAlertToken(alertToken);
        const streamerId = settings.streamerId.toString();
        let alertData;
        if (testAlertDto.useCurrentSettings) {
            alertData = {
                donorName: testAlertDto.donorName || 'Test Donor',
                amount: testAlertDto.amount || '25.00',
                message: testAlertDto.message || 'This is a test alert using your saved OBS settings!',
                timestamp: new Date(),
                imageSettings: settings.imageSettings,
                soundSettings: settings.soundSettings,
                animationSettings: settings.animationSettings,
                styleSettings: settings.styleSettings,
                positionSettings: settings.positionSettings,
                displaySettings: settings.displaySettings,
                generalSettings: settings.generalSettings,
            };
        }
        else {
            alertData = {
                donorName: testAlertDto.donorName || 'Test Donor',
                amount: testAlertDto.amount || '25.00',
                message: testAlertDto.message || 'This is a test alert!',
                timestamp: new Date(),
            };
        }
        const alertId = `widget_alert_${Date.now()}_${(0, crypto_1.randomBytes)(8).toString('hex')}`;
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const widgetUrl = this.generateWidgetUrl(streamerId, settings.alertToken);
        this.obsWidgetGateway.sendTestAlert(streamerId, alertData.donorName, alertData.amount, alertData.message, testAlertDto.useCurrentSettings ? {
            imageSettings: settings.imageSettings,
            soundSettings: settings.soundSettings,
            animationSettings: settings.animationSettings,
            styleSettings: settings.styleSettings,
            positionSettings: settings.positionSettings,
            displaySettings: settings.displaySettings,
            generalSettings: settings.generalSettings,
        } : undefined);
        console.log('Widget alert triggered:', {
            streamerId,
            alertId,
            alertData,
            widgetUrl,
            useCurrentSettings: testAlertDto.useCurrentSettings,
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
            message: testAlertDto.useCurrentSettings
                ? 'Widget alert triggered successfully using your saved OBS settings'
                : 'Widget alert triggered successfully',
        };
    }
    async triggerDonationAlert(alertToken, donationAlertDto) {
        console.log(`Processing donation alert request for token: ${alertToken.substring(0, 8)}...`);
        const settings = await this.findByAlertToken(alertToken);
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
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const widgetUrl = this.generateWidgetUrl(streamerId, settings.alertToken);
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
    async getTestAlertHistory(streamerId, limit = 10) {
        return {
            streamerId,
            testAlerts: [
                {
                    alertId: `test_alert_${Date.now() - 1000}`,
                    donorName: 'Test Donor',
                    amount: '25.00',
                    message: 'This is a test alert!',
                    timestamp: new Date(Date.now() - 1000),
                    success: true,
                },
                {
                    alertId: `test_alert_${Date.now() - 2000}`,
                    donorName: 'Another Test',
                    amount: '50.00',
                    message: 'Another test message',
                    timestamp: new Date(Date.now() - 2000),
                    success: true,
                },
            ],
            total: 2,
        };
    }
    async getWidgetUrl(streamerId) {
        const settings = await this.findByStreamerId(streamerId);
        const widgetUrl = this.generateWidgetUrl(streamerId, settings.alertToken);
        const maskedToken = `${settings.alertToken.substring(0, 8)}...`;
        return {
            widgetUrl,
            streamerId,
            alertToken: maskedToken
        };
    }
    async getFullWidgetUrl(streamerId) {
        const settings = await this.findByStreamerId(streamerId);
        const widgetUrl = this.generateWidgetUrl(streamerId, settings.alertToken);
        const fullUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/widget-public/alert/${streamerId}/${settings.alertToken}`;
        return {
            widgetUrl,
            streamerId,
            alertToken: settings.alertToken,
            fullUrl
        };
    }
    async getWidgetStatus(streamerId) {
        await this.findByStreamerId(streamerId);
        const connectedWidgets = this.obsWidgetGateway.getStreamerClientCount(streamerId);
        const isConnected = connectedWidgets > 0;
        return {
            connectedWidgets,
            isConnected,
            lastConnected: isConnected ? new Date().toISOString() : undefined
        };
    }
};
exports.OBSSettingsService = OBSSettingsService;
exports.OBSSettingsService = OBSSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(obs_settings_schema_1.OBSSettings.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => obs_widget_gateway_1.OBSWidgetGateway))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        obs_widget_gateway_1.OBSWidgetGateway,
        obs_security_service_1.OBSSecurityService])
], OBSSettingsService);
//# sourceMappingURL=obs-settings.service.js.map