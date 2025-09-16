import { Document, Types } from 'mongoose';
export type OBSSettingsDocument = OBSSettings & Document;
export declare class OBSSettings {
    streamerId: Types.ObjectId;
    alertToken: string;
    securitySettings: {
        tokenExpiresAt?: Date;
        lastTokenRegeneration?: Date;
        allowedIPs?: string[];
        maxConnections: number;
        requireIPValidation: boolean;
        requireRequestSigning: boolean;
        requestSignatureSecret?: string;
        lastSecurityAudit?: Date;
        securityViolations?: Array<{
            type: 'invalid_token' | 'ip_blocked' | 'rate_limit_exceeded' | 'replay_attack' | 'signature_mismatch';
            timestamp: Date;
            ip?: string;
            userAgent?: string;
            details?: string;
        }>;
        isTokenRevoked: boolean;
        revokedAt?: Date;
        revocationReason?: string;
    };
    imageSettings: {
        enabled: boolean;
        url?: string;
        mediaType: 'image' | 'gif' | 'video';
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
        animationType: 'fade' | 'slide' | 'bounce' | 'zoom' | 'none';
        duration: number;
        easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
        direction: 'left' | 'right' | 'top' | 'bottom';
        bounceIntensity: number;
        zoomScale: number;
    };
    styleSettings: {
        backgroundColor: string;
        textColor: string;
        accentColor: string;
        borderColor: string;
        borderWidth: number;
        borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
        fontFamily: string;
        fontSize: number;
        fontWeight: string;
        fontStyle: 'normal' | 'italic';
        textShadow: boolean;
        textShadowColor: string;
        textShadowBlur: number;
        textShadowOffsetX: number;
        textShadowOffsetY: number;
    };
    positionSettings: {
        x: number;
        y: number;
        anchor: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
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
        priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    isActive: boolean;
    lastUsedAt?: Date;
    totalAlerts: number;
    presets: Array<{
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
    }>;
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    toObject(): any;
}
export declare const OBSSettingsSchema: import("mongoose").Schema<OBSSettings, import("mongoose").Model<OBSSettings, any, any, any, Document<unknown, any, OBSSettings, any, {}> & OBSSettings & Required<{
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OBSSettings, Document<unknown, {}, import("mongoose").FlatRecord<OBSSettings>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<OBSSettings> & Required<{
    _id: string;
}> & {
    __v: number;
}>;
