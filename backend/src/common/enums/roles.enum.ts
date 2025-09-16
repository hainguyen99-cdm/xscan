export enum UserRole {
  ADMIN = 'admin',
  STREAMER = 'streamer',
  DONOR = 'donor',
}

export const USER_ROLES = Object.values(UserRole);

export const ROLE_HIERARCHY = {
  [UserRole.ADMIN]: 3,
  [UserRole.STREAMER]: 2,
  [UserRole.DONOR]: 1,
};

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: [
    // User management
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'users.activate',
    'users.deactivate',
    'users.stats',

    // Scan management
    'scans.create',
    'scans.read',
    'scans.update',
    'scans.delete',
    'scans.start',
    'scans.complete',
    'scans.fail',
    'scans.all',

    // System management
    'system.config',
    'system.logs',
    'system.backup',
  ],

  [UserRole.STREAMER]: [
    // Own profile management
    'profile.read',
    'profile.update',
    'profile.password',

    // Scan management (own scans)
    'scans.create',
    'scans.read.own',
    'scans.update.own',
    'scans.delete.own',
    'scans.start.own',
    'scans.complete.own',
    'scans.fail.own',

    // Donation management
    'donations.read.own',
    'donations.stats.own',
  ],

  [UserRole.DONOR]: [
    // Own profile management
    'profile.read',
    'profile.update',
    'profile.password',

    // Scan viewing (public scans)
    'scans.read.public',

    // Donation management
    'donations.create',
    'donations.read.own',
    'donations.update.own',
    'donations.delete.own',
  ],
};
