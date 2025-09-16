"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CommonService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../config/config.service");
let CommonService = CommonService_1 = class CommonService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(CommonService_1.name);
    }
    getEnvironment() {
        return this.configService.nodeEnv || 'development';
    }
    isProduction() {
        return this.getEnvironment() === 'production';
    }
    getVersion() {
        return '1.0.0';
    }
    getAppName() {
        return 'XScan';
    }
    logSecurityEvent(event, details, level = 'info') {
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
    generateSecureString(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    sanitizeInput(input) {
        if (!input)
            return '';
        return input
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim();
    }
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    validateUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    containsSQLInjection(input) {
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
            /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
            /(\b(OR|AND)\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
            /(--|#|\/\*|\*\/)/,
            /(\b(WAITFOR|DELAY)\b)/i
        ];
        return sqlPatterns.some(pattern => pattern.test(input));
    }
    containsXSS(input) {
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
    getSecurityConfig() {
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
};
exports.CommonService = CommonService;
exports.CommonService = CommonService = CommonService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], CommonService);
//# sourceMappingURL=common.service.js.map