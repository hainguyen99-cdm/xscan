export declare class PresetDto {
    presetId: string;
    presetName: string;
    description?: string;
    configuration: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SavePresetDto {
    presetName: string;
    description?: string;
}
export declare class ValidationErrorDto {
    field: string;
    message: string;
}
export declare class ValidationWarningDto {
    field: string;
    message: string;
}
export declare class ConfigurationValidationDto {
    isValid: boolean;
    errors: ValidationErrorDto[];
    warnings: ValidationWarningDto[];
}
export declare class ExportConfigurationDto {
    exportData: any;
    exportDate: string;
    version: string;
}
export declare class ImportConfigurationDto {
    importData: any;
    overwrite?: boolean;
}
export declare class TestResultDto {
    success: boolean;
    testResults: {
        mediaValidation: boolean;
        animationValidation: boolean;
        positionValidation: boolean;
        styleValidation: boolean;
    };
    message: string;
}
export declare class ResetSectionDto {
    section: 'image' | 'sound' | 'animation' | 'style' | 'position' | 'display' | 'general';
}
export declare class TemplateDto {
    templateId: string;
    name: string;
    description: string;
    category: string;
    preview: string;
}
export declare class TestAlertDto {
    donorName?: string;
    amount?: string;
    message?: string;
    useCurrentSettings?: boolean;
    testConfiguration?: any;
}
export declare class TestAlertResponseDto {
    success: boolean;
    alertId: string;
    streamerId: string;
    alertData: {
        donorName: string;
        amount: string;
        message: string;
        timestamp: Date;
    };
    widgetUrl: string;
    message: string;
}
export declare class DonationAlertDto {
    donorName: string;
    amount: string;
    currency: string;
    message?: string;
    donationId: string;
    paymentMethod: string;
    transactionId?: string;
    isAnonymous?: boolean;
    metadata?: Record<string, any>;
}
export declare class DonationAlertResponseDto {
    success: boolean;
    alertId: string;
    streamerId: string;
    alertData: {
        donorName: string;
        amount: string;
        currency: string;
        message?: string;
        donationId: string;
        paymentMethod: string;
        isAnonymous: boolean;
        timestamp: Date;
    };
    widgetUrl: string;
    message: string;
    connectedWidgets: number;
}
