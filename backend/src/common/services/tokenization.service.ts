import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

export interface TokenizedData {
  token: string;
  expiresAt: Date;
  data: any;
}

export interface WidgetToken {
  token: string;
  streamerId: string;
  expiresAt: Date;
  permissions: string[];
  metadata: Record<string, any>;
}

@Injectable()
export class TokenizationService {
  private readonly logger = new Logger(TokenizationService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generate a secure encryption key
   */
  private generateKey(): Buffer {
    return crypto.randomBytes(this.keyLength);
  }

  /**
   * Generate a secure initialization vector
   */
  private generateIV(): Buffer {
    return crypto.randomBytes(this.ivLength);
  }

  /**
   * Encrypt sensitive data
   */
  async encryptData(data: any, secretKey?: string): Promise<string> {
    try {
      const key = secretKey ? Buffer.from(secretKey, 'hex') : this.generateKey();
      const iv = this.generateIV();
      const cipher = crypto.createCipher(this.algorithm, key);
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine IV, encrypted data, and auth tag
      const result = {
        iv: iv.toString('hex'),
        encrypted: encrypted,
        tag: tag.toString('hex'),
        key: key.toString('hex')
      };
      
      return Buffer.from(JSON.stringify(result)).toString('base64');
    } catch (error) {
      this.logger.error('Error encrypting data:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decryptData(encryptedData: string): Promise<any> {
    try {
      const data = JSON.parse(Buffer.from(encryptedData, 'base64').toString());
      const key = Buffer.from(data.key, 'hex');
      const iv = Buffer.from(data.iv, 'hex');
      const tag = Buffer.from(data.tag, 'hex');
      
      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      this.logger.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Create a secure widget token for OBS integration
   */
  async createWidgetToken(
    streamerId: string,
    permissions: string[] = ['read'],
    metadata: Record<string, any> = {},
    expiresIn: number = 24 * 60 * 60 // 24 hours
  ): Promise<WidgetToken> {
    try {
      const payload = {
        streamerId,
        permissions,
        metadata,
        type: 'widget',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn
      };

      const secret = this.configService.jwtSecret || 'fallback-secret-change-in-production';
      const token = jwt.sign(payload, secret, {
        algorithm: 'HS256',
        expiresIn
      });

      return {
        token,
        streamerId,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        permissions,
        metadata
      };
    } catch (error) {
      this.logger.error('Error creating widget token:', error);
      throw new Error('Failed to create widget token');
    }
  }

  /**
   * Validate a widget token
   */
  async validateWidgetToken(token: string): Promise<WidgetToken | null> {
    try {
      const secret = this.configService.jwtSecret || 'fallback-secret-change-in-production';
      const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as any;
      
      if (decoded.type !== 'widget') {
        throw new Error('Invalid token type');
      }

      return {
        token,
        streamerId: decoded.streamerId,
        expiresAt: new Date(decoded.exp * 1000),
        permissions: decoded.permissions || [],
        metadata: decoded.metadata || {}
      };
    } catch (error) {
      this.logger.error('Error validating widget token:', error);
      return null;
    }
  }

  /**
   * Create a secure donation link token
   */
  async createDonationLinkToken(
    streamerId: string,
    amount?: number,
    message?: string,
    expiresIn: number = 7 * 24 * 60 * 60 // 7 days
  ): Promise<string> {
    try {
      const payload = {
        streamerId,
        amount,
        message,
        type: 'donation_link',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn
      };

      const secret = this.configService.jwtSecret || 'fallback-secret-change-in-production';
      return jwt.sign(payload, secret, {
        algorithm: 'HS256',
        expiresIn
      });
    } catch (error) {
      this.logger.error('Error creating donation link token:', error);
      throw new Error('Failed to create donation link token');
    }
  }

  /**
   * Validate a donation link token
   */
  async validateDonationLinkToken(token: string): Promise<any> {
    try {
      const secret = this.configService.jwtSecret || 'fallback-secret-change-in-production';
      const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as any;
      
      if (decoded.type !== 'donation_link') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      this.logger.error('Error validating donation link token:', error);
      return null;
    }
  }

  /**
   * Create a secure payment token for PCI DSS compliance
   */
  async createPaymentToken(
    paymentData: {
      amount: number;
      currency: string;
      streamerId: string;
      donorId?: string;
      metadata?: Record<string, any>;
    },
    expiresIn: number = 15 * 60 // 15 minutes
  ): Promise<string> {
    try {
      const payload = {
        ...paymentData,
        type: 'payment',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn
      };

      const secret = this.configService.jwtSecret || 'fallback-secret-change-in-production';
      return jwt.sign(payload, secret, {
        algorithm: 'HS256',
        expiresIn
      });
    } catch (error) {
      this.logger.error('Error creating payment token:', error);
      throw new Error('Failed to create payment token');
    }
  }

  /**
   * Validate a payment token
   */
  async validatePaymentToken(token: string): Promise<any> {
    try {
      const secret = this.configService.jwtSecret || 'fallback-secret-change-in-production';
      const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as any;
      
      if (decoded.type !== 'payment') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      this.logger.error('Error validating payment token:', error);
      return null;
    }
  }

  /**
   * Generate a secure random token for one-time use
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash sensitive data (one-way encryption)
   */
  hashData(data: string, salt?: string): { hash: string; salt: string } {
    const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, generatedSalt, 10000, 64, 'sha512').toString('hex');
    
    return { hash, salt: generatedSalt };
  }

  /**
   * Verify hashed data
   */
  verifyHash(data: string, hash: string, salt: string): boolean {
    const computedHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
  }

  /**
   * Create a secure session token
   */
  async createSessionToken(
    userId: string,
    permissions: string[] = [],
    expiresIn: number = 60 * 60 // 1 hour
  ): Promise<string> {
    try {
      const payload = {
        userId,
        permissions,
        type: 'session',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn
      };

      const secret = this.configService.jwtSecret || 'fallback-secret-change-in-production';
      return jwt.sign(payload, secret, {
        algorithm: 'HS256',
        expiresIn
      });
    } catch (error) {
      this.logger.error('Error creating session token:', error);
      throw new Error('Failed to create session token');
    }
  }

  /**
   * Revoke a token (add to blacklist)
   */
  async revokeToken(token: string, reason: string = 'manual_revocation'): Promise<void> {
    try {
      // In a production environment, you would add this token to a blacklist
      // stored in Redis or a database
      this.logger.log(`Token revoked: ${token.substring(0, 10)}... - Reason: ${reason}`);
      
      // For now, we'll just log the revocation
      // In production, implement proper token blacklisting
    } catch (error) {
      this.logger.error('Error revoking token:', error);
      throw new Error('Failed to revoke token');
    }
  }
} 