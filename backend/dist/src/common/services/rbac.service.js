"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacService = void 0;
const common_1 = require("@nestjs/common");
const roles_enum_1 = require("../enums/roles.enum");
let RbacService = class RbacService {
    hasRole(userRole, requiredRole) {
        const userHierarchy = roles_enum_1.ROLE_HIERARCHY[userRole] || 0;
        const requiredHierarchy = roles_enum_1.ROLE_HIERARCHY[requiredRole];
        return userHierarchy >= requiredHierarchy;
    }
    hasAnyRole(userRole, requiredRoles) {
        return requiredRoles.some((role) => this.hasRole(userRole, role));
    }
    hasAllRoles(userRole, requiredRoles) {
        return requiredRoles.every((role) => this.hasRole(userRole, role));
    }
    hasPermission(userRole, permission) {
        const userPermissions = roles_enum_1.ROLE_PERMISSIONS[userRole] || [];
        return userPermissions.includes(permission);
    }
    hasAnyPermission(userRole, permissions) {
        return permissions.some((permission) => this.hasPermission(userRole, permission));
    }
    hasAllPermissions(userRole, permissions) {
        return permissions.every((permission) => this.hasPermission(userRole, permission));
    }
    getRolePermissions(role) {
        return roles_enum_1.ROLE_PERMISSIONS[role] || [];
    }
    canAccessResource(userId, resourceUserId, userRole) {
        if (userRole === roles_enum_1.UserRole.ADMIN) {
            return true;
        }
        return userId === resourceUserId;
    }
    isValidRole(role) {
        return Object.values(roles_enum_1.UserRole).includes(role);
    }
    getRoleHierarchy(role) {
        return roles_enum_1.ROLE_HIERARCHY[role] || 0;
    }
};
exports.RbacService = RbacService;
exports.RbacService = RbacService = __decorate([
    (0, common_1.Injectable)()
], RbacService);
//# sourceMappingURL=rbac.service.js.map