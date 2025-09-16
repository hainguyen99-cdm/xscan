import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OBSSettings, OBSSettingsDocument } from './obs-settings.schema';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

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

@Injectable()
export class OBSSecurityService {
  private readonly logger = new Logger(OBSSecurityService.name);
  private readonly requestCache = new Map<string, { timestamp: number; count: number }>();
  private readonly replayAttackCache = new Map<string, Set<string>>();

  constructor(
    @InjectModel(OBSSettings.name)
    private obsSettingsModel: Model<OBSSettingsDocument>,
  ) {}

  /**
   * Validate alert token with comprehensive security checks
   */
  async validateAlertToken(
    alertToken: string, 
    clientIp?: string, 
    userAgent?: string,
    signatureData?: RequestSignatureData
  ): Promise<TokenValidationResult> {
    try {
      // Basic token format validation
      if (!this.isValidTokenFormat(alertToken)) {
        await this.logSecurityViolation(alertToken, 'invalid_token', clientIp, userAgent, 'Invalid token format');
        return { isValid: false, error: 'Invalid token format' };
      }

      // Find settings by token
      const settings = await this.obsSettingsModel.findOne({
        alertToken,
        isActive: true,
      });

      if (!settings) {
        await this.logSecurityViolation(alertToken, 'invalid_token', clientIp, userAgent, 'Token not found or inactive');
        return { isValid: false, error: 'Invalid or inactive token' };
      }

      // Check if token is revoked
      if (settings.securitySettings?.isTokenRevoked) {
        await this.logSecurityViolation(alertToken, 'invalid_token', clientIp, userAgent, 'Token has been revoked');
        return { isValid: false, error: 'Token has been revoked' };
      }

      // Check token expiration
      if (settings.securitySettings?.tokenExpiresAt && new Date() > settings.securitySettings.tokenExpiresAt) {
        await this.logSecurityViolation(alertToken, 'invalid_token', clientIp, userAgent, 'Token has expired');
        return { isValid: false, error: 'Token has expired' };
      }

      // IP validation if enabled
      if (settings.securitySettings?.requireIPValidation && clientIp) {
        if (!this.isIPAllowed(clientIp, settings.securitySettings.allowedIPs)) {
          await this.logSecurityViolation(alertToken, 'ip_blocked', clientIp, userAgent, 'IP not in allowed list');
          return { isValid: false, error: 'IP address not authorized' };
        }
      }

      // Request signing validation if enabled
      if (settings.securitySettings?.requireRequestSigning && signatureData) {
        if (!this.validateRequestSignature(signatureData, settings.securitySettings.requestSignatureSecret)) {
          await this.logSecurityViolation(alertToken, 'signature_mismatch', clientIp, userAgent, 'Invalid request signature');
          return { isValid: false, error: 'Invalid request signature' };
        }
      }

      // Check for replay attacks
      if (signatureData && this.isReplayAttack(alertToken, signatureData.nonce)) {
        await this.logSecurityViolation(alertToken, 'replay_attack', clientIp, userAgent, 'Replay attack detected');
        return { isValid: false, error: 'Replay attack detected' };
      }

      // Rate limiting check
      if (clientIp && await this.isRateLimited(alertToken, clientIp)) {
        await this.logSecurityViolation(alertToken, 'rate_limit_exceeded', clientIp, userAgent, 'Rate limit exceeded');
        return { isValid: false, error: 'Rate limit exceeded' };
      }

      return {
        isValid: true,
        streamerId: settings.streamerId.toString(),
        settings: settings.toObject(),
      };

    } catch (error) {
      this.logger.error(`Error validating alert token: ${error.message}`, error.stack);
      return { isValid: false, error: 'Internal validation error' };
    }
  }

  /**
   * Check if token format is valid
   */
  private isValidTokenFormat(token: string): boolean {
    return /^[a-f0-9]{64}$/.test(token);
  }

  /**
   * Check if IP is in allowed list
   */
  private isIPAllowed(clientIp: string, allowedIPs?: string[]): boolean {
    if (!allowedIPs || allowedIPs.length === 0) {
      return true; // No restrictions
    }

    return allowedIPs.some(allowedIP => {
      // Support for CIDR notation
      if (allowedIP.includes('/')) {
        return this.isIPInCIDR(clientIp, allowedIP);
      }
      return clientIp === allowedIP;
    });
  }

  /**
   * Check if IP is in CIDR range
   */
  private isIPInCIDR(ip: string, cidr: string): boolean {
    try {
      const [network, bits] = cidr.split('/');
      const mask = ~((1 << (32 - parseInt(bits))) - 1);
      const ipNum = this.ipToNumber(ip);
      const networkNum = this.ipToNumber(network);
      return (ipNum & mask) === (networkNum & mask);
    } catch {
      return false;
    }
  }

  /**
   * Convert IP to number for CIDR comparison
   */
  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  /**
   * Validate request signature
   */
  private validateRequestSignature(
    signatureData: RequestSignatureData, 
    secret?: string
  ): boolean {
    if (!secret) {
      return false;
    }

    // Check timestamp (prevent replay attacks)
    const now = Date.now();
    const timeDiff = Math.abs(now - signatureData.timestamp);
    if (timeDiff > 300000) { // 5 minutes
      return false;
    }

    // Recreate signature
    const expectedSignature = this.createRequestSignature(
      signatureData.timestamp,
      signatureData.nonce,
      secret
    );

    // Use timing-safe comparison
    return timingSafeEqual(
      Buffer.from(signatureData.signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Create request signature
   */
  createRequestSignature(timestamp: number, nonce: string, secret: string): string {
    const data = `${timestamp}:${nonce}`;
    return createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Check for replay attacks
   */
  private isReplayAttack(alertToken: string, nonce: string): boolean {
    const cacheKey = `replay:${alertToken}`;
    const nonces = this.replayAttackCache.get(cacheKey) || new Set();
    
    if (nonces.has(nonce)) {
      return true;
    }

    // Add nonce to cache
    nonces.add(nonce);
    this.replayAttackCache.set(cacheKey, nonces);

    // Clean up old nonces (older than 1 hour)
    setTimeout(() => {
      const currentNonces = this.replayAttackCache.get(cacheKey);
      if (currentNonces) {
        currentNonces.delete(nonce);
        if (currentNonces.size === 0) {
          this.replayAttackCache.delete(cacheKey);
        }
      }
    }, 3600000); // 1 hour

    return false;
  }

  /**
   * Check rate limiting
   */
  private async isRateLimited(alertToken: string, clientIp: string): Promise<boolean> {
    const cacheKey = `rate_limit:${alertToken}:${clientIp}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 10; // 10 requests per minute

    const cached = this.requestCache.get(cacheKey);
    
    if (!cached || (now - cached.timestamp) > windowMs) {
      this.requestCache.set(cacheKey, { timestamp: now, count: 1 });
      return false;
    }

    if (cached.count >= maxRequests) {
      return true;
    }

    cached.count++;
    return false;
  }

  /**
   * Log security violation
   */
  async logSecurityViolation(
    alertToken: string,
    type: SecurityViolation['type'],
    ip?: string,
    userAgent?: string,
    details?: string
  ): Promise<void> {
    try {
      const violation: SecurityViolation = {
        type,
        ip,
        userAgent,
        details,
      };

      await this.obsSettingsModel.updateOne(
        { alertToken },
        {
          $push: {
            'securitySettings.securityViolations': {
              ...violation,
              timestamp: new Date(),
            },
          },
          $set: {
            'securitySettings.lastSecurityAudit': new Date(),
          },
        }
      );

      this.logger.warn(`Security violation logged: ${type} for token ${alertToken.substring(0, 8)}...`, {
        alertToken: alertToken.substring(0, 8) + '...',
        type,
        ip,
        userAgent,
        details,
      });
    } catch (error) {
      this.logger.error(`Error logging security violation: ${error.message}`);
    }
  }

  /**
   * Revoke alert token
   */
  async revokeAlertToken(
    streamerId: string, 
    reason: string = 'Manual revocation'
  ): Promise<void> {
    await this.obsSettingsModel.updateOne(
      { streamerId: new Types.ObjectId(streamerId) },
      {
        $set: {
          'securitySettings.isTokenRevoked': true,
          'securitySettings.revokedAt': new Date(),
          'securitySettings.revocationReason': reason,
        },
      }
    );

    this.logger.log(`Alert token revoked for streamer ${streamerId}: ${reason}`);
  }

  /**
   * Regenerate alert token with security enhancements
   */
  async regenerateAlertTokenWithSecurity(streamerId: string): Promise<string> {
    const newToken = randomBytes(32).toString('hex');
    const newSignatureSecret = randomBytes(32).toString('hex');

    await this.obsSettingsModel.updateOne(
      { streamerId: new Types.ObjectId(streamerId) },
      {
        $set: {
          alertToken: newToken,
          'securitySettings.lastTokenRegeneration': new Date(),
          'securitySettings.requestSignatureSecret': newSignatureSecret,
          'securitySettings.isTokenRevoked': false,
          'securitySettings.revokedAt': null,
          'securitySettings.revocationReason': null,
        },
      }
    );

    this.logger.log(`Alert token regenerated for streamer ${streamerId}`);
    return newToken;
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(
    streamerId: string,
    securitySettings: Partial<OBSSettings['securitySettings']>
  ): Promise<void> {
    await this.obsSettingsModel.updateOne(
      { streamerId: new Types.ObjectId(streamerId) },
      {
        $set: {
          'securitySettings': {
            ...securitySettings,
            lastSecurityAudit: new Date(),
          },
        },
      }
    );

    this.logger.log(`Security settings updated for streamer ${streamerId}`);
  }

  /**
   * Get security audit log
   */
  async getSecurityAuditLog(streamerId: string, limit: number = 50): Promise<SecurityViolation[]> {
    const settings = await this.obsSettingsModel.findOne(
      { streamerId: new Types.ObjectId(streamerId) },
      { 'securitySettings.securityViolations': 1 }
    );

    if (!settings?.securitySettings?.securityViolations) {
      return [];
    }

    return settings.securitySettings.securityViolations
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Clean up old security violations
   */
  async cleanupOldSecurityViolations(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await this.obsSettingsModel.updateMany(
      {},
      {
        $pull: {
          'securitySettings.securityViolations': {
            timestamp: { $lt: cutoffDate },
          },
        },
      }
    );

    this.logger.log(`Cleaned up security violations older than ${daysOld} days`);
  }
} 