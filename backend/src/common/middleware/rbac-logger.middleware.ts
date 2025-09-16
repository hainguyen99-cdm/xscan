import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser, AuthenticatedRequest } from '../types/auth.types';

@Injectable()
export class RbacLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RbacLoggerMiddleware.name);

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { method, originalUrl, user } = req;
    const timestamp = new Date().toISOString();

    // Log access attempts for security monitoring
    if (user) {
      this.logger.log(
        `Access attempt - Method: ${method}, URL: ${originalUrl}, User: ${user.sub}, Role: ${user.role}, Timestamp: ${timestamp}`,
      );
    } else {
      this.logger.warn(
        `Unauthenticated access attempt - Method: ${method}, URL: ${originalUrl}, Timestamp: ${timestamp}`,
      );
    }

    next();
  }
}
