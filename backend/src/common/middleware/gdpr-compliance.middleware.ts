import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class GDPRComplianceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Check for GDPR consent headers
    const gdprConsent = req.headers['x-gdpr-consent'];
    const dataProcessingConsent = req.headers['x-data-processing-consent'];
    
    // For endpoints that process personal data
    if (this.requiresGDPRConsent(req.path, req.method)) {
      if (!gdprConsent || gdprConsent !== 'true') {
        throw new HttpException(
          {
            message: 'GDPR consent required for data processing',
            code: 'GDPR_CONSENT_REQUIRED',
            details: 'This endpoint requires explicit consent for data processing under GDPR regulations'
          },
          HttpStatus.FORBIDDEN
        );
      }
    }

    // For endpoints that handle sensitive personal data
    if (this.requiresDataProcessingConsent(req.path, req.method)) {
      if (!dataProcessingConsent || dataProcessingConsent !== 'true') {
        throw new HttpException(
          {
            message: 'Data processing consent required',
            code: 'DATA_PROCESSING_CONSENT_REQUIRED',
            details: 'This endpoint requires explicit consent for processing personal data'
          },
          HttpStatus.FORBIDDEN
        );
      }
    }

    // Add GDPR compliance headers to response
    res.setHeader('X-GDPR-Compliant', 'true');
    res.setHeader('X-Data-Retention-Policy', '7 years for financial records, 2 years for user data');
    res.setHeader('X-Data-Processing-Basis', 'Legitimate interest and explicit consent');
    res.setHeader('X-User-Rights', 'Access, Rectification, Erasure, Portability, Restriction, Objection');

    next();
  }

  private requiresGDPRConsent(path: string, method: string): boolean {
    const gdprEndpoints = [
      '/api/users/profile',
      '/api/users/preferences',
      '/api/donations',
      '/api/payments',
      '/api/wallets',
      '/api/analytics'
    ];

    return gdprEndpoints.some(endpoint => path.includes(endpoint)) && method !== 'GET';
  }

  private requiresDataProcessingConsent(path: string, method: string): boolean {
    const sensitiveEndpoints = [
      '/api/users/profile',
      '/api/payments',
      '/api/analytics/tracking',
      '/api/upload'
    ];

    return sensitiveEndpoints.some(endpoint => path.includes(endpoint)) && method !== 'GET';
  }
} 