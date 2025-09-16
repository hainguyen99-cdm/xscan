import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../../redis/redis.service';
export declare class RateLimitMiddleware implements NestMiddleware {
    private readonly redisService;
    constructor(redisService: RedisService);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
    private getClientIdentifier;
    private getRateLimits;
}
