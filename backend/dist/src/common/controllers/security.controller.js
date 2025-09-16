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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const content_scanner_service_1 = require("../services/content-scanner.service");
const tokenization_service_1 = require("../services/tokenization.service");
const pci_compliance_service_1 = require("../services/pci-compliance.service");
const common_service_1 = require("../services/common.service");
const scan_result_dto_1 = require("../dto/scan-result.dto");
const widget_token_dto_1 = require("../dto/widget-token.dto");
const tokenized_card_data_dto_1 = require("../dto/tokenized-card-data.dto");
let SecurityController = class SecurityController {
    constructor(contentScannerService, tokenizationService, pciComplianceService, commonService) {
        this.contentScannerService = contentScannerService;
        this.tokenizationService = tokenizationService;
        this.pciComplianceService = pciComplianceService;
        this.commonService = commonService;
    }
    getSecurityConfig() {
        return this.commonService.getSecurityConfig();
    }
    async scanFile(body) {
        this.commonService.logSecurityEvent('file_scan_requested', body);
        try {
            const result = await this.contentScannerService.scanFile(body.filePath, body.originalName);
            if (!result.isSafe) {
                this.commonService.logSecurityEvent('threat_detected', result, 'warn');
                await this.contentScannerService.quarantineFile(body.filePath, result.threats.join(', '));
            }
            return result;
        }
        catch (error) {
            this.commonService.logSecurityEvent('file_scan_failed', { error: error.message }, 'error');
            throw error;
        }
    }
    async createWidgetToken(body) {
        this.commonService.logSecurityEvent('widget_token_created', { streamerId: body.streamerId });
        return this.tokenizationService.createWidgetToken(body.streamerId, body.permissions || ['read'], body.metadata || {}, body.expiresIn || 24 * 60 * 60);
    }
    async validateWidgetToken(body) {
        this.commonService.logSecurityEvent('widget_token_validated', { token: body.token.substring(0, 10) + '...' });
        const result = await this.tokenizationService.validateWidgetToken(body.token);
        return {
            isValid: !!result,
            token: result ? {
                streamerId: result.streamerId,
                expiresAt: result.expiresAt,
                permissions: result.permissions,
                metadata: result.metadata
            } : null
        };
    }
    async createDonationLinkToken(body) {
        this.commonService.logSecurityEvent('donation_link_token_created', { streamerId: body.streamerId });
        const token = await this.tokenizationService.createDonationLinkToken(body.streamerId, body.amount, body.message, body.expiresIn || 7 * 24 * 60 * 60);
        return { token };
    }
    async validateDonationLinkToken(body) {
        this.commonService.logSecurityEvent('donation_link_token_validated', { token: body.token.substring(0, 10) + '...' });
        const result = await this.tokenizationService.validateDonationLinkToken(body.token);
        return {
            isValid: !!result,
            data: result
        };
    }
    async validatePaymentCard(cardData) {
        this.commonService.logSecurityEvent('payment_card_validated', { cardType: 'validation_request' });
        return this.pciComplianceService.validatePaymentCard(cardData);
    }
    async tokenizePaymentCard(cardData) {
        this.commonService.logSecurityEvent('payment_card_tokenized', { cardType: 'tokenization_request' });
        return this.pciComplianceService.tokenizeCardData(cardData);
    }
    async createPaymentToken(body) {
        this.commonService.logSecurityEvent('payment_token_created', {
            streamerId: body.streamerId,
            amount: body.amount,
            currency: body.currency
        });
        const token = await this.tokenizationService.createPaymentToken({
            amount: body.amount,
            currency: body.currency,
            streamerId: body.streamerId,
            donorId: body.donorId,
            metadata: body.metadata
        }, body.expiresIn || 15 * 60);
        return { token };
    }
    async generatePCIComplianceReport() {
        this.commonService.logSecurityEvent('pci_compliance_report_generated', {});
        return this.pciComplianceService.generateComplianceReport();
    }
    async auditPaymentProcessing() {
        this.commonService.logSecurityEvent('payment_processing_audit_requested', {});
        return this.pciComplianceService.auditPaymentProcessing();
    }
    async encryptData(body) {
        this.commonService.logSecurityEvent('data_encryption_requested', { dataType: typeof body.data });
        const encrypted = await this.tokenizationService.encryptData(body.data, body.secretKey);
        return { encrypted };
    }
    async decryptData(body) {
        this.commonService.logSecurityEvent('data_decryption_requested', {});
        const decrypted = await this.tokenizationService.decryptData(body.encryptedData);
        return { decrypted };
    }
    async hashData(body) {
        this.commonService.logSecurityEvent('data_hashing_requested', {});
        const result = this.tokenizationService.hashData(body.data, body.salt);
        return result;
    }
    async verifyHash(body) {
        this.commonService.logSecurityEvent('hash_verification_requested', {});
        const isValid = this.tokenizationService.verifyHash(body.data, body.hash, body.salt);
        return { isValid };
    }
    async validateInput(body) {
        this.commonService.logSecurityEvent('input_validation_requested', { type: body.type });
        const sanitized = this.commonService.sanitizeInput(body.input);
        const hasSQLInjection = this.commonService.containsSQLInjection(body.input);
        const hasXSS = this.commonService.containsXSS(body.input);
        let isValid = false;
        switch (body.type) {
            case 'email':
                isValid = this.commonService.validateEmail(body.input);
                break;
            case 'url':
                isValid = this.commonService.validateUrl(body.input);
                break;
            default:
                isValid = !hasSQLInjection && !hasXSS;
        }
        return {
            original: body.input,
            sanitized,
            isValid,
            threats: {
                sqlInjection: hasSQLInjection,
                xss: hasXSS
            }
        };
    }
};
exports.SecurityController = SecurityController;
__decorate([
    (0, common_1.Get)('config'),
    (0, swagger_1.ApiOperation)({ summary: 'Get security configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security configuration retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getSecurityConfig", null);
__decorate([
    (0, common_1.Post)('scan-file'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Scan uploaded file for security threats' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File scanned successfully', type: scan_result_dto_1.ScanResultDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file or scan failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "scanFile", null);
__decorate([
    (0, common_1.Post)('create-widget-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create secure widget token for OBS integration' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Widget token created successfully', type: widget_token_dto_1.WidgetTokenDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "createWidgetToken", null);
__decorate([
    (0, common_1.Post)('validate-widget-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate widget token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token validation result' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "validateWidgetToken", null);
__decorate([
    (0, common_1.Post)('create-donation-link-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create secure donation link token' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Donation link token created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "createDonationLinkToken", null);
__decorate([
    (0, common_1.Post)('validate-donation-link-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate donation link token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token validation result' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "validateDonationLinkToken", null);
__decorate([
    (0, common_1.Post)('validate-payment-card'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate payment card data for PCI DSS compliance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Card validation result' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid card data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "validatePaymentCard", null);
__decorate([
    (0, common_1.Post)('tokenize-payment-card'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Tokenize payment card data for PCI DSS compliance' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Card data tokenized successfully', type: tokenized_card_data_dto_1.TokenizedCardDataDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid card data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "tokenizePaymentCard", null);
__decorate([
    (0, common_1.Post)('create-payment-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create secure payment token' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payment token created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "createPaymentToken", null);
__decorate([
    (0, common_1.Get)('pci-compliance-report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate PCI DSS compliance report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Compliance report generated successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "generatePCIComplianceReport", null);
__decorate([
    (0, common_1.Get)('audit-payment-processing'),
    (0, swagger_1.ApiOperation)({ summary: 'Audit payment processing for compliance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment processing audit completed' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "auditPaymentProcessing", null);
__decorate([
    (0, common_1.Post)('encrypt-data'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Encrypt sensitive data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Data encrypted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Encryption failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "encryptData", null);
__decorate([
    (0, common_1.Post)('decrypt-data'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Decrypt encrypted data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Data decrypted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Decryption failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "decryptData", null);
__decorate([
    (0, common_1.Post)('hash-data'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Hash sensitive data (one-way encryption)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Data hashed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "hashData", null);
__decorate([
    (0, common_1.Post)('verify-hash'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify hashed data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hash verification completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "verifyHash", null);
__decorate([
    (0, common_1.Post)('input-validation'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate and sanitize input data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Input validation completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "validateInput", null);
exports.SecurityController = SecurityController = __decorate([
    (0, swagger_1.ApiTags)('security'),
    (0, common_1.Controller)('security'),
    __metadata("design:paramtypes", [content_scanner_service_1.ContentScannerService,
        tokenization_service_1.TokenizationService,
        pci_compliance_service_1.PCIComplianceService,
        common_service_1.CommonService])
], SecurityController);
//# sourceMappingURL=security.controller.js.map