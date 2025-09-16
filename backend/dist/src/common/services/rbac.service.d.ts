import { UserRole } from '../enums/roles.enum';
export declare class RbacService {
    hasRole(userRole: string, requiredRole: UserRole): boolean;
    hasAnyRole(userRole: string, requiredRoles: UserRole[]): boolean;
    hasAllRoles(userRole: string, requiredRoles: UserRole[]): boolean;
    hasPermission(userRole: string, permission: string): boolean;
    hasAnyPermission(userRole: string, permissions: string[]): boolean;
    hasAllPermissions(userRole: string, permissions: string[]): boolean;
    getRolePermissions(role: string): string[];
    canAccessResource(userId: string, resourceUserId: string, userRole: string): boolean;
    isValidRole(role: string): boolean;
    getRoleHierarchy(role: string): number;
}
