import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/roles.enum';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { user, params } = request;

    if (!user) {
      return false;
    }

    // Admins can access everything
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // For other roles, check if they own the resource
    const resourceId = params.id || params.userId;
    if (!resourceId) {
      return false;
    }

    // Check if the resource belongs to the current user
    return resourceId === user.sub || resourceId === user.id;
  }
}
