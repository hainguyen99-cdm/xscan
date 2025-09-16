import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class CommonService {
  private readonly logger = new Logger(CommonService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Get application environment
   */
  getEnvironment(): string {
    return this.configService.nodeEnv || 'development';
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }

  /**
   * Get application version
   */
  getVersion(): string {
    return '1.0.0'; // Hardcoded for now, can be moved to config later
  }

  /**
   * Get application name
   */
  getAppName(): string {
    return 'XScan'; // Hardcoded for now, can be moved to config later
  }

  /**
   * Log security event
   */
  logSecurityEvent(event: string, details: any, level: 'info' | 'warn' | 'error' = 'info'): void {
    const logData = {
      timestamp: new Date().toISOString(),
      event,
      details,
      level,
      environment: this.getEnvironment(),
      version: this.getVersion()
    };

    switch (level) {
      case 'error':
        this.logger.error(`Security Event: ${event}`, logData);
        break;
      case 'warn':
        this.logger.warn(`Security Event: ${event}`, logData);
        break;
      default:
        this.logger.log(`Security Event: ${event}`, logData);
    }
  }

  /**
   * Generate secure random string
   */
  generateSecureString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Sanitize input string
   */
  sanitizeInput(input: string): string {
    if (!input) return '';
    
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if string contains SQL injection patterns
   */
  containsSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
      /(--|#|\/\*|\*\/)/,
      /(\b(WAITFOR|DELAY)\b)/i
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Check if string contains XSS patterns
   */
  containsXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /<form[^>]*>/gi,
      /<input[^>]*>/gi,
      /<textarea[^>]*>/gi,
      /<select[^>]*>/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Get security configuration
   */
  getSecurityConfig(): any {
    return {
      environment: this.getEnvironment(),
      version: this.getVersion(),
      appName: this.getAppName(),
      features: {
        ssl: this.isProduction(),
        rateLimiting: true,
        contentScanning: true,
        pciCompliance: true,
        gdprCompliance: true,
        tokenization: true
      },
      headers: {
        hsts: this.isProduction(),
        csp: true,
        xssProtection: true,
        frameOptions: true,
        contentTypeOptions: true
      }
    };
  }
} 