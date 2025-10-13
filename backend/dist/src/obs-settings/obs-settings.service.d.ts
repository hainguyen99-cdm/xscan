import { Model } from 'mongoose';
import { OBSSettings, OBSSettingsDocument } from './obs-settings.schema';
import { CreateOBSSettingsDto, UpdateOBSSettingsDto } from './dto';
import { TestAlertDto, TestAlertResponseDto, DonationAlertDto, DonationAlertResponseDto } from './dto/configuration.dto';
import { OBSWidgetGateway } from './obs-widget.gateway';
import { OBSSecurityService } from './obs-security.service';
export declare class OBSSettingsService {
    private obsSettingsModel;
    private readonly obsWidgetGateway;
    private readonly obsSecurityService;
    constructor(obsSettingsModel: Model<OBSSettingsDocument>, obsWidgetGateway: OBSWidgetGateway, obsSecurityService: OBSSecurityService);
    private generateAlertToken;
    private generateWidgetUrl;
    private generateWidgetUrlWithoutToken;
    private generateLegacyWidgetUrl;
    create(createOBSSettingsDto: CreateOBSSettingsDto): Promise<OBSSettings>;
    findByStreamerId(streamerId: string): Promise<OBSSettings>;
    findByAlertToken(alertToken: string): Promise<OBSSettings>;
    findByAlertTokenWithSecurity(alertToken: string, clientIp?: string, userAgent?: string, signatureData?: any): Promise<OBSSettings>;
    update(streamerId: string, updateOBSSettingsDto: UpdateOBSSettingsDto): Promise<OBSSettings>;
    private mapFrontendToBackendFormat;
    private optimizeMediaFiles;
    private analyzeDocumentSize;
    private optimizeEntireDocument;
    private applyAggressiveOptimization;
    private removeLargeMediaFiles;
    private removeAllMediaFiles;
    private optimizeImageSettings;
    private optimizeSoundSettings;
    updateDonationLevel(streamerId: string, levelId: string, levelUpdate: any): Promise<OBSSettings>;
    delete(streamerId: string): Promise<void>;
    toggleActive(streamerId: string): Promise<OBSSettings>;
    regenerateAlertToken(streamerId: string): Promise<OBSSettings>;
    revokeAlertToken(streamerId: string, reason?: string): Promise<void>;
    updateSecuritySettings(streamerId: string, securitySettings: any): Promise<OBSSettings>;
    getSecurityAuditLog(streamerId: string, limit?: number): Promise<any[]>;
    getSecurityStatus(streamerId: string): Promise<any>;
    createRequestSignature(timestamp: number, nonce: string, secret: string): string;
    incrementAlertCount(alertToken: string): Promise<void>;
    findAll(): Promise<OBSSettings[]>;
    getStats(): Promise<{
        totalSettings: number;
        activeSettings: number;
        totalAlerts: number;
        averageAlertsPerSetting: number;
    }>;
    savePreset(streamerId: string, presetName: string, description?: string): Promise<{
        presetId: string;
        presetName: string;
        message: string;
    }>;
    getPresets(streamerId: string): Promise<{
        presetId: string;
        presetName: string;
        description?: string;
        configuration: {
            imageSettings?: any;
            soundSettings?: any;
            animationSettings?: any;
            styleSettings?: any;
            positionSettings?: any;
            displaySettings?: any;
            generalSettings?: any;
        };
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    loadPreset(streamerId: string, presetId: string): Promise<any>;
    deletePreset(streamerId: string, presetId: string): Promise<void>;
    validateConfiguration(configuration: CreateOBSSettingsDto): Promise<{
        isValid: boolean;
        errors: any[];
        warnings: any[];
    }>;
    exportConfiguration(streamerId: string): Promise<{
        exportData: {
            imageSettings: {
                enabled: boolean;
                url?: string;
                mediaType: "image" | "gif" | "video";
                width: number;
                height: number;
                borderRadius: number;
                shadow: boolean;
                shadowColor: string;
                shadowBlur: number;
                shadowOffsetX: number;
                shadowOffsetY: number;
            };
            soundSettings: {
                enabled: boolean;
                url?: string;
                volume: number;
                fadeIn: number;
                fadeOut: number;
                loop: boolean;
            };
            animationSettings: {
                enabled: boolean;
                animationType: "fade" | "slide" | "bounce" | "zoom" | "none";
                duration: number;
                easing: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear";
                direction: "left" | "right" | "top" | "bottom";
                bounceIntensity: number;
                zoomScale: number;
            };
            styleSettings: {
                backgroundColor: string;
                textColor: string;
                accentColor: string;
                borderColor: string;
                borderWidth: number;
                borderStyle: "solid" | "dashed" | "dotted" | "none";
                fontFamily: string;
                fontSize: number;
                fontWeight: string;
                fontStyle: "normal" | "italic";
                textShadow: boolean;
                textShadowColor: string;
                textShadowBlur: number;
                textShadowOffsetX: number;
                textShadowOffsetY: number;
            };
            positionSettings: {
                x: number;
                y: number;
                anchor: "top-left" | "top-center" | "top-right" | "middle-left" | "middle-center" | "middle-right" | "bottom-left" | "bottom-center" | "bottom-right";
                zIndex: number;
                responsive: boolean;
                mobileScale: number;
            };
            displaySettings: {
                duration: number;
                fadeInDuration: number;
                fadeOutDuration: number;
                autoHide: boolean;
                showProgress: boolean;
                progressColor: string;
                progressHeight: number;
            };
            generalSettings: {
                enabled: boolean;
                maxAlerts: number;
                alertSpacing: number;
                cooldown: number;
                priority: "low" | "medium" | "high" | "urgent";
            };
        };
        exportDate: string;
        version: string;
    }>;
    importConfiguration(streamerId: string, importData: any, overwrite?: boolean): Promise<any>;
    testConfiguration(configuration: CreateOBSSettingsDto): Promise<{
        success: boolean;
        testResults: {
            mediaValidation: boolean;
            animationValidation: boolean;
            positionValidation: boolean;
            styleValidation: boolean;
        };
        message: string;
    }>;
    resetToDefaults(streamerId: string): Promise<any>;
    resetSection(streamerId: string, section: string): Promise<any>;
    getTemplates(): Promise<{
        templateId: string;
        name: string;
        description: string;
        category: string;
        preview: string;
    }[]>;
    applyTemplate(streamerId: string, templateId: string): Promise<any>;
    triggerTestAlert(streamerId: string, testAlertDto: TestAlertDto): Promise<TestAlertResponseDto>;
    triggerWidgetAlert(alertToken: string, testAlertDto: TestAlertDto): Promise<TestAlertResponseDto>;
    triggerDonationAlert(alertToken: string, donationAlertDto: DonationAlertDto): Promise<DonationAlertResponseDto>;
    getTestAlertHistory(streamerId: string, limit?: number): Promise<{
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
    getWidgetUrl(streamerId: string): Promise<{
        widgetUrl: string;
        streamerId: string;
        alertToken: string;
    }>;
    getFullWidgetUrl(streamerId: string): Promise<{
        widgetUrl: string;
        streamerId: string;
        alertToken: string;
        fullUrl: string;
    }>;
    getWidgetStatus(streamerId: string): Promise<{
        connectedWidgets: number;
        isConnected: boolean;
        lastConnected?: string;
    }>;
    determineDonationLevel(settings: OBSSettings, amount: number, currency: string): any | null;
    getSettingsForDonation(settings: OBSSettings, amount: number, currency: string): {
        settings: any;
        level: any | null;
        behavior: string;
    };
    getMergedSettingsForLevel(settings: OBSSettings, level: any, options?: {
        exclusiveMedia?: boolean;
    }): any;
}
