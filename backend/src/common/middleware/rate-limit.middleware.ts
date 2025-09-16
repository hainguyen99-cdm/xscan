import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const clientId = this.getClientIdentifier(req);
    const endpoint = req.path;
    const method = req.method;

    // Different rate limits for different endpoints
    const limits = this.getRateLimits(endpoint, method);
    
    try {
      const currentCount = await this.redisService.get<string>(`rate_limit:${clientId}:${endpoint}:${method}`);
      const count = currentCount ? parseInt(currentCount) : 0;

      if (count >= limits.maxRequests) {
        const retryAfter = await this.redisService.ttl(`rate_limit:${clientId}:${endpoint}:${method}`);
        
        res.setHeader('X-RateLimit-Limit', limits.maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', retryAfter);
        res.setHeader('Retry-After', retryAfter);

        throw new HttpException(
          {
            message: 'Rate limit exceeded',
            retryAfter,
            limit: limits.maxRequests,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Increment counter
      const key = `rate_limit:${clientId}:${endpoint}:${method}`;
      await this.redisService.setex(key, limits.windowSeconds, (count + 1).toString());

      // Set headers
      res.setHeader('X-RateLimit-Limit', limits.maxRequests);
      res.setHeader('X-RateLimit-Remaining', limits.maxRequests - count - 1);
      res.setHeader('X-RateLimit-Reset', limits.windowSeconds);

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // If Redis is unavailable, allow the request but log the error
      console.error('Rate limiting error:', error);
      next();
    }
  }

  private getClientIdentifier(req: Request): string {
    // Use IP address as primary identifier
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // If user is authenticated, include user ID for more granular control
    if (req.user && req.user['id']) {
      return `${ip}:${req.user['id']}`;
    }
    
    return ip;
  }

  private getRateLimits(endpoint: string, method: string): { maxRequests: number; windowSeconds: number } {
    // Strict limits for sensitive endpoints
    if (endpoint.includes('/auth') || endpoint.includes('/login')) {
      return { maxRequests: 5, windowSeconds: 300 }; // 5 attempts per 5 minutes
    }
    
    if (endpoint.includes('/donations') && method === 'POST') {
      return { maxRequests: 10, windowSeconds: 60 }; // 10 donations per minute
    }
    
    if (endpoint.includes('/payments')) {
      return { maxRequests: 20, windowSeconds: 300 }; // 20 payment attempts per 5 minutes
    }
    
    if (endpoint.includes('/upload')) {
      return { maxRequests: 5, windowSeconds: 60 }; // 5 uploads per minute
    }
    
    // Default limits
    return { maxRequests: 100, windowSeconds: 60 }; // 100 requests per minute
  }
} 