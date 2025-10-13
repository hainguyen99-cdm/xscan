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
    async optimizeMediaFiles(levelUpdate) {
        const optimized = { ...levelUpdate };
        if (optimized.configuration) {
            const config = optimized.configuration;
            if (config.imageSettings) {
                config.imageSettings = await this.optimizeImageSettings(config.imageSettings);
            }
            if (config.soundSettings) {
                config.soundSettings = await this.optimizeSoundSettings(config.soundSettings);
            }
        }
        const totalSize = JSON.stringify(optimized).length;
        if (totalSize > 10 * 1024 * 1024) {
            console.warn(`⚠️ Large payload detected (${(totalSize / (1024 * 1024)).toFixed(2)}MB), applying aggressive optimization`);
            return await this.applyAggressiveOptimization(optimized);
        }
        return optimized;
    }
    mergeDifferentialUpdate(existingLevel, differentialUpdate) {
        const merged = { ...existingLevel };
        if (differentialUpdate.levelName !== undefined) {
            merged.levelName = differentialUpdate.levelName;
        }
        if (differentialUpdate.minAmount !== undefined) {
            merged.minAmount = differentialUpdate.minAmount;
        }
        if (differentialUpdate.maxAmount !== undefined) {
            merged.maxAmount = differentialUpdate.maxAmount;
        }
        if (differentialUpdate.currency !== undefined) {
            merged.currency = differentialUpdate.currency;
        }
        if (differentialUpdate.isEnabled !== undefined) {
            merged.isEnabled = differentialUpdate.isEnabled;
        }
        if (differentialUpdate.configuration) {
            merged.configuration = {
                ...(merged.configuration || {}),
                ...differentialUpdate.configuration
            };
            const configSections = ['imageSettings', 'soundSettings', 'animationSettings', 'styleSettings', 'positionSettings', 'displaySettings', 'generalSettings'];
            for (const section of configSections) {
                if (differentialUpdate.configuration[section]) {
                    merged.configuration[section] = {
                        ...(merged.configuration[section] || {}),
                        ...differentialUpdate.configuration[section]
                    };
                }
            }
        }
        if (differentialUpdate.customization) {
            merged.customization = {
                ...(merged.customization || {}),
                ...differentialUpdate.customization
            };
        }
        merged.updatedAt = new Date();
        console.log(`📊 Merged differential update:`, {
            originalSize: JSON.stringify(existingLevel).length,
            updateSize: JSON.stringify(differentialUpdate).length,
            mergedSize: JSON.stringify(merged).length,
            efficiency: `${((1 - JSON.stringify(differentialUpdate).length / JSON.stringify(existingLevel).length) * 100).toFixed(1)}% size reduction`
        });
        return merged;
    }
    async restoreOptimizedLevels(streamerId) {
        const settings = await this.findByStreamerId(streamerId);
        if (!settings) {
            throw new Error('OBS settings not found for streamer');
        }
        if (!Array.isArray(settings.donationLevels)) {
            return settings;
        }
        const levels = settings.donationLevels;
        let restored = false;
        for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            if (level.configuration && level.configuration.removed &&
                (!level.configuration.animationSettings ||
                    !level.configuration.styleSettings ||
                    !level.configuration.positionSettings ||
                    !level.configuration.displaySettings)) {
                console.log(`🔧 Restoring configuration structure for level ${i}: ${level.levelName}`);
                level.configuration = {
                    imageSettings: level.configuration.imageSettings || {},
                    soundSettings: level.configuration.soundSettings || {},
                    animationSettings: {
                        animationType: 'fade',
                        duration: 500,
                        ...level.configuration.animationSettings
                    },
                    styleSettings: {
                        backgroundColor: '#1a1a1a',
                        textColor: '#ffffff',
                        fontFamily: 'Inter',
                        fontSize: 16,
                        ...level.configuration.styleSettings
                    },
                    positionSettings: {
                        anchor: 'top-right',
                        ...level.configuration.positionSettings
                    },
                    displaySettings: {
                        duration: 5000,
                        autoHide: true,
                        ...level.configuration.displaySettings
                    },
                    generalSettings: level.configuration.generalSettings || {},
                    restored: true,
                    reason: 'Configuration structure restored for frontend compatibility'
                };
                restored = true;
            }
        }
        if (restored) {
            console.log(`✅ Restored configuration structure for optimized levels`);
            await settings.save();
        }
        return settings;
    }
    analyzeDocumentSize(settings, levels, targetIdx, targetUpdate) {
        console.log(`🔍 Document size analysis:`);
        console.log(`📊 Total levels: ${levels.length}`);
        levels.forEach((level, index) => {
            const levelSize = JSON.stringify(level).length;
            const levelSizeMB = (levelSize / (1024 * 1024)).toFixed(2);
            console.log(`📊 Level ${index} (${level.levelName || level.levelId}): ${levelSizeMB}MB`);
            if (level.configuration) {
                const configSize = JSON.stringify(level.configuration).length;
                const configSizeMB = (configSize / (1024 * 1024)).toFixed(2);
                console.log(`  📊 Configuration: ${configSizeMB}MB`);
                if (level.configuration.imageSettings) {
                    const imageSize = JSON.stringify(level.configuration.imageSettings).length;
                    const imageSizeMB = (imageSize / (1024 * 1024)).toFixed(2);
                    console.log(`    📊 Image settings: ${imageSizeMB}MB`);
                }
                if (level.configuration.soundSettings) {
                    const soundSize = JSON.stringify(level.configuration.soundSettings).length;
                    const soundSizeMB = (soundSize / (1024 * 1024)).toFixed(2);
                    console.log(`    📊 Sound settings: ${soundSizeMB}MB`);
                }
            }
        });
        const updateSize = JSON.stringify(targetUpdate).length;
        const updateSizeMB = (updateSize / (1024 * 1024)).toFixed(2);
        console.log(`📊 Target update size: ${updateSizeMB}MB`);
    }
    async optimizeEntireDocument(settings, levels, targetIdx, targetUpdate) {
        console.log(`🔧 Starting document-wide optimization`);
        const currentLevel = levels[targetIdx] || {};
        if (typeof targetUpdate.levelName === 'string')
            currentLevel.levelName = targetUpdate.levelName;
        if (typeof targetUpdate.minAmount === 'number')
            currentLevel.minAmount = targetUpdate.minAmount;
        if (typeof targetUpdate.maxAmount === 'number')
            currentLevel.maxAmount = targetUpdate.maxAmount;
        if (typeof targetUpdate.currency === 'string')
            currentLevel.currency = targetUpdate.currency;
        if (typeof targetUpdate.isEnabled === 'boolean')
            currentLevel.isEnabled = targetUpdate.isEnabled;
        currentLevel.configuration = {
            imageSettings: {},
            soundSettings: {},
            animationSettings: {
                animationType: 'fade',
                duration: 500
            },
            styleSettings: {
                backgroundColor: '#1a1a1a',
                textColor: '#ffffff',
                fontFamily: 'Inter',
                fontSize: 16
            },
            positionSettings: {
                anchor: 'top-right'
            },
            displaySettings: {
                duration: 5000,
                autoHide: true
            },
            generalSettings: {},
            removed: true,
            reason: 'All media files removed due to document size constraints'
        };
        levels[targetIdx] = currentLevel;
        for (let i = 0; i < levels.length; i++) {
            if (i !== targetIdx && levels[i].configuration) {
                console.log(`🗑️ Optimizing level ${i} to reduce document size`);
                levels[i].configuration = {
                    imageSettings: {},
                    soundSettings: {},
                    animationSettings: {
                        animationType: 'fade',
                        duration: 500
                    },
                    styleSettings: {
                        backgroundColor: '#1a1a1a',
                        textColor: '#ffffff',
                        fontFamily: 'Inter',
                        fontSize: 16
                    },
                    positionSettings: {
                        anchor: 'top-right'
                    },
                    displaySettings: {
                        duration: 5000,
                        autoHide: true
                    },
                    generalSettings: {},
                    removed: true,
                    reason: 'Media files removed to accommodate new level'
                };
                levels[i].optimizationApplied = true;
                levels[i].optimizationMessage = 'Level optimized for document size constraints';
            }
        }
        settings.donationLevels = levels;
        const finalSize = JSON.stringify(settings.toObject()).length;
        console.log(`📊 Final document size after document-wide optimization: ${(finalSize / (1024 * 1024)).toFixed(2)}MB`);
        if (finalSize > 16 * 1024 * 1024) {
            console.log(`⚠️ Document still too large, removing excess donation levels`);
            const essentialLevels = [levels[targetIdx]];
            const otherLevels = levels.filter((_, i) => i !== targetIdx);
            const sortedLevels = otherLevels.sort((a, b) => {
                const sizeA = JSON.stringify(a).length;
                const sizeB = JSON.stringify(b).length;
                return sizeA - sizeB;
            });
            essentialLevels.push(...sortedLevels.slice(0, 2));
            console.log(`🗑️ Reduced from ${levels.length} to ${essentialLevels.length} donation levels`);
            settings.donationLevels = essentialLevels;
            const finalSizeAfterReduction = JSON.stringify(settings.toObject()).length;
            console.log(`📊 Final document size after level reduction: ${(finalSizeAfterReduction / (1024 * 1024)).toFixed(2)}MB`);
            if (finalSizeAfterReduction > 16 * 1024 * 1024) {
                throw new Error(`Document size (${(finalSizeAfterReduction / (1024 * 1024)).toFixed(2)}MB) still exceeds MongoDB BSON limit. Please use smaller media files.`);
            }
        }
        await settings.save();
        return settings;
    }
    async applyAggressiveOptimization(data) {
        let optimized = { ...data };
        if (optimized.configuration) {
            const config = optimized.configuration;
            if (config.imageSettings) {
                config.imageSettings = this.removeLargeMediaFiles(config.imageSettings, 'image', 500 * 1024);
            }
            if (config.soundSettings) {
                config.soundSettings = this.removeLargeMediaFiles(config.soundSettings, 'audio', 500 * 1024);
            }
        }
        let currentSize = JSON.stringify(optimized).length;
        console.log(`📊 Size after first optimization: ${(currentSize / (1024 * 1024)).toFixed(2)}MB`);
        if (currentSize > 12 * 1024 * 1024) {
            console.log(`🗑️ Document still too large, removing ALL media files`);
            optimized = this.removeAllMediaFiles(optimized);
            currentSize = JSON.stringify(optimized).length;
            console.log(`📊 Size after removing all media: ${(currentSize / (1024 * 1024)).toFixed(2)}MB`);
        }
        if (currentSize > 12 * 1024 * 1024) {
            console.log(`🗑️ Document still too large, removing configuration`);
            optimized.configuration = {
                imageSettings: {},
                soundSettings: {},
                animationSettings: {
                    animationType: 'fade',
                    duration: 500
                },
                styleSettings: {
                    backgroundColor: '#1a1a1a',
                    textColor: '#ffffff',
                    fontFamily: 'Inter',
                    fontSize: 16
                },
                positionSettings: {
                    anchor: 'top-right'
                },
                displaySettings: {
                    duration: 5000,
                    autoHide: true
                },
                generalSettings: {},
                removed: true,
                reason: 'Configuration removed due to size constraints'
            };
            currentSize = JSON.stringify(optimized).length;
            console.log(`📊 Size after removing configuration: ${(currentSize / (1024 * 1024)).toFixed(2)}MB`);
        }
        if (currentSize > 12 * 1024 * 1024) {
            console.log(`🗑️ Document still too large, creating minimal level`);
            optimized = {
                levelId: optimized.levelId,
                levelName: optimized.levelName || 'Optimized Level',
                minAmount: optimized.minAmount || 0,
                maxAmount: optimized.maxAmount || 100000,
                currency: optimized.currency || 'VND',
                isEnabled: optimized.isEnabled !== undefined ? optimized.isEnabled : true,
                configuration: {
                    imageSettings: {},
                    soundSettings: {},
                    animationSettings: {
                        animationType: 'fade',
                        duration: 500
                    },
                    styleSettings: {
                        backgroundColor: '#1a1a1a',
                        textColor: '#ffffff',
                        fontFamily: 'Inter',
                        fontSize: 16
                    },
                    positionSettings: {
                        anchor: 'top-right'
                    },
                    displaySettings: {
                        duration: 5000,
                        autoHide: true
                    },
                    generalSettings: {},
                    removed: true,
                    reason: 'Level optimized due to size constraints - only basic settings preserved'
                },
                optimizationApplied: true,
                createdAt: optimized.createdAt || new Date(),
                updatedAt: new Date()
            };
            currentSize = JSON.stringify(optimized).length;
            console.log(`📊 Size after minimal optimization: ${(currentSize / (1024 * 1024)).toFixed(2)}MB`);
        }
        return optimized;
    }
    removeLargeMediaFiles(settings, type, sizeThreshold = 1024 * 1024) {
        if (!settings)
            return settings;
        const optimized = { ...settings };
        const fields = type === 'image'
            ? ['backgroundImage', 'overlayImage', 'alertImage', 'customImage']
            : ['alertSound', 'backgroundMusic', 'customSound'];
        for (const field of fields) {
            if (optimized[field] && optimized[field].data) {
                const base64Data = optimized[field].data;
                if (base64Data.length > sizeThreshold) {
                    console.log(`🗑️ Removing large ${type} file: ${field} (${base64Data.length} chars, threshold: ${sizeThreshold})`);
                    optimized[field] = {
                        name: optimized[field].name,
                        type: optimized[field].type,
                        size: optimized[field].size,
                        data: null,
                        removed: true,
                        reason: `File too large for database storage (${(base64Data.length / (1024 * 1024)).toFixed(2)}MB)`,
                        originalSize: base64Data.length
                    };
                }
            }
        }
        return optimized;
    }
    removeAllMediaFiles(data) {
        const optimized = { ...data };
        if (optimized.configuration) {
            const config = optimized.configuration;
            if (config.imageSettings) {
                const imageFields = ['backgroundImage', 'overlayImage', 'alertImage', 'customImage'];
                for (const field of imageFields) {
                    if (config.imageSettings[field] && config.imageSettings[field].data) {
                        console.log(`🗑️ Removing ALL image file: ${field}`);
                        config.imageSettings[field] = {
                            name: config.imageSettings[field].name,
                            type: config.imageSettings[field].type,
                            size: config.imageSettings[field].size,
                            data: null,
                            removed: true,
                            reason: 'All media files removed due to document size constraints',
                            originalSize: config.imageSettings[field].data.length
                        };
                    }
                }
            }
            if (config.soundSettings) {
                const audioFields = ['alertSound', 'backgroundMusic', 'customSound'];
                for (const field of audioFields) {
                    if (config.soundSettings[field] && config.soundSettings[field].data) {
                        console.log(`🗑️ Removing ALL audio file: ${field}`);
                        config.soundSettings[field] = {
                            name: config.soundSettings[field].name,
                            type: config.soundSettings[field].type,
                            size: config.soundSettings[field].size,
                            data: null,
                            removed: true,
                            reason: 'All media files removed due to document size constraints',
                            originalSize: config.soundSettings[field].data.length
                        };
                    }
                }
            }
        }
        return optimized;
    }
    async optimizeImageSettings(imageSettings) {
        if (!imageSettings)
            return imageSettings;
        const optimized = { ...imageSettings };
        const imageFields = ['backgroundImage', 'overlayImage', 'alertImage', 'customImage'];
        for (const field of imageFields) {
            if (optimized[field] && optimized[field].data) {
                const base64Data = optimized[field].data;
                if (base64Data.length > 1024 * 1024) {
                    console.log(`🗜️ Compressing large image: ${field} (${base64Data.length} chars)`);
                    try {
                        if (base64Data.length > 5 * 1024 * 1024) {
                            console.warn(`⚠️ Image ${field} is too large (${base64Data.length} chars), truncating`);
                            optimized[field] = {
                                ...optimized[field],
                                data: base64Data.substring(0, 1024 * 1024),
                                compressed: true,
                                originalSize: base64Data.length,
                                warning: 'Image was compressed due to size limits'
                            };
                        }
                    }
                    catch (error) {
                        console.error(`❌ Error optimizing image ${field}:`, error);
                        delete optimized[field];
                    }
                }
            }
        }
        return optimized;
    }
    async optimizeSoundSettings(soundSettings) {
        if (!soundSettings)
            return soundSettings;
        const optimized = { ...soundSettings };
        const soundFields = ['alertSound', 'backgroundMusic', 'customSound'];
        for (const field of soundFields) {
            if (optimized[field] && optimized[field].data) {
                const base64Data = optimized[field].data;
                if (base64Data.length > 2 * 1024 * 1024) {
                    console.log(`🗜️ Compressing large audio: ${field} (${base64Data.length} chars)`);
                    try {
                        if (base64Data.length > 10 * 1024 * 1024) {
                            console.warn(`⚠️ Audio ${field} is too large (${base64Data.length} chars), truncating`);
                            optimized[field] = {
                                ...optimized[field],
                                data: base64Data.substring(0, 2 * 1024 * 1024),
                                compressed: true,
                                originalSize: base64Data.length,
                                warning: 'Audio was compressed due to size limits'
                            };
                        }
                    }
                    catch (error) {
                        console.error(`❌ Error optimizing audio ${field}:`, error);
                        delete optimized[field];
                    }
                }
            }
        }
        return optimized;
    }
    async updateDonationLevel(streamerId, levelId, levelUpdate) {
        const settings = await this.findByStreamerId(streamerId);
        if (!settings) {
            throw new Error('OBS settings not found for streamer');
        }
        if (!Array.isArray(settings.donationLevels)) {
            settings.donationLevels = [];
        }
        const levels = settings.donationLevels;
        const idx = levels.findIndex((lvl) => lvl.levelId === levelId);
        if (idx === -1) {
            throw new Error('Donation level not found');
        }
        const isDifferentialUpdate = levelUpdate.levelId && Object.keys(levelUpdate).length < 10;
        if (isDifferentialUpdate) {
            console.log(`📊 Processing differential update for level: ${levelId}`);
            console.log(`📊 Update fields:`, Object.keys(levelUpdate));
            const existingLevel = levels[idx];
            const mergedUpdate = this.mergeDifferentialUpdate(existingLevel, levelUpdate);
            const optimizedUpdate = await this.optimizeMediaFiles(mergedUpdate);
            const tempLevel = { ...levels[idx], ...optimizedUpdate };
            const tempLevels = [...levels];
            tempLevels[idx] = tempLevel;
            const tempSettings = { ...settings.toObject(), donationLevels: tempLevels };
            const tempDocSize = JSON.stringify(tempSettings).length;
            console.log(`📊 Temporary document size with differential update: ${(tempDocSize / (1024 * 1024)).toFixed(2)}MB`);
            if (tempDocSize > 12 * 1024 * 1024) {
                console.log(`⚠️ Document still too large after differential update, applying document-wide optimization`);
                return await this.optimizeEntireDocument(settings, levels, idx, optimizedUpdate);
            }
            levelUpdate = optimizedUpdate;
        }
        else {
            const optimizedUpdate = await this.optimizeMediaFiles(levelUpdate);
            const tempLevel = { ...levels[idx], ...optimizedUpdate };
            const tempLevels = [...levels];
            tempLevels[idx] = tempLevel;
            const tempSettings = { ...settings.toObject(), donationLevels: tempLevels };
            const tempDocSize = JSON.stringify(tempSettings).length;
            console.log(`📊 Temporary document size with full update: ${(tempDocSize / (1024 * 1024)).toFixed(2)}MB`);
            this.analyzeDocumentSize(settings, levels, idx, optimizedUpdate);
            if (tempDocSize > 12 * 1024 * 1024) {
                console.log(`⚠️ Document still too large after level optimization, applying document-wide optimization`);
                return await this.optimizeEntireDocument(settings, levels, idx, optimizedUpdate);
            }
            levelUpdate = optimizedUpdate;
        }
        const currentLevel = levels[idx] || {};
        if (typeof levelUpdate.levelName === 'string')
            currentLevel.levelName = levelUpdate.levelName;
        if (typeof levelUpdate.minAmount === 'number')
            currentLevel.minAmount = levelUpdate.minAmount;
        if (typeof levelUpdate.maxAmount === 'number')
            currentLevel.maxAmount = levelUpdate.maxAmount;
        if (typeof levelUpdate.currency === 'string')
            currentLevel.currency = levelUpdate.currency;
        if (typeof levelUpdate.isEnabled === 'boolean')
            currentLevel.isEnabled = levelUpdate.isEnabled;
        currentLevel.configuration = {
            ...(currentLevel.configuration || {}),
            ...(levelUpdate.configuration || {}),
        };
        const cz = levelUpdate.customization || {};
        if (cz) {
            const cfg = currentLevel.configuration || {};
            if (cz.image) {
                cfg.imageSettings = {
                    ...(cfg.imageSettings || {}),
                    url: cz.image.url ?? (cfg.imageSettings?.url),
                    mediaType: cz.image.type ?? (cfg.imageSettings?.mediaType),
                    duration: cz.image.duration ?? (cfg.imageSettings?.duration),
                };
            }
            if (cz.sound) {
                cfg.soundSettings = {
                    ...(cfg.soundSettings || {}),
                    url: cz.sound.url ?? (cfg.soundSettings?.url),
                    volume: cz.sound.volume ?? (cfg.soundSettings?.volume),
                    duration: cz.sound.duration ?? (cfg.soundSettings?.duration),
                };
            }
            if (cz.text) {
                cfg.styleSettings = {
                    ...(cfg.styleSettings || {}),
                    fontFamily: cz.text.font ?? (cfg.styleSettings?.fontFamily),
                    fontSize: cz.text.fontSize ?? (cfg.styleSettings?.fontSize),
                    textColor: cz.text.color ?? (cfg.styleSettings?.textColor),
                    backgroundColor: cz.text.backgroundColor ?? (cfg.styleSettings?.backgroundColor),
                };
                if (typeof cz.text.animation !== 'undefined') {
                    cfg.animationSettings = {
                        ...(cfg.animationSettings || {}),
                        animationType: cz.text.animation === 'none' ? 'none' : 'fade',
                        duration: cz.text.animation === 'none' ? 0 : 500,
                    };
                }
            }
            if (typeof cz.position !== 'undefined') {
                cfg.positionSettings = {
                    ...(cfg.positionSettings || {}),
                    anchor: cz.position,
                };
            }
            if (typeof cz.duration !== 'undefined') {
                let durationMs = cz.duration;
                if (typeof durationMs === 'number' && durationMs < 1000) {
                    durationMs = durationMs * 1000;
                }
                cfg.displaySettings = {
                    ...(cfg.displaySettings || {}),
                    duration: durationMs,
                };
            }
            currentLevel.configuration = cfg;
            currentLevel.customization = { ...(currentLevel.customization || {}), ...cz };
        }
        currentLevel.updatedAt = new Date();
        if (levelUpdate.configuration) {
            currentLevel.optimizationApplied = true;
            currentLevel.optimizationMessage = 'Level optimized for database storage';
        }
        levels[idx] = currentLevel;
        settings.donationLevels = levels;
        const docSize = JSON.stringify(settings.toObject()).length;
        console.log(`📊 Document size before save: ${(docSize / (1024 * 1024)).toFixed(2)}MB`);
        if (docSize > 15 * 1024 * 1024) {
            console.warn(`⚠️ Document size (${(docSize / (1024 * 1024)).toFixed(2)}MB) approaching MongoDB limit`);
        }
        if (docSize > 16 * 1024 * 1024) {
            throw new Error(`Document size (${(docSize / (1024 * 1024)).toFixed(2)}MB) exceeds MongoDB BSON limit of 16MB. Please reduce file sizes.`);
        }
        await settings.save();
        return settings;
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
        let alertSettings = null;
        let matchingLevel = null;
        let behavior = 'unknown';
        if (testAlertDto.useCurrentSettings) {
            const testAmount = parseFloat(testAlertDto.amount || '25.00');
            const testCurrency = 'VND';
            const settingsResult = this.getSettingsForDonation(settings, testAmount, testCurrency);
            alertSettings = settingsResult.settings;
            matchingLevel = settingsResult.level;
            behavior = settingsResult.behavior;
            console.log(`🧪 Test alert using settings behavior: ${behavior} for amount ${testAmount} ${testCurrency}`);
            alertData = {
                donorName: testAlertDto.donorName || 'Test Donor',
                amount: testAlertDto.amount || '25.00',
                message: testAlertDto.message || 'This is a test alert using your saved OBS settings!',
                timestamp: new Date(),
                ...alertSettings,
                donationLevel: matchingLevel ? {
                    levelId: matchingLevel.levelId,
                    levelName: matchingLevel.levelName,
                    minAmount: matchingLevel.minAmount,
                    maxAmount: matchingLevel.maxAmount,
                    currency: matchingLevel.currency
                } : undefined,
                settingsBehavior: behavior
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
        this.obsWidgetGateway.sendTestAlert(streamerId, alertData.donorName, alertData.amount, alertData.message, testAlertDto.useCurrentSettings ? alertSettings : undefined);
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
        const normalizeAmount = (value) => {
            const cleaned = (value || '').toString().replace(/[^0-9.]/g, '');
            const parsed = parseFloat(cleaned);
            return Number.isFinite(parsed) ? parsed : 0;
        };
        this.obsWidgetGateway.sendDonationAlert(streamerId, alertData.donorName, normalizeAmount(alertData.amount), alertData.currency?.toUpperCase?.() || 'VND', alertData.message);
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
    determineDonationLevel(settings, amount, currency) {
        if (!settings.donationLevels || settings.donationLevels.length === 0) {
            return null;
        }
        const matchingLevel = settings.donationLevels.find(level => {
            if (!level.isEnabled)
                return false;
            const levelMinAmount = level.minAmount;
            const levelMaxAmount = level.maxAmount;
            return amount >= levelMinAmount && amount <= levelMaxAmount;
        });
        if (matchingLevel) {
            console.log(`🎯 Found matching donation level: ${matchingLevel.levelName} for amount ${amount} ${currency}`);
            return matchingLevel;
        }
        console.log(`⚠️ No matching donation level found for amount ${amount} ${currency}, using basic settings`);
        return null;
    }
    getSettingsForDonation(settings, amount, currency) {
        const behavior = settings.settingsBehavior || 'auto';
        console.log(`🔧 Settings behavior: ${behavior} for amount ${amount} ${currency}`);
        switch (behavior) {
            case 'basic':
                console.log(`📋 Using basic settings (forced by streamer configuration)`);
                return {
                    settings: settings.toObject(),
                    level: null,
                    behavior: 'basic'
                };
            case 'donation-levels':
                if (!settings.donationLevels || settings.donationLevels.length === 0) {
                    console.log(`⚠️ No donation levels configured, falling back to basic settings`);
                    return {
                        settings: settings.toObject(),
                        level: null,
                        behavior: 'basic-fallback'
                    };
                }
                const matchingLevel = this.determineDonationLevel(settings, amount, currency);
                if (matchingLevel) {
                    const mergedSettings = this.getMergedSettingsForLevel(settings, matchingLevel, { exclusiveMedia: true });
                    console.log(`🎯 Using donation level settings: ${matchingLevel.levelName}`);
                    return {
                        settings: mergedSettings,
                        level: matchingLevel,
                        behavior: 'donation-levels'
                    };
                }
                else {
                    const firstLevel = settings.donationLevels.find(level => level.isEnabled);
                    if (firstLevel) {
                        const mergedSettings = this.getMergedSettingsForLevel(settings, firstLevel, { exclusiveMedia: true });
                        console.log(`🎯 Using first available donation level: ${firstLevel.levelName}`);
                        return {
                            settings: mergedSettings,
                            level: firstLevel,
                            behavior: 'donation-levels-fallback'
                        };
                    }
                    else {
                        console.log(`⚠️ No enabled donation levels found, falling back to basic settings`);
                        return {
                            settings: settings.toObject(),
                            level: null,
                            behavior: 'basic-fallback'
                        };
                    }
                }
            case 'auto':
            default:
                const autoLevel = this.determineDonationLevel(settings, amount, currency);
                if (autoLevel) {
                    const mergedSettings = this.getMergedSettingsForLevel(settings, autoLevel);
                    console.log(`🎯 Auto: Using donation level settings: ${autoLevel.levelName}`);
                    return {
                        settings: mergedSettings,
                        level: autoLevel,
                        behavior: 'auto-donation-levels'
                    };
                }
                else {
                    console.log(`📋 Auto: Using basic settings (no matching donation level)`);
                    return {
                        settings: settings.toObject(),
                        level: null,
                        behavior: 'auto-basic'
                    };
                }
        }
    }
    getMergedSettingsForLevel(settings, level, options = {}) {
        if (!level) {
            return settings;
        }
        const configuration = level.configuration || {};
        const customization = level.customization || {};
        const translatedOverrides = {
            imageSettings: {
                ...(configuration.imageSettings || {}),
                ...(customization.image?.url ? { url: customization.image.url } : {}),
                ...(customization.image?.type ? { mediaType: customization.image.type } : {}),
                ...(typeof customization.image?.duration === 'number' ? { duration: customization.image.duration } : {}),
            },
            soundSettings: {
                ...(configuration.soundSettings || {}),
                ...(customization.sound?.url ? { url: customization.sound.url } : {}),
                ...(typeof customization.sound?.volume === 'number' ? { volume: customization.sound.volume } : {}),
                ...(typeof customization.sound?.duration === 'number' ? { duration: customization.sound.duration } : {}),
            },
            animationSettings: {
                ...(configuration.animationSettings || {}),
                ...(customization.text?.animation ? { animation: customization.text.animation } : {}),
            },
            styleSettings: {
                ...(configuration.styleSettings || {}),
                ...(customization.text?.font ? { fontFamily: customization.text.font } : {}),
                ...(typeof customization.text?.fontSize === 'number' ? { fontSize: customization.text.fontSize } : {}),
                ...(customization.text?.color ? { color: customization.text.color } : {}),
                ...(customization.text?.backgroundColor ? { backgroundColor: customization.text.backgroundColor } : {}),
            },
            positionSettings: {
                ...(configuration.positionSettings || {}),
                ...(customization.position ? { position: customization.position } : {}),
            },
            displaySettings: {
                ...(configuration.displaySettings || {}),
                ...(typeof customization.duration === 'number' ? { duration: customization.duration } : {}),
            },
            generalSettings: {
                ...(configuration.generalSettings || {}),
            },
        };
        const useExclusiveMedia = options.exclusiveMedia === true;
        const mergedSettings = {
            ...settings.toObject(),
            imageSettings: useExclusiveMedia
                ? {
                    ...(translatedOverrides.imageSettings || {}),
                }
                : {
                    ...settings.imageSettings,
                    ...translatedOverrides.imageSettings,
                },
            soundSettings: useExclusiveMedia
                ? {
                    ...(translatedOverrides.soundSettings || {}),
                }
                : {
                    ...settings.soundSettings,
                    ...translatedOverrides.soundSettings,
                },
            animationSettings: {
                ...settings.animationSettings,
                ...translatedOverrides.animationSettings,
            },
            styleSettings: {
                ...settings.styleSettings,
                ...translatedOverrides.styleSettings,
            },
            positionSettings: {
                ...settings.positionSettings,
                ...translatedOverrides.positionSettings,
            },
            displaySettings: {
                ...settings.displaySettings,
                ...translatedOverrides.displaySettings,
            },
            generalSettings: {
                ...settings.generalSettings,
                ...translatedOverrides.generalSettings,
            }
        };
        try {
            console.log('🎥 Level merge debug', {
                levelName: level.levelName,
                imgUrl: mergedSettings.imageSettings?.url,
                imgType: mergedSettings.imageSettings?.mediaType,
                soundUrl: mergedSettings.soundSettings?.url,
                soundVol: mergedSettings.soundSettings?.volume,
            });
        }
        catch { }
        console.log(`🔄 Merged settings for level ${level.levelName}:`, {
            levelName: level.levelName,
            hasImageSettings: !!level.configuration.imageSettings,
            hasSoundSettings: !!level.configuration.soundSettings,
            hasAnimationSettings: !!level.configuration.animationSettings,
            hasStyleSettings: !!level.configuration.styleSettings,
            hasPositionSettings: !!level.configuration.positionSettings,
            hasDisplaySettings: !!level.configuration.displaySettings,
            hasGeneralSettings: !!level.configuration.generalSettings
        });
        return mergedSettings;
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