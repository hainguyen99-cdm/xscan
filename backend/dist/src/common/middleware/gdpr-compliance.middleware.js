"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GDPRComplianceMiddleware = void 0;
const common_1 = require("@nestjs/common");
let GDPRComplianceMiddleware = class GDPRComplianceMiddleware {
    use(req, res, next) {
        const gdprConsent = req.headers['x-gdpr-consent'];
        const dataProcessingConsent = req.headers['x-data-processing-consent'];
        if (this.requiresGDPRConsent(req.path, req.method)) {
            if (!gdprConsent || gdprConsent !== 'true') {
                throw new common_1.HttpException({
                    message: 'GDPR consent required for data processing',
                    code: 'GDPR_CONSENT_REQUIRED',
                    details: 'This endpoint requires explicit consent for data processing under GDPR regulations'
                }, common_1.HttpStatus.FORBIDDEN);
            }
        }
        if (this.requiresDataProcessingConsent(req.path, req.method)) {
            if (!dataProcessingConsent || dataProcessingConsent !== 'true') {
                throw new common_1.HttpException({
                    message: 'Data processing consent required',
                    code: 'DATA_PROCESSING_CONSENT_REQUIRED',
                    details: 'This endpoint requires explicit consent for processing personal data'
                }, common_1.HttpStatus.FORBIDDEN);
            }
        }
        res.setHeader('X-GDPR-Compliant', 'true');
        res.setHeader('X-Data-Retention-Policy', '7 years for financial records, 2 years for user data');
        res.setHeader('X-Data-Processing-Basis', 'Legitimate interest and explicit consent');
        res.setHeader('X-User-Rights', 'Access, Rectification, Erasure, Portability, Restriction, Objection');
        next();
    }
    requiresGDPRConsent(path, method) {
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
    requiresDataProcessingConsent(path, method) {
        const sensitiveEndpoints = [
            '/api/users/profile',
            '/api/payments',
            '/api/analytics/tracking',
            '/api/upload'
        ];
        return sensitiveEndpoints.some(endpoint => path.includes(endpoint)) && method !== 'GET';
    }
};
exports.GDPRComplianceMiddleware = GDPRComplianceMiddleware;
exports.GDPRComplianceMiddleware = GDPRComplianceMiddleware = __decorate([
    (0, common_1.Injectable)()
], GDPRComplianceMiddleware);
//# sourceMappingURL=gdpr-compliance.middleware.js.map