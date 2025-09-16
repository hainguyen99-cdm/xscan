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
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_service_1 = require("../config/config.service");
let RedisService = class RedisService {
    constructor(cacheManager, configService) {
        this.cacheManager = cacheManager;
        this.configService = configService;
    }
    async get(key) {
        return await this.cacheManager.get(key);
    }
    async set(key, value, ttl) {
        await this.cacheManager.set(key, value, ttl);
    }
    async del(key) {
        await this.cacheManager.del(key);
    }
    async reset() {
        console.log('Cache reset requested - implementation depends on Redis client');
    }
    async getTtl(key) {
        console.log('TTL check requested for key:', key);
        return -1;
    }
    async ttl(key) {
        return this.getTtl(key);
    }
    async setex(key, ttl, value) {
        await this.set(key, value, ttl);
    }
    async exists(key) {
        try {
            const value = await this.get(key);
            return value !== undefined;
        }
        catch {
            return false;
        }
    }
    async publish(channel, message) {
        try {
            const messageKey = `${channel}:${Date.now()}`;
            await this.set(messageKey, message, 60);
            console.log(`Published message to channel ${channel}:`, message);
        }
        catch (error) {
            console.error(`Failed to publish message to channel ${channel}:`, error);
        }
    }
    async subscribe(channel) {
        try {
            const keys = await this.getChannelKeys(channel);
            const messages = [];
            for (const key of keys) {
                const message = await this.get(key);
                if (message) {
                    messages.push(message);
                    await this.del(key);
                }
            }
            return messages;
        }
        catch (error) {
            console.error(`Failed to subscribe to channel ${channel}:`, error);
            return [];
        }
    }
    async getChannelKeys(channel) {
        try {
            return [];
        }
        catch (error) {
            console.error(`Failed to get channel keys for ${channel}:`, error);
            return [];
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object, config_service_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map