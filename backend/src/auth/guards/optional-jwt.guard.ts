import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Try to authenticate, but do not throw if it fails
    return super.canActivate(context) as any;
  }

  handleRequest(err: any, user: any) {
    // If there's an error or no user, just return null user instead of throwing
    if (err) {
      return null;
    }
    return user || null;
  }
}


