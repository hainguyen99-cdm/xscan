import { Injectable } from '@nestjs/common';
import {
  UserRole,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
} from '../enums/roles.enum';

@Injectable()
export class RbacService {
  /**
   * Check if a user has a specific role
   */
  hasRole(userRole: string, requiredRole: UserRole): boolean {
    const userHierarchy = ROLE_HIERARCHY[userRole as UserRole] || 0;
    const requiredHierarchy = ROLE_HIERARCHY[requiredRole];

    return userHierarchy >= requiredHierarchy;
  }

  /**
   * Check if a user has any of the required roles
   */
  hasAnyRole(userRole: string, requiredRoles: UserRole[]): boolean {
    return requiredRoles.some((role) => this.hasRole(userRole, role));
  }

  /**
   * Check if a user has all required roles
   */
  hasAllRoles(userRole: string, requiredRoles: UserRole[]): boolean {
    return requiredRoles.every((role) => this.hasRole(userRole, role));
  }

  /**
   * Check if a user has a specific permission
   */
  hasPermission(userRole: string, permission: string): boolean {
    const userPermissions = ROLE_PERMISSIONS[userRole as UserRole] || [];
    return userPermissions.includes(permission);
  }

  /**
   * Check if a user has any of the required permissions
   */
  hasAnyPermission(userRole: string, permissions: string[]): boolean {
    return permissions.some((permission) =>
      this.hasPermission(userRole, permission),
    );
  }

  /**
   * Check if a user has all required permissions
   */
  hasAllPermissions(userRole: string, permissions: string[]): boolean {
    return permissions.every((permission) =>
      this.hasPermission(userRole, permission),
    );
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(role: string): string[] {
    return ROLE_PERMISSIONS[role as UserRole] || [];
  }

  /**
   * Check if a user can access a resource based on ownership
   */
  canAccessResource(
    userId: string,
    resourceUserId: string,
    userRole: string,
  ): boolean {
    // Admins can access everything
    if (userRole === UserRole.ADMIN) {
      return true;
    }

    // Users can only access their own resources
    return userId === resourceUserId;
  }

  /**
   * Validate if a role is valid
   */
  isValidRole(role: string): boolean {
    return Object.values(UserRole).includes(role as UserRole);
  }

  /**
   * Get role hierarchy level
   */
  getRoleHierarchy(role: string): number {
    return ROLE_HIERARCHY[role as UserRole] || 0;
  }
}
