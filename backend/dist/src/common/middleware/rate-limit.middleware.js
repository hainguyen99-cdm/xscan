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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../redis/redis.service");
let RateLimitMiddleware = class RateLimitMiddleware {
    constructor(redisService) {
        this.redisService = redisService;
    }
    async use(req, res, next) {
        const clientId = this.getClientIdentifier(req);
        const endpoint = req.path;
        const method = req.method;
        const limits = this.getRateLimits(endpoint, method);
        try {
            const currentCount = await this.redisService.get(`rate_limit:${clientId}:${endpoint}:${method}`);
            const count = currentCount ? parseInt(currentCount) : 0;
            if (count >= limits.maxRequests) {
                const retryAfter = await this.redisService.ttl(`rate_limit:${clientId}:${endpoint}:${method}`);
                res.setHeader('X-RateLimit-Limit', limits.maxRequests);
                res.setHeader('X-RateLimit-Remaining', 0);
                res.setHeader('X-RateLimit-Reset', retryAfter);
                res.setHeader('Retry-After', retryAfter);
                throw new common_1.HttpException({
                    message: 'Rate limit exceeded',
                    retryAfter,
                    limit: limits.maxRequests,
                }, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            const key = `rate_limit:${clientId}:${endpoint}:${method}`;
            await this.redisService.setex(key, limits.windowSeconds, (count + 1).toString());
            res.setHeader('X-RateLimit-Limit', limits.maxRequests);
            res.setHeader('X-RateLimit-Remaining', limits.maxRequests - count - 1);
            res.setHeader('X-RateLimit-Reset', limits.windowSeconds);
            next();
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Rate limiting error:', error);
            next();
        }
    }
    getClientIdentifier(req) {
        const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        if (req.user && req.user['id']) {
            return `${ip}:${req.user['id']}`;
        }
        return ip;
    }
    getRateLimits(endpoint, method) {
        if (endpoint.includes('/auth') || endpoint.includes('/login')) {
            return { maxRequests: 5, windowSeconds: 300 };
        }
        if (endpoint.includes('/donations') && method === 'POST') {
            return { maxRequests: 10, windowSeconds: 60 };
        }
        if (endpoint.includes('/payments')) {
            return { maxRequests: 20, windowSeconds: 300 };
        }
        if (endpoint.includes('/upload')) {
            return { maxRequests: 5, windowSeconds: 60 };
        }
        return { maxRequests: 100, windowSeconds: 60 };
    }
};
exports.RateLimitMiddleware = RateLimitMiddleware;
exports.RateLimitMiddleware = RateLimitMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], RateLimitMiddleware);
//# sourceMappingURL=rate-limit.middleware.js.map