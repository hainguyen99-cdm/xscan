export declare enum SecurityViolationType {
    INVALID_TOKEN = "invalid_token",
    IP_BLOCKED = "ip_blocked",
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
    REPLAY_ATTACK = "replay_attack",
    SIGNATURE_MISMATCH = "signature_mismatch"
}
export declare class SecurityViolationDto {
    type: SecurityViolationType;
    ip?: string;
    userAgent?: string;
    details?: string;
    timestamp: string;
}
export declare class SecuritySettingsDto {
    tokenExpiresAt?: string;
    allowedIPs?: string[];
    maxConnections?: number;
    requireIPValidation?: boolean;
    requireRequestSigning?: boolean;
}
export declare class UpdateSecuritySettingsDto {
    securitySettings?: SecuritySettingsDto;
}
export declare class RevokeTokenDto {
    reason?: string;
}
export declare class SecurityAuditResponseDto {
    streamerId: string;
    violations: SecurityViolationDto[];
    totalViolations: number;
    lastSecurityAudit: string;
}
export declare class RequestSignatureDto {
    timestamp: number;
    nonce: string;
    signature: string;
}
export declare class SecurityStatusDto {
    streamerId: string;
    isTokenActive: boolean;
    isTokenRevoked: boolean;
    revocationReason?: string;
    revokedAt?: string;
    tokenExpiresAt?: string;
    requireIPValidation: boolean;
    requireRequestSigning: boolean;
    maxConnections: number;
    allowedIPs: string[];
    totalViolations: number;
    lastSecurityAudit: string;
}
