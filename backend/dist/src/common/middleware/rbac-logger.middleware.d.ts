import { NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
export declare class RbacLoggerMiddleware implements NestMiddleware {
    private readonly logger;
    use(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
}
