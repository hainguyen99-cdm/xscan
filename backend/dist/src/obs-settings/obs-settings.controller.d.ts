import { OBSSettingsService } from './obs-settings.service';
import { OBSWidgetGateway } from './obs-widget.gateway';
import { CreateOBSSettingsDto, UpdateOBSSettingsDto, OBSSettingsResponseDto, WidgetUrlResponseDto, WidgetConnectionStatusDto, FullWidgetUrlResponseDto, TokenVerificationResponseDto, TokenRenderResponseDto } from './dto';
import { MediaUploadService } from '../common/services/media-upload.service';
import { TestAlertDto, TestAlertResponseDto, DonationAlertDto, DonationAlertResponseDto } from './dto/configuration.dto';
import { SavePresetDto, PresetDto, ConfigurationValidationDto, ExportConfigurationDto, ImportConfigurationDto, TestResultDto, ResetSectionDto, TemplateDto } from './dto/configuration.dto';
import { RevokeTokenDto, UpdateSecuritySettingsDto, SecurityStatusDto, SecurityAuditResponseDto } from './dto/security.dto';
export declare class OBSSettingsController {
    private readonly obsSettingsService;
    private readonly mediaUploadService;
    private readonly obsWidgetGateway;
    constructor(obsSettingsService: OBSSettingsService, mediaUploadService: MediaUploadService, obsWidgetGateway: OBSWidgetGateway);
    create(createOBSSettingsDto: CreateOBSSettingsDto, req: any): Promise<OBSSettingsResponseDto>;
    getMySettings(req: any): Promise<OBSSettingsResponseDto>;
    getByStreamerId(streamerId: string): Promise<OBSSettingsResponseDto>;
    getByAlertToken(alertToken: string): Promise<OBSSettingsResponseDto>;
    getWidgetUrl(streamerId: string, req: any): Promise<WidgetUrlResponseDto>;
    getWidgetStatus(streamerId: string, req: any): Promise<WidgetConnectionStatusDto>;
    getFullWidgetUrl(streamerId: string, req: any): Promise<FullWidgetUrlResponseDto>;
    verifyAlertToken(streamerId: string, alertToken: string): Promise<TokenVerificationResponseDto>;
    renderAlertToken(streamerId: string): Promise<TokenRenderResponseDto>;
    getMyWidgetUrl(req: any): Promise<WidgetUrlResponseDto>;
    getMyWidgetStatus(req: any): Promise<WidgetConnectionStatusDto>;
    regenerateMyWidgetUrl(req: any): Promise<WidgetUrlResponseDto>;
    testMyWidgetConnection(req: any): Promise<{
        success: boolean;
        message: string;
        connectedWidgets: number;
        testAlertSent: boolean;
    }>;
    regenerateWidgetUrl(streamerId: string, req: any): Promise<WidgetUrlResponseDto>;
    testWidgetConnection(streamerId: string, req: any): Promise<{
        success: boolean;
        message: string;
        connectedWidgets: number;
        testAlertSent: boolean;
    }>;
    updateMySettings(updateOBSSettingsDto: UpdateOBSSettingsDto, req: any): Promise<OBSSettingsResponseDto>;
    updateByStreamerId(streamerId: string, updateOBSSettingsDto: UpdateOBSSettingsDto): Promise<OBSSettingsResponseDto>;
    deleteMySettings(req: any): Promise<void>;
    deleteByStreamerId(streamerId: string): Promise<void>;
    toggleMySettingsActive(req: any): Promise<OBSSettingsResponseDto>;
    toggleActiveByStreamerId(streamerId: string): Promise<OBSSettingsResponseDto>;
    regenerateMyAlertToken(req: any): Promise<OBSSettingsResponseDto>;
    regenerateAlertTokenByStreamerId(streamerId: string): Promise<OBSSettingsResponseDto>;
    findAll(): Promise<OBSSettingsResponseDto[]>;
    getStats(): Promise<{
        totalSettings: number;
        activeSettings: number;
        totalAlerts: number;
        averageAlertsPerSetting: number;
    }>;
    uploadMediaForMySettings(req: any, file: Express.Multer.File, mediaType: string, settingsType: string): Promise<OBSSettingsResponseDto>;
    uploadMediaForStreamer(streamerId: string, file: Express.Multer.File, mediaType: string, settingsType: string): Promise<OBSSettingsResponseDto>;
    removeMediaFromMySettings(req: any, settingsType: string): Promise<OBSSettingsResponseDto>;
    removeMediaFromStreamer(streamerId: string, settingsType: string): Promise<OBSSettingsResponseDto>;
    savePreset(req: any, savePresetDto: SavePresetDto): Promise<{
        presetId: string;
        presetName: string;
        message: string;
    }>;
    getPresets(req: any): Promise<PresetDto[]>;
    loadPreset(req: any, presetId: string): Promise<OBSSettingsResponseDto>;
    deletePreset(req: any, presetId: string): Promise<void>;
    validateConfiguration(req: any, configuration: CreateOBSSettingsDto): Promise<ConfigurationValidationDto>;
    exportConfiguration(req: any): Promise<ExportConfigurationDto>;
    importConfiguration(req: any, importConfigurationDto: ImportConfigurationDto): Promise<OBSSettingsResponseDto>;
    testConfiguration(req: any, configuration: CreateOBSSettingsDto): Promise<TestResultDto>;
    resetToDefaults(req: any): Promise<OBSSettingsResponseDto>;
    resetSection(req: any, resetSectionDto: ResetSectionDto): Promise<OBSSettingsResponseDto>;
    getTemplates(): Promise<TemplateDto[]>;
    applyTemplate(req: any, templateId: string): Promise<OBSSettingsResponseDto>;
    triggerTestAlert(req: any, testAlertDto: TestAlertDto): Promise<TestAlertResponseDto>;
    getTestAlertHistory(req: any, limit?: string): Promise<{
        streamerId: string;
        testAlerts: {
            alertId: string;
            donorName: string;
            amount: string;
            message: string;
            timestamp: Date;
            success: boolean;
        }[];
        total: number;
    }>;
    triggerTestAlertForStreamer(streamerId: string, testAlertDto: TestAlertDto): Promise<TestAlertResponseDto>;
    triggerWidgetAlert(alertToken: string, testAlertDto: TestAlertDto): Promise<TestAlertResponseDto>;
    triggerDonationAlert(alertToken: string, donationAlertDto: DonationAlertDto, req: any): Promise<DonationAlertResponseDto>;
    sendTestAlertPublic(alertToken: string, testData: {
        donorName: string;
        amount: string;
        message: string;
        useCurrentSettings?: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        streamerId: string;
        alertId: string;
        useCurrentSettings: boolean;
    }>;
    private getClientIp;
    private checkRateLimit;
    revokeAlertToken(revokeTokenDto: RevokeTokenDto, req: any): Promise<{
        message: string;
    }>;
    regenerateAlertTokenWithSecurity(req: any): Promise<OBSSettingsResponseDto>;
    updateSecuritySettings(updateSecuritySettingsDto: UpdateSecuritySettingsDto, req: any): Promise<OBSSettingsResponseDto>;
    getSecurityStatus(req: any): Promise<SecurityStatusDto>;
    getSecurityAuditLog(req: any, limit?: string): Promise<SecurityAuditResponseDto>;
    validateAlertToken(body: {
        alertToken: string;
        clientIp?: string;
        userAgent?: string;
        signatureData?: any;
    }): Promise<{
        isValid: boolean;
        streamerId?: string;
        error?: string;
    }>;
    createRequestSignature(body: {
        timestamp: number;
        nonce: string;
    }, req: any): Promise<{
        signature: string;
    }>;
}
