import { Model } from 'mongoose';
import { OBSSettings, OBSSettingsDocument } from './obs-settings.schema';
export interface SecurityViolation {
    type: 'invalid_token' | 'ip_blocked' | 'rate_limit_exceeded' | 'replay_attack' | 'signature_mismatch';
    ip?: string;
    userAgent?: string;
    details?: string;
}
export interface TokenValidationResult {
    isValid: boolean;
    streamerId?: string;
    settings?: OBSSettings;
    error?: string;
}
export interface RequestSignatureData {
    timestamp: number;
    nonce: string;
    signature: string;
}
export declare class OBSSecurityService {
    private obsSettingsModel;
    private readonly logger;
    private readonly requestCache;
    private readonly replayAttackCache;
    constructor(obsSettingsModel: Model<OBSSettingsDocument>);
    validateAlertToken(alertToken: string, clientIp?: string, userAgent?: string, signatureData?: RequestSignatureData): Promise<TokenValidationResult>;
    private isValidTokenFormat;
    private isIPAllowed;
    private isIPInCIDR;
    private ipToNumber;
    private validateRequestSignature;
    createRequestSignature(timestamp: number, nonce: string, secret: string): string;
    private isReplayAttack;
    private isRateLimited;
    logSecurityViolation(alertToken: string, type: SecurityViolation['type'], ip?: string, userAgent?: string, details?: string): Promise<void>;
    revokeAlertToken(streamerId: string, reason?: string): Promise<void>;
    regenerateAlertTokenWithSecurity(streamerId: string): Promise<string>;
    updateSecuritySettings(streamerId: string, securitySettings: Partial<OBSSettings['securitySettings']>): Promise<void>;
    getSecurityAuditLog(streamerId: string, limit?: number): Promise<SecurityViolation[]>;
    cleanupOldSecurityViolations(daysOld?: number): Promise<void>;
}
