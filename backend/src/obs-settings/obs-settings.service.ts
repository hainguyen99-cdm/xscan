import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OBSSettings, OBSSettingsDocument } from './obs-settings.schema';
import { CreateOBSSettingsDto, UpdateOBSSettingsDto } from './dto';
import { TestAlertDto, TestAlertResponseDto, DonationAlertDto, DonationAlertResponseDto } from './dto/configuration.dto';
import { OBSWidgetGateway } from './obs-widget.gateway';
import { OBSSecurityService } from './obs-security.service';
import { randomBytes } from 'crypto';

@Injectable()
export class OBSSettingsService {
  constructor(
    @InjectModel(OBSSettings.name)
    private obsSettingsModel: Model<OBSSettingsDocument>,
    @Inject(forwardRef(() => OBSWidgetGateway))
    private readonly obsWidgetGateway: OBSWidgetGateway,
    private readonly obsSecurityService: OBSSecurityService,
  ) {}

  /**
   * Generate a unique alert token for OBS widget
   */
  private generateAlertToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Generate widget URL with streamer ID for OBS integration
   */
  private generateWidgetUrl(streamerId: string, alertToken: string): string {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return `${baseUrl}/api/widget-public/alert/${streamerId}/${alertToken}`;
  }

  /**
   * Generate widget URL with streamer ID only (for backward compatibility)
   */
  private generateWidgetUrlWithoutToken(streamerId: string): string {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return `${baseUrl}/widget-public/alert/${streamerId}`;
  }

  /**
   * Generate legacy widget URL (for backward compatibility)
   */
  private generateLegacyWidgetUrl(alertToken: string): string {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return `${baseUrl}/widget-public/alert/${alertToken}`;
  }

  /**
   * Create new OBS settings for a streamer
   */
  async create(createOBSSettingsDto: CreateOBSSettingsDto): Promise<OBSSettings> {
    // Check if settings already exist for this streamer
    const existingSettings = await this.obsSettingsModel.findOne({
      streamerId: new Types.ObjectId(createOBSSettingsDto.streamerId),
    });

    if (existingSettings) {
      throw new ConflictException('OBS settings already exist for this streamer');
    }

    // Generate unique alert token
    const alertToken = this.generateAlertToken();

    // Create settings with defaults
    const obsSettings = new this.obsSettingsModel({
      ...createOBSSettingsDto,
      streamerId: new Types.ObjectId(createOBSSettingsDto.streamerId),
      alertToken,
      // Set default values for nested objects if not provided
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

  /**
   * Find OBS settings by streamer ID
   */
  async findByStreamerId(streamerId: string): Promise<OBSSettings> {
    const settings = await this.obsSettingsModel.findOne({
      streamerId: new Types.ObjectId(streamerId),
      isActive: true,
    });

    if (!settings) {
      throw new NotFoundException('OBS settings not found for this streamer');
    }

    return settings;
  }

  /**
   * Find OBS settings by alert token
   */
  async findByAlertToken(alertToken: string): Promise<OBSSettings> {
    const validationResult = await this.obsSecurityService.validateAlertToken(alertToken);
    
    if (!validationResult.isValid) {
      throw new NotFoundException(validationResult.error || 'OBS settings not found for this alert token');
    }

    return validationResult.settings;
  }

  /**
   * Find OBS settings by alert token with security validation
   */
  async findByAlertTokenWithSecurity(
    alertToken: string, 
    clientIp?: string, 
    userAgent?: string,
    signatureData?: any
  ): Promise<OBSSettings> {
    const validationResult = await this.obsSecurityService.validateAlertToken(
      alertToken, 
      clientIp, 
      userAgent, 
      signatureData
    );
    
    if (!validationResult.isValid) {
      throw new NotFoundException(validationResult.error || 'OBS settings not found for this alert token');
    }

    return validationResult.settings;
  }

  /**
   * Update OBS settings for a streamer
   */
  async update(streamerId: string, updateOBSSettingsDto: UpdateOBSSettingsDto): Promise<OBSSettings> {
    const settings = await this.obsSettingsModel.findOne({
      streamerId: new Types.ObjectId(streamerId),
    });

    if (!settings) {
      throw new NotFoundException('OBS settings not found for this streamer');
    }

    // Map frontend customization format to backend schema format
    const mappedUpdateData = this.mapFrontendToBackendFormat(updateOBSSettingsDto, settings);
    
    // Update the settings
    Object.assign(settings, mappedUpdateData);
    
    // Update timestamp
    settings.updatedAt = new Date();

    return settings.save();
  }

  /**
   * Map frontend customization format to backend schema format
   */
  private mapFrontendToBackendFormat(updateData: UpdateOBSSettingsDto, currentSettings: OBSSettings): any {
    const mappedData: any = {};
    
    // Map alertToken if provided and it's a complete token (32+ characters)
    if (updateData.alertToken && updateData.alertToken.length >= 32) {
      mappedData.alertToken = updateData.alertToken;
    } else if (updateData.alertToken && updateData.alertToken.length < 32) {
      console.log(`⚠️ Skipping partial alert token update: ${updateData.alertToken.substring(0, 8)}... (length: ${updateData.alertToken.length})`);
      // Don't update the alertToken if it's incomplete
    }
    // If no alertToken provided, don't update it (keep existing)
    
    // Map customization to individual settings
    if (updateData.customization) {
      const { customization } = updateData;
      
      // Map image customization
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
      
      // Map sound customization
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
      
      // Map text customization
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
        
        // Map animation type to animation settings
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
      
      // Map position
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
      
      // Map duration - convert frontend duration to milliseconds if needed
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
        
        // Convert duration to milliseconds if it's less than 1000 (assuming it's in seconds)
        let durationMs = customization.duration;
        if (customization.duration < 1000) {
          durationMs = customization.duration * 1000;
          console.log(`🔄 Converting duration from ${customization.duration} to ${durationMs}ms`);
        } else {
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

  /**
   * Update a single donation level for a streamer
   */
  async updateDonationLevel(streamerId: string, levelId: string, levelUpdate: any): Promise<OBSSettings> {
    const settings = await this.findByStreamerId(streamerId);
    if (!settings) {
      throw new Error('OBS settings not found for streamer');
    }

    if (!Array.isArray((settings as any).donationLevels)) {
      (settings as any).donationLevels = [];
    }

    const levels: any[] = (settings as any).donationLevels as any[];
    const idx = levels.findIndex((lvl: any) => lvl.levelId === levelId);
    if (idx === -1) {
      throw new Error('Donation level not found');
    }

    const currentLevel = levels[idx] || {};

    // Primitive fields
    if (typeof levelUpdate.levelName === 'string') currentLevel.levelName = levelUpdate.levelName;
    if (typeof levelUpdate.minAmount === 'number') currentLevel.minAmount = levelUpdate.minAmount;
    if (typeof levelUpdate.maxAmount === 'number') currentLevel.maxAmount = levelUpdate.maxAmount;
    if (typeof levelUpdate.currency === 'string') currentLevel.currency = levelUpdate.currency;
    if (typeof levelUpdate.isEnabled === 'boolean') currentLevel.isEnabled = levelUpdate.isEnabled;

    // Support direct configuration overrides
    currentLevel.configuration = {
      ...(currentLevel.configuration || {}),
      ...(levelUpdate.configuration || {}),
    };

    // Support frontend "customization" shape (map to configuration)
    const cz = levelUpdate.customization || {};
    if (cz) {
      const cfg = currentLevel.configuration || {};

      // Image
      if (cz.image) {
        cfg.imageSettings = {
          ...(cfg.imageSettings || {}),
          url: cz.image.url ?? (cfg.imageSettings?.url),
          mediaType: cz.image.type ?? (cfg.imageSettings?.mediaType),
          duration: cz.image.duration ?? (cfg.imageSettings?.duration),
        };
      }

      // Sound
      if (cz.sound) {
        cfg.soundSettings = {
          ...(cfg.soundSettings || {}),
          url: cz.sound.url ?? (cfg.soundSettings?.url),
          volume: cz.sound.volume ?? (cfg.soundSettings?.volume),
          duration: cz.sound.duration ?? (cfg.soundSettings?.duration),
        };
      }

      // Text / style
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

      // Position (store as anchor for levels like base)
      if (typeof cz.position !== 'undefined') {
        cfg.positionSettings = {
          ...(cfg.positionSettings || {}),
          anchor: cz.position,
        };
      }

      // Duration (seconds or ms) → displaySettings.duration (ms)
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
      // Preserve original customization for UI round-trip if present
      currentLevel.customization = { ...(currentLevel.customization || {}), ...cz };
    }

    levels[idx] = currentLevel;
    (settings as any).donationLevels = levels;
    await (settings as any).save();
    return settings;
  }

  /**
   * Delete OBS settings for a streamer
   */
  async delete(streamerId: string): Promise<void> {
    const result = await this.obsSettingsModel.deleteOne({
      streamerId: new Types.ObjectId(streamerId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('OBS settings not found for this streamer');
    }
  }

  /**
   * Toggle OBS settings active status
   */
  async toggleActive(streamerId: string): Promise<OBSSettings> {
    const settings = await this.obsSettingsModel.findOne({
      streamerId: new Types.ObjectId(streamerId),
    });

    if (!settings) {
      throw new NotFoundException('OBS settings not found for this streamer');
    }

    settings.isActive = !settings.isActive;
    settings.updatedAt = new Date();

    return settings.save();
  }

  /**
   * Regenerate alert token for a streamer
   */
  async regenerateAlertToken(streamerId: string): Promise<OBSSettings> {
    const settings = await this.obsSettingsModel.findOne({
      streamerId: new Types.ObjectId(streamerId),
    });

    if (!settings) {
      throw new NotFoundException('OBS settings not found for this streamer');
    }

    // Use security service to regenerate token with enhanced security
    const newToken = await this.obsSecurityService.regenerateAlertTokenWithSecurity(streamerId);
    
    // Return updated settings
    return this.findByStreamerId(streamerId);
  }

  /**
   * Revoke alert token for a streamer
   */
  async revokeAlertToken(streamerId: string, reason?: string): Promise<void> {
    await this.obsSecurityService.revokeAlertToken(streamerId, reason);
  }

  /**
   * Update security settings for a streamer
   */
  async updateSecuritySettings(
    streamerId: string, 
    securitySettings: any
  ): Promise<OBSSettings> {
    await this.obsSecurityService.updateSecuritySettings(streamerId, securitySettings);
    return this.findByStreamerId(streamerId);
  }

  /**
   * Get security audit log for a streamer
   */
  async getSecurityAuditLog(streamerId: string, limit: number = 50): Promise<any[]> {
    return this.obsSecurityService.getSecurityAuditLog(streamerId, limit);
  }

  /**
   * Get security status for a streamer
   */
  async getSecurityStatus(streamerId: string): Promise<any> {
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

  /**
   * Create request signature for secure API calls
   */
  createRequestSignature(timestamp: number, nonce: string, secret: string): string {
    return this.obsSecurityService.createRequestSignature(timestamp, nonce, secret);
  }

  /**
   * Increment total alerts count
   */
  async incrementAlertCount(alertToken: string): Promise<void> {
    await this.obsSettingsModel.updateOne(
      { alertToken },
      { 
        $inc: { totalAlerts: 1 },
        $set: { lastUsedAt: new Date() }
      }
    );
  }

  /**
   * Get all OBS settings (for admin purposes)
   */
  async findAll(): Promise<OBSSettings[]> {
    return this.obsSettingsModel.find().sort({ createdAt: -1 });
  }

  /**
   * Get statistics for OBS settings
   */
  async getStats() {
    const totalSettings = await this.obsSettingsModel.countDocuments();
    const activeSettings = await this.obsSettingsModel.countDocuments({ isActive: true });
    
    // Calculate average alerts per setting (placeholder for now)
    const averageAlertsPerSetting = totalSettings > 0 ? 0 : 0;

    return {
      totalSettings,
      activeSettings,
      totalAlerts: 0, // TODO: Implement alert counting
      averageAlertsPerSetting,
    };
  }

  // Configuration Preset Management
  async savePreset(streamerId: string, presetName: string, description?: string) {
    const settings = await this.findByStreamerId(streamerId);
    
    // Create preset data
    const presetData = {
      streamerId: new Types.ObjectId(streamerId),
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

    // Save to presets collection (you'll need to create this schema)
    // For now, we'll store it in the main settings document
    const presetId = `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update settings with new preset
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

    await (settings as any).save();

    return {
      presetId,
      presetName,
      message: 'Preset saved successfully',
    };
  }

  async getPresets(streamerId: string) {
    const settings = await this.findByStreamerId(streamerId);
    return settings.presets || [];
  }

  async loadPreset(streamerId: string, presetId: string) {
    const settings = await this.findByStreamerId(streamerId);
    
    if (!settings.presets) {
      throw new NotFoundException('No presets found');
    }

    const preset = settings.presets.find(p => p.presetId === presetId);
    if (!preset) {
      throw new NotFoundException('Preset not found');
    }

    // Apply preset configuration
    settings.imageSettings = { ...settings.imageSettings, ...preset.configuration.imageSettings };
    settings.soundSettings = { ...settings.soundSettings, ...preset.configuration.soundSettings };
    settings.animationSettings = { ...settings.animationSettings, ...preset.configuration.animationSettings };
    settings.styleSettings = { ...settings.styleSettings, ...preset.configuration.styleSettings };
    settings.positionSettings = { ...settings.positionSettings, ...preset.configuration.positionSettings };
    settings.displaySettings = { ...settings.displaySettings, ...preset.configuration.displaySettings };
    settings.generalSettings = { ...settings.generalSettings, ...preset.configuration.generalSettings };

    return await (settings as any).save();
  }

  async deletePreset(streamerId: string, presetId: string) {
    const settings = await this.findByStreamerId(streamerId);
    
    if (!settings.presets) {
      throw new NotFoundException('No presets found');
    }

    const presetIndex = settings.presets.findIndex(p => p.presetId === presetId);
    if (presetIndex === -1) {
      throw new NotFoundException('Preset not found');
    }

    settings.presets.splice(presetIndex, 1);
    await (settings as any).save();
  }

  // Configuration Validation
  async validateConfiguration(configuration: CreateOBSSettingsDto) {
    const errors = [];
    const warnings = [];

    // Validate image settings
    if (configuration.imageSettings) {
      if (configuration.imageSettings.width && configuration.imageSettings.width > 1920) {
        errors.push({ field: 'imageSettings.width', message: 'Width cannot exceed 1920px' });
      }
      if (configuration.imageSettings.height && configuration.imageSettings.height > 1080) {
        errors.push({ field: 'imageSettings.height', message: 'Height cannot exceed 1080px' });
      }
    }

    // Validate sound settings
    if (configuration.soundSettings) {
      if (configuration.soundSettings.volume && (configuration.soundSettings.volume < 0 || configuration.soundSettings.volume > 100)) {
        errors.push({ field: 'soundSettings.volume', message: 'Volume must be between 0 and 100' });
      }
    }

    // Validate position settings
    if (configuration.positionSettings) {
      if (configuration.positionSettings.x && (configuration.positionSettings.x < 0 || configuration.positionSettings.x > 1920)) {
        errors.push({ field: 'positionSettings.x', message: 'X position must be between 0 and 1920' });
      }
      if (configuration.positionSettings.y && (configuration.positionSettings.y < 0 || configuration.positionSettings.y > 1080)) {
        errors.push({ field: 'positionSettings.y', message: 'Y position must be between 0 and 1080' });
      }
    }

    // Validate display settings
    if (configuration.displaySettings) {
      if (configuration.displaySettings.duration && (configuration.displaySettings.duration < 1000 || configuration.displaySettings.duration > 30000)) {
        errors.push({ field: 'displaySettings.duration', message: 'Display duration must be between 1000ms and 30000ms' });
      }
    }

    // Add warnings for potential issues
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

  // Configuration Export/Import
  async exportConfiguration(streamerId: string) {
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

  async importConfiguration(streamerId: string, importData: any, overwrite: boolean = false) {
    const settings = await this.findByStreamerId(streamerId);
    
    if (overwrite) {
      // Completely replace settings
      Object.assign(settings, importData);
    } else {
      // Merge settings, keeping existing values for missing fields
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

    return await (settings as any).save();
  }

  // Configuration Testing
  async testConfiguration(configuration: CreateOBSSettingsDto) {
    const testResults = {
      mediaValidation: true,
      animationValidation: true,
      positionValidation: true,
      styleValidation: true,
    };

    // Test media validation
    if (configuration.imageSettings?.url) {
      try {
        // Basic URL validation
        new URL(configuration.imageSettings.url);
      } catch {
        testResults.mediaValidation = false;
      }
    }

    if (configuration.soundSettings?.url) {
      try {
        new URL(configuration.soundSettings.url);
      } catch {
        testResults.mediaValidation = false;
      }
    }

    // Test animation validation
    if (configuration.animationSettings) {
      if (configuration.animationSettings.duration && (configuration.animationSettings.duration < 200 || configuration.animationSettings.duration > 5000)) {
        testResults.animationValidation = false;
      }
    }

    // Test position validation
    if (configuration.positionSettings) {
      if (configuration.positionSettings.x && (configuration.positionSettings.x < 0 || configuration.positionSettings.x > 1920)) {
        testResults.positionValidation = false;
      }
      if (configuration.positionSettings.y && (configuration.positionSettings.y < 0 || configuration.positionSettings.y > 1080)) {
        testResults.positionValidation = false;
      }
    }

    // Test style validation
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

  // Configuration Reset
  async resetToDefaults(streamerId: string) {
    const settings = await this.findByStreamerId(streamerId);
    
    // Reset to default values (same as in create method)
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

    return await (settings as any).save();
  }

  async resetSection(streamerId: string, section: string) {
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
        throw new BadRequestException(`Invalid section: ${section}`);
    }

    return await (settings as any).save();
  }

  // Configuration Templates
  async getTemplates() {
    // Return predefined templates
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

  async applyTemplate(streamerId: string, templateId: string) {
    const settings = await this.findByStreamerId(streamerId);
    
    // Apply template-specific configurations
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
        throw new NotFoundException(`Template ${templateId} not found`);
    }

    return await (settings as any).save();
  }

  // Test Alert Functionality
  async triggerTestAlert(streamerId: string, testAlertDto: TestAlertDto): Promise<TestAlertResponseDto> {
    // Get current OBS settings for the streamer
    const settings = await this.findByStreamerId(streamerId);
    
    // Prepare test alert data - use saved settings if useCurrentSettings is true
    let alertData;
    let alertSettings = null;
    let matchingLevel = null;
    let behavior = 'unknown';
    
    if (testAlertDto.useCurrentSettings) {
      // Parse amount for settings behavior determination
      const testAmount = parseFloat(testAlertDto.amount || '25.00');
      const testCurrency = 'VND'; // Default currency for test alerts
      
      // Get the appropriate settings based on streamer's configuration
      const settingsResult = this.getSettingsForDonation(settings, testAmount, testCurrency);
      alertSettings = settingsResult.settings;
      matchingLevel = settingsResult.level;
      behavior = settingsResult.behavior;
      
      console.log(`🧪 Test alert using settings behavior: ${behavior} for amount ${testAmount} ${testCurrency}`);
      
      // Use determined settings for the test alert
      alertData = {
        donorName: testAlertDto.donorName || 'Test Donor',
        amount: testAlertDto.amount || '25.00',
        message: testAlertDto.message || 'This is a test alert using your saved OBS settings!',
        timestamp: new Date(),
        // Include the determined settings
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
    } else {
      // Use provided test data or defaults
      alertData = {
        donorName: testAlertDto.donorName || 'Test Donor',
        amount: testAlertDto.amount || '25.00',
        message: testAlertDto.message || 'This is a test alert!',
        timestamp: new Date(),
      };
    }

    // Generate unique alert ID
    const alertId = `test_alert_${Date.now()}_${randomBytes(8).toString('hex')}`;

    // Create widget URL using the streamer's alert token
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const widgetUrl = this.generateWidgetUrl(streamerId, settings.alertToken);

    // Send test alert via WebSocket to all connected clients
    this.obsWidgetGateway.sendTestAlert(
      streamerId, 
      alertData.donorName, 
      alertData.amount, 
      alertData.message,
      testAlertDto.useCurrentSettings ? alertSettings : undefined
    );

    // Log the test alert for analytics
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

  // Widget Alert Functionality
  async triggerWidgetAlert(alertToken: string, testAlertDto: TestAlertDto): Promise<TestAlertResponseDto> {
    // Get current OBS settings for the streamer using alert token
    const settings = await this.findByAlertToken(alertToken);
    const streamerId = settings.streamerId.toString();
    
    // Prepare test alert data - use saved settings if useCurrentSettings is true
    let alertData;
    
    if (testAlertDto.useCurrentSettings) {
      // Use saved OBS settings for the test alert, but respect custom alert data
      alertData = {
        donorName: testAlertDto.donorName || 'Test Donor',
        amount: testAlertDto.amount || '25.00',
        message: testAlertDto.message || 'This is a test alert using your saved OBS settings!',
        timestamp: new Date(),
        // Include saved settings for the alert
        imageSettings: settings.imageSettings,
        soundSettings: settings.soundSettings,
        animationSettings: settings.animationSettings,
        styleSettings: settings.styleSettings,
        positionSettings: settings.positionSettings,
        displaySettings: settings.displaySettings,
        generalSettings: settings.generalSettings,
      };
    } else {
      // Use provided test data or defaults
      alertData = {
        donorName: testAlertDto.donorName || 'Test Donor',
        amount: testAlertDto.amount || '25.00',
        message: testAlertDto.message || 'This is a test alert!',
        timestamp: new Date(),
      };
    }

    // Generate unique alert ID
    const alertId = `widget_alert_${Date.now()}_${randomBytes(8).toString('hex')}`;

    // Create widget URL using the streamer's alert token
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const widgetUrl = this.generateWidgetUrl(streamerId, settings.alertToken);

    // Send test alert via WebSocket to all connected OBS widgets
    this.obsWidgetGateway.sendTestAlert(
      streamerId, 
      alertData.donorName, 
      alertData.amount, 
      alertData.message,
      testAlertDto.useCurrentSettings ? {
        imageSettings: settings.imageSettings,
        soundSettings: settings.soundSettings,
        animationSettings: settings.animationSettings,
        styleSettings: settings.styleSettings,
        positionSettings: settings.positionSettings,
        displaySettings: settings.displaySettings,
        generalSettings: settings.generalSettings,
      } : undefined
    );

    // Log the widget alert for analytics
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

  // Donation Alert Functionality
  async triggerDonationAlert(alertToken: string, donationAlertDto: DonationAlertDto): Promise<DonationAlertResponseDto> {
    console.log(`Processing donation alert request for token: ${alertToken.substring(0, 8)}...`);
    
    // Get current OBS settings for the streamer using alert token
    const settings = await this.findByAlertToken(alertToken);
    const streamerId = settings.streamerId.toString();
    
    console.log(`Found OBS settings for streamer: ${streamerId}`);
    
    // Validate donation data
    if (!donationAlertDto.donorName || !donationAlertDto.amount || !donationAlertDto.currency) {
      throw new BadRequestException('Missing required donation fields: donorName, amount, and currency are required');
    }

    // Prepare donation alert data
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

    // Generate unique alert ID
    const alertId = `donation_alert_${Date.now()}_${randomBytes(8).toString('hex')}`;

    // Create widget URL using the streamer's alert token
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const widgetUrl = this.generateWidgetUrl(streamerId, settings.alertToken);

    // Normalize amount (strip currency symbols, spaces, and thousands separators)
    const normalizeAmount = (value: string): number => {
      const cleaned = (value || '').toString().replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleaned);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    // Send donation alert via WebSocket to all connected OBS widgets
    this.obsWidgetGateway.sendDonationAlert(
      streamerId,
      alertData.donorName,
      normalizeAmount(alertData.amount),
      alertData.currency?.toUpperCase?.() || 'VND',
      alertData.message
    );

    console.log(`Sent donation alert via WebSocket to streamer: ${streamerId}`);

    // Get count of connected widgets for this streamer
    const connectedWidgets = this.obsWidgetGateway.getStreamerClientCount(streamerId);

    console.log(`Connected OBS widgets for streamer ${streamerId}: ${connectedWidgets}`);

    // Log the donation alert for analytics
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

  async getTestAlertHistory(streamerId: string, limit: number = 10) {
    // In a real implementation, this would query a test alerts collection
    // For now, return mock data
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

  /**
   * Get widget URL for OBS setup
   */
  async getWidgetUrl(streamerId: string): Promise<{
    widgetUrl: string;
    streamerId: string;
    alertToken: string;
  }> {
    const settings = await this.findByStreamerId(streamerId);
    
    const widgetUrl = this.generateWidgetUrl(streamerId, settings.alertToken);
    
    // Mask the alert token for security (show only first 8 characters)
    const maskedToken = `${settings.alertToken.substring(0, 8)}...`;
    
    return {
      widgetUrl,
      streamerId,
      alertToken: maskedToken
    };
  }

  /**
   * Get full widget URL with alert token for verification purposes
   */
  async getFullWidgetUrl(streamerId: string): Promise<{
    widgetUrl: string;
    streamerId: string;
    alertToken: string;
    fullUrl: string;
  }> {
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

  /**
   * Get widget connection status for OBS setup
   */
  async getWidgetStatus(streamerId: string): Promise<{
    connectedWidgets: number;
    isConnected: boolean;
    lastConnected?: string;
  }> {
    // Verify settings exist for this streamer
    await this.findByStreamerId(streamerId);
    
    const connectedWidgets = this.obsWidgetGateway.getStreamerClientCount(streamerId);
    const isConnected = connectedWidgets > 0;
    
    return {
      connectedWidgets,
      isConnected,
      lastConnected: isConnected ? new Date().toISOString() : undefined
    };
  }

  /**
   * Determine which donation level to use based on donation amount
   */
  determineDonationLevel(settings: OBSSettings, amount: number, currency: string): any | null {
    if (!settings.donationLevels || settings.donationLevels.length === 0) {
      return null; // No donation levels configured, use basic settings
    }

    // Find the appropriate donation level based on amount
    const matchingLevel = settings.donationLevels.find(level => {
      if (!level.isEnabled) return false;
      
      // Convert amount to the same currency for comparison
      const levelMinAmount = level.minAmount;
      const levelMaxAmount = level.maxAmount;
      
      return amount >= levelMinAmount && amount <= levelMaxAmount;
    });

    if (matchingLevel) {
      console.log(`🎯 Found matching donation level: ${matchingLevel.levelName} for amount ${amount} ${currency}`);
      return matchingLevel;
    }

    console.log(`⚠️ No matching donation level found for amount ${amount} ${currency}, using basic settings`);
    return null; // No matching level found, use basic settings
  }

  /**
   * Get the appropriate settings based on the streamer's configuration and donation amount
   */
  getSettingsForDonation(settings: OBSSettings, amount: number, currency: string): {
    settings: any;
    level: any | null;
    behavior: string;
  } {
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
        
        // Find the best matching level (or first available if none match)
        const matchingLevel = this.determineDonationLevel(settings, amount, currency);
        if (matchingLevel) {
          const mergedSettings = this.getMergedSettingsForLevel(settings, matchingLevel, { exclusiveMedia: true });
          console.log(`🎯 Using donation level settings: ${matchingLevel.levelName}`);
          return {
            settings: mergedSettings,
            level: matchingLevel,
            behavior: 'donation-levels'
          };
        } else {
          // Use the first available donation level if no specific match
          const firstLevel = settings.donationLevels.find(level => level.isEnabled);
          if (firstLevel) {
            const mergedSettings = this.getMergedSettingsForLevel(settings, firstLevel, { exclusiveMedia: true });
            console.log(`🎯 Using first available donation level: ${firstLevel.levelName}`);
            return {
              settings: mergedSettings,
              level: firstLevel,
              behavior: 'donation-levels-fallback'
            };
          } else {
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
        // Original behavior: use donation levels if available and matching, otherwise basic
        const autoLevel = this.determineDonationLevel(settings, amount, currency);
        if (autoLevel) {
          const mergedSettings = this.getMergedSettingsForLevel(settings, autoLevel);
          console.log(`🎯 Auto: Using donation level settings: ${autoLevel.levelName}`);
          return {
            settings: mergedSettings,
            level: autoLevel,
            behavior: 'auto-donation-levels'
          };
        } else {
          console.log(`📋 Auto: Using basic settings (no matching donation level)`);
          return {
            settings: settings.toObject(),
            level: null,
            behavior: 'auto-basic'
          };
        }
    }
  }

  /**
   * Get merged settings for a donation level (level settings override basic settings)
   */
  getMergedSettingsForLevel(settings: OBSSettings, level: any, options: { exclusiveMedia?: boolean } = {}): any {
    if (!level) {
      return settings; // Return basic settings if no level provided
    }

    // Support both schema-backed "configuration" and frontend-friendly "customization" shapes
    const configuration = level.configuration || {};
    const customization = level.customization || {};

    // Translate customization to configuration overrides when provided
    const translatedOverrides: any = {
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

    // Merge translated overrides into base settings
    const useExclusiveMedia = options.exclusiveMedia === true;

    const mergedSettings = {
      ...settings.toObject(),
      imageSettings: useExclusiveMedia
        ? {
            // In exclusive mode, do NOT inherit base media; use only level-defined media
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

    // Debug: ensure level media overrides are present
    try {
      console.log('🎥 Level merge debug', {
        levelName: level.levelName,
        imgUrl: (mergedSettings as any).imageSettings?.url,
        imgType: (mergedSettings as any).imageSettings?.mediaType,
        soundUrl: (mergedSettings as any).soundSettings?.url,
        soundVol: (mergedSettings as any).soundSettings?.volume,
      });
    } catch {}

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
} 