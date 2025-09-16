"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.ROLE_HIERARCHY = exports.USER_ROLES = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["STREAMER"] = "streamer";
    UserRole["DONOR"] = "donor";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.USER_ROLES = Object.values(UserRole);
exports.ROLE_HIERARCHY = {
    [UserRole.ADMIN]: 3,
    [UserRole.STREAMER]: 2,
    [UserRole.DONOR]: 1,
};
exports.ROLE_PERMISSIONS = {
    [UserRole.ADMIN]: [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'users.activate',
        'users.deactivate',
        'users.stats',
        'scans.create',
        'scans.read',
        'scans.update',
        'scans.delete',
        'scans.start',
        'scans.complete',
        'scans.fail',
        'scans.all',
        'system.config',
        'system.logs',
        'system.backup',
    ],
    [UserRole.STREAMER]: [
        'profile.read',
        'profile.update',
        'profile.password',
        'scans.create',
        'scans.read.own',
        'scans.update.own',
        'scans.delete.own',
        'scans.start.own',
        'scans.complete.own',
        'scans.fail.own',
        'donations.read.own',
        'donations.stats.own',
    ],
    [UserRole.DONOR]: [
        'profile.read',
        'profile.update',
        'profile.password',
        'scans.read.public',
        'donations.create',
        'donations.read.own',
        'donations.update.own',
        'donations.delete.own',
    ],
};
//# sourceMappingURL=roles.enum.js.map