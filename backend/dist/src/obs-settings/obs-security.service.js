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
var OBSSecurityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBSSecurityService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const obs_settings_schema_1 = require("./obs-settings.schema");
const crypto_1 = require("crypto");
let OBSSecurityService = OBSSecurityService_1 = class OBSSecurityService {
    constructor(obsSettingsModel) {
        this.obsSettingsModel = obsSettingsModel;
        this.logger = new common_1.Logger(OBSSecurityService_1.name);
        this.requestCache = new Map();
        this.replayAttackCache = new Map();
    }
    async validateAlertToken(alertToken, clientIp, userAgent, signatureData) {
        try {
            if (!this.isValidTokenFormat(alertToken)) {
                await this.logSecurityViolation(alertToken, 'invalid_token', clientIp, userAgent, 'Invalid token format');
                return { isValid: false, error: 'Invalid token format' };
            }
            const settings = await this.obsSettingsModel.findOne({
                alertToken,
                isActive: true,
            });
            if (!settings) {
                await this.logSecurityViolation(alertToken, 'invalid_token', clientIp, userAgent, 'Token not found or inactive');
                return { isValid: false, error: 'Invalid or inactive token' };
            }
            if (settings.securitySettings?.isTokenRevoked) {
                await this.logSecurityViolation(alertToken, 'invalid_token', clientIp, userAgent, 'Token has been revoked');
                return { isValid: false, error: 'Token has been revoked' };
            }
            if (settings.securitySettings?.tokenExpiresAt && new Date() > settings.securitySettings.tokenExpiresAt) {
                await this.logSecurityViolation(alertToken, 'invalid_token', clientIp, userAgent, 'Token has expired');
                return { isValid: false, error: 'Token has expired' };
            }
            if (settings.securitySettings?.requireIPValidation && clientIp) {
                if (!this.isIPAllowed(clientIp, settings.securitySettings.allowedIPs)) {
                    await this.logSecurityViolation(alertToken, 'ip_blocked', clientIp, userAgent, 'IP not in allowed list');
                    return { isValid: false, error: 'IP address not authorized' };
                }
            }
            if (settings.securitySettings?.requireRequestSigning && signatureData) {
                if (!this.validateRequestSignature(signatureData, settings.securitySettings.requestSignatureSecret)) {
                    await this.logSecurityViolation(alertToken, 'signature_mismatch', clientIp, userAgent, 'Invalid request signature');
                    return { isValid: false, error: 'Invalid request signature' };
                }
            }
            if (signatureData && this.isReplayAttack(alertToken, signatureData.nonce)) {
                await this.logSecurityViolation(alertToken, 'replay_attack', clientIp, userAgent, 'Replay attack detected');
                return { isValid: false, error: 'Replay attack detected' };
            }
            if (clientIp && await this.isRateLimited(alertToken, clientIp)) {
                await this.logSecurityViolation(alertToken, 'rate_limit_exceeded', clientIp, userAgent, 'Rate limit exceeded');
                return { isValid: false, error: 'Rate limit exceeded' };
            }
            return {
                isValid: true,
                streamerId: settings.streamerId.toString(),
                settings: settings.toObject(),
            };
        }
        catch (error) {
            this.logger.error(`Error validating alert token: ${error.message}`, error.stack);
            return { isValid: false, error: 'Internal validation error' };
        }
    }
    isValidTokenFormat(token) {
        return /^[a-f0-9]{64}$/.test(token);
    }
    isIPAllowed(clientIp, allowedIPs) {
        if (!allowedIPs || allowedIPs.length === 0) {
            return true;
        }
        return allowedIPs.some(allowedIP => {
            if (allowedIP.includes('/')) {
                return this.isIPInCIDR(clientIp, allowedIP);
            }
            return clientIp === allowedIP;
        });
    }
    isIPInCIDR(ip, cidr) {
        try {
            const [network, bits] = cidr.split('/');
            const mask = ~((1 << (32 - parseInt(bits))) - 1);
            const ipNum = this.ipToNumber(ip);
            const networkNum = this.ipToNumber(network);
            return (ipNum & mask) === (networkNum & mask);
        }
        catch {
            return false;
        }
    }
    ipToNumber(ip) {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    }
    validateRequestSignature(signatureData, secret) {
        if (!secret) {
            return false;
        }
        const now = Date.now();
        const timeDiff = Math.abs(now - signatureData.timestamp);
        if (timeDiff > 300000) {
            return false;
        }
        const expectedSignature = this.createRequestSignature(signatureData.timestamp, signatureData.nonce, secret);
        return (0, crypto_1.timingSafeEqual)(Buffer.from(signatureData.signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    }
    createRequestSignature(timestamp, nonce, secret) {
        const data = `${timestamp}:${nonce}`;
        return (0, crypto_1.createHmac)('sha256', secret).update(data).digest('hex');
    }
    isReplayAttack(alertToken, nonce) {
        const cacheKey = `replay:${alertToken}`;
        const nonces = this.replayAttackCache.get(cacheKey) || new Set();
        if (nonces.has(nonce)) {
            return true;
        }
        nonces.add(nonce);
        this.replayAttackCache.set(cacheKey, nonces);
        setTimeout(() => {
            const currentNonces = this.replayAttackCache.get(cacheKey);
            if (currentNonces) {
                currentNonces.delete(nonce);
                if (currentNonces.size === 0) {
                    this.replayAttackCache.delete(cacheKey);
                }
            }
        }, 3600000);
        return false;
    }
    async isRateLimited(alertToken, clientIp) {
        const cacheKey = `rate_limit:${alertToken}:${clientIp}`;
        const now = Date.now();
        const windowMs = 60000;
        const maxRequests = 10;
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
    async logSecurityViolation(alertToken, type, ip, userAgent, details) {
        try {
            const violation = {
                type,
                ip,
                userAgent,
                details,
            };
            await this.obsSettingsModel.updateOne({ alertToken }, {
                $push: {
                    'securitySettings.securityViolations': {
                        ...violation,
                        timestamp: new Date(),
                    },
                },
                $set: {
                    'securitySettings.lastSecurityAudit': new Date(),
                },
            });
            this.logger.warn(`Security violation logged: ${type} for token ${alertToken.substring(0, 8)}...`, {
                alertToken: alertToken.substring(0, 8) + '...',
                type,
                ip,
                userAgent,
                details,
            });
        }
        catch (error) {
            this.logger.error(`Error logging security violation: ${error.message}`);
        }
    }
    async revokeAlertToken(streamerId, reason = 'Manual revocation') {
        await this.obsSettingsModel.updateOne({ streamerId: new mongoose_2.Types.ObjectId(streamerId) }, {
            $set: {
                'securitySettings.isTokenRevoked': true,
                'securitySettings.revokedAt': new Date(),
                'securitySettings.revocationReason': reason,
            },
        });
        this.logger.log(`Alert token revoked for streamer ${streamerId}: ${reason}`);
    }
    async regenerateAlertTokenWithSecurity(streamerId) {
        const newToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const newSignatureSecret = (0, crypto_1.randomBytes)(32).toString('hex');
        await this.obsSettingsModel.updateOne({ streamerId: new mongoose_2.Types.ObjectId(streamerId) }, {
            $set: {
                alertToken: newToken,
                'securitySettings.lastTokenRegeneration': new Date(),
                'securitySettings.requestSignatureSecret': newSignatureSecret,
                'securitySettings.isTokenRevoked': false,
                'securitySettings.revokedAt': null,
                'securitySettings.revocationReason': null,
            },
        });
        this.logger.log(`Alert token regenerated for streamer ${streamerId}`);
        return newToken;
    }
    async updateSecuritySettings(streamerId, securitySettings) {
        await this.obsSettingsModel.updateOne({ streamerId: new mongoose_2.Types.ObjectId(streamerId) }, {
            $set: {
                'securitySettings': {
                    ...securitySettings,
                    lastSecurityAudit: new Date(),
                },
            },
        });
        this.logger.log(`Security settings updated for streamer ${streamerId}`);
    }
    async getSecurityAuditLog(streamerId, limit = 50) {
        const settings = await this.obsSettingsModel.findOne({ streamerId: new mongoose_2.Types.ObjectId(streamerId) }, { 'securitySettings.securityViolations': 1 });
        if (!settings?.securitySettings?.securityViolations) {
            return [];
        }
        return settings.securitySettings.securityViolations
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    async cleanupOldSecurityViolations(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        await this.obsSettingsModel.updateMany({}, {
            $pull: {
                'securitySettings.securityViolations': {
                    timestamp: { $lt: cutoffDate },
                },
            },
        });
        this.logger.log(`Cleaned up security violations older than ${daysOld} days`);
    }
};
exports.OBSSecurityService = OBSSecurityService;
exports.OBSSecurityService = OBSSecurityService = OBSSecurityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(obs_settings_schema_1.OBSSettings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], OBSSecurityService);
//# sourceMappingURL=obs-security.service.js.map