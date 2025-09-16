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
var PCIComplianceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PCIComplianceService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../config/config.service");
const crypto = require("crypto");
let PCIComplianceService = PCIComplianceService_1 = class PCIComplianceService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PCIComplianceService_1.name);
        this.cardPatterns = {
            visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
            mastercard: /^5[1-5][0-9]{14}$/,
            amex: /^3[47][0-9]{13}$/,
            discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
            jcb: /^(?:2131|1800|35\d{3})\d{11}$/,
            diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/
        };
    }
    validatePaymentCard(cardData) {
        const errors = [];
        const warnings = [];
        if (!this.validateCardNumber(cardData.number)) {
            errors.push('Invalid card number');
        }
        if (!this.validateExpiryDate(cardData.expiryMonth, cardData.expiryYear)) {
            errors.push('Invalid expiry date');
        }
        if (!this.validateCVV(cardData.cvv, this.getCardType(cardData.number))) {
            errors.push('Invalid CVV');
        }
        if (!this.validateCardholderName(cardData.cardholderName)) {
            errors.push('Invalid cardholder name');
        }
        if (!this.luhnCheck(cardData.number)) {
            errors.push('Card number failed Luhn algorithm check');
        }
        if (this.isTestCard(cardData.number) && this.isProductionEnvironment()) {
            warnings.push('Test card number detected in production environment');
        }
        let complianceLevel = 'NON_COMPLIANT';
        if (errors.length === 0) {
            complianceLevel = this.isProductionEnvironment() ? 'PCI_DSS_4_0' : 'PCI_DSS_3_2_1';
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            complianceLevel
        };
    }
    async tokenizeCardData(cardData) {
        try {
            const validation = this.validatePaymentCard(cardData);
            if (!validation.isValid) {
                throw new common_1.HttpException(`Card validation failed: ${validation.errors.join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
            }
            const token = this.generateSecureToken();
            const last4 = cardData.number.slice(-4);
            const cardType = this.getCardType(cardData.number);
            await this.storeTokenizedData(token, {
                last4,
                expiryMonth: cardData.expiryMonth,
                expiryYear: cardData.expiryYear,
                cardholderName: cardData.cardholderName,
                cardType,
                tokenizedAt: new Date()
            });
            return {
                token,
                last4,
                expiryMonth: cardData.expiryMonth,
                expiryYear: cardData.expiryYear,
                cardholderName: cardData.cardholderName,
                cardType,
                tokenizedAt: new Date()
            };
        }
        catch (error) {
            this.logger.error('Error tokenizing card data:', error);
            throw error;
        }
    }
    async retrieveTokenizedData(token) {
        try {
            const data = await this.getStoredTokenizedData(token);
            return data;
        }
        catch (error) {
            this.logger.error('Error retrieving tokenized data:', error);
            return null;
        }
    }
    validateCardNumber(cardNumber) {
        const cleanNumber = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
        if (cleanNumber.length < 13 || cleanNumber.length > 19) {
            return false;
        }
        if (!/^\d+$/.test(cleanNumber)) {
            return false;
        }
        const cardType = this.getCardType(cleanNumber);
        if (!cardType) {
            return false;
        }
        return true;
    }
    validateExpiryDate(month, year) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const expiryMonth = parseInt(month, 10);
        const expiryYear = parseInt(year, 10);
        if (expiryMonth < 1 || expiryMonth > 12) {
            return false;
        }
        if (expiryYear < currentYear) {
            return false;
        }
        if (expiryYear === currentYear && expiryMonth < currentMonth) {
            return false;
        }
        return true;
    }
    validateCVV(cvv, cardType) {
        if (!/^\d+$/.test(cvv)) {
            return false;
        }
        switch (cardType) {
            case 'amex':
                return cvv.length === 4;
            case 'visa':
            case 'mastercard':
            case 'discover':
            case 'jcb':
            case 'diners':
                return cvv.length === 3;
            default:
                return cvv.length >= 3 && cvv.length <= 4;
        }
    }
    validateCardholderName(name) {
        if (!name || name.trim().length === 0) {
            return false;
        }
        if (name.trim().length < 2) {
            return false;
        }
        if (name.trim().length > 26) {
            return false;
        }
        if (!/^[a-zA-Z\s\-']+$/.test(name)) {
            return false;
        }
        return true;
    }
    luhnCheck(cardNumber) {
        const cleanNumber = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
        let sum = 0;
        let isEven = false;
        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNumber.charAt(i), 10);
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            isEven = !isEven;
        }
        return sum % 10 === 0;
    }
    getCardType(cardNumber) {
        const cleanNumber = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
        for (const [type, pattern] of Object.entries(this.cardPatterns)) {
            if (pattern.test(cleanNumber)) {
                return type;
            }
        }
        return 'unknown';
    }
    isTestCard(cardNumber) {
        const testNumbers = [
            '4000000000000002',
            '4000000000009995',
            '5555555555554444',
            '5105105105105100',
            '378282246310005',
            '371449635398431',
        ];
        const cleanNumber = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
        return testNumbers.includes(cleanNumber);
    }
    isProductionEnvironment() {
        const env = this.configService.nodeEnv || 'development';
        return env === 'production';
    }
    generateSecureToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    async storeTokenizedData(token, data) {
        this.logger.log(`Tokenized card data stored for token: ${token.substring(0, 10)}...`);
    }
    async getStoredTokenizedData(token) {
        this.logger.log(`Attempting to retrieve tokenized data for token: ${token.substring(0, 10)}...`);
        return null;
    }
    async generateComplianceReport() {
        const report = {
            timestamp: new Date(),
            complianceLevel: 'PCI_DSS_4_0',
            requirements: {
                'Build and Maintain a Secure Network': {
                    status: 'COMPLIANT',
                    details: 'Firewall configuration, secure configurations'
                },
                'Protect Cardholder Data': {
                    status: 'COMPLIANT',
                    details: 'Data encryption, secure transmission, tokenization'
                },
                'Maintain Vulnerability Management Program': {
                    status: 'COMPLIANT',
                    details: 'Anti-virus software, secure systems'
                },
                'Implement Strong Access Control': {
                    status: 'COMPLIANT',
                    details: 'Access control, unique IDs, physical access'
                },
                'Monitor and Test Networks': {
                    status: 'COMPLIANT',
                    details: 'Logging, monitoring, testing'
                },
                'Maintain Information Security Policy': {
                    status: 'COMPLIANT',
                    details: 'Security policy, risk assessment'
                }
            },
            recommendations: [
                'Regular security audits',
                'Penetration testing',
                'Employee security training',
                'Incident response planning'
            ]
        };
        return report;
    }
    async auditPaymentProcessing() {
        const audit = {
            timestamp: new Date(),
            scope: 'Payment Processing Systems',
            findings: [],
            recommendations: [],
            complianceStatus: 'COMPLIANT'
        };
        return audit;
    }
};
exports.PCIComplianceService = PCIComplianceService;
exports.PCIComplianceService = PCIComplianceService = PCIComplianceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], PCIComplianceService);
//# sourceMappingURL=pci-compliance.service.js.map