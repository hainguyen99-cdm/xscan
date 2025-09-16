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
var TokenizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenizationService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../config/config.service");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
let TokenizationService = TokenizationService_1 = class TokenizationService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TokenizationService_1.name);
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;
    }
    generateKey() {
        return crypto.randomBytes(this.keyLength);
    }
    generateIV() {
        return crypto.randomBytes(this.ivLength);
    }
    async encryptData(data, secretKey) {
        try {
            const key = secretKey ? Buffer.from(secretKey, 'hex') : this.generateKey();
            const iv = this.generateIV();
            const cipher = crypto.createCipher(this.algorithm, key);
            let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const tag = cipher.getAuthTag();
            const result = {
                iv: iv.toString('hex'),
                encrypted: encrypted,
                tag: tag.toString('hex'),
                key: key.toString('hex')
            };
            return Buffer.from(JSON.stringify(result)).toString('base64');
        }
        catch (error) {
            this.logger.error('Error encrypting data:', error);
            throw new Error('Failed to encrypt data');
        }
    }
    async decryptData(encryptedData) {
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
        }
        catch (error) {
            this.logger.error('Error decrypting data:', error);
            throw new Error('Failed to decrypt data');
        }
    }
    async createWidgetToken(streamerId, permissions = ['read'], metadata = {}, expiresIn = 24 * 60 * 60) {
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
        }
        catch (error) {
            this.logger.error('Error creating widget token:', error);
            throw new Error('Failed to create widget token');
        }
    }
    async validateWidgetToken(token) {
        try {
            const secret = this.configService.jwtSecret || 'fallback-secret-change-in-production';
            const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
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
        }
        catch (error) {
            this.logger.error('Error validating widget token:', error);
            return null;
        }
    }
    async createDonationLinkToken(streamerId, amount, message, expiresIn = 7 * 24 * 60 * 60) {
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
        }
        catch (error) {
            this.logger.error('Error creating donation link token:', error);
            throw new Error('Failed to create donation link token');
        }
    }
    async validateDonationLinkToken(token) {
        try {
            const secret = this.configService.jwtSecret || 'fallback-secret-change-in-production';
            const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
            if (decoded.type !== 'donation_link') {
                throw new Error('Invalid token type');
            }
            return decoded;
        }
        catch (error) {
            this.logger.error('Error validating donation link token:', error);
            return null;
        }
    }
    async createPaymentToken(paymentData, expiresIn = 15 * 60) {
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
        }
        catch (error) {
            this.logger.error('Error creating payment token:', error);
            throw new Error('Failed to create payment token');
        }
    }
    async validatePaymentToken(token) {
        try {
            const secret = this.configService.jwtSecret || 'fallback-secret-change-in-production';
            const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
            if (decoded.type !== 'payment') {
                throw new Error('Invalid token type');
            }
            return decoded;
        }
        catch (error) {
            this.logger.error('Error validating payment token:', error);
            return null;
        }
    }
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    hashData(data, salt) {
        const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(data, generatedSalt, 10000, 64, 'sha512').toString('hex');
        return { hash, salt: generatedSalt };
    }
    verifyHash(data, hash, salt) {
        const computedHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
        return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
    }
    async createSessionToken(userId, permissions = [], expiresIn = 60 * 60) {
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
        }
        catch (error) {
            this.logger.error('Error creating session token:', error);
            throw new Error('Failed to create session token');
        }
    }
    async revokeToken(token, reason = 'manual_revocation') {
        try {
            this.logger.log(`Token revoked: ${token.substring(0, 10)}... - Reason: ${reason}`);
        }
        catch (error) {
            this.logger.error('Error revoking token:', error);
            throw new Error('Failed to revoke token');
        }
    }
};
exports.TokenizationService = TokenizationService;
exports.TokenizationService = TokenizationService = TokenizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], TokenizationService);
//# sourceMappingURL=tokenization.service.js.map