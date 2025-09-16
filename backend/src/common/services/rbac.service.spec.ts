import { Test, TestingModule } from '@nestjs/testing';
import { RbacService } from './rbac.service';
import { UserRole } from '../enums/roles.enum';

describe('RbacService', () => {
  let service: RbacService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RbacService],
    }).compile();

    service = module.get<RbacService>(RbacService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hasRole', () => {
    it('should return true when user has higher role hierarchy', () => {
      expect(service.hasRole(UserRole.ADMIN, UserRole.STREAMER)).toBe(true);
      expect(service.hasRole(UserRole.ADMIN, UserRole.DONOR)).toBe(true);
      expect(service.hasRole(UserRole.STREAMER, UserRole.DONOR)).toBe(true);
    });

    it('should return true when user has same role', () => {
      expect(service.hasRole(UserRole.ADMIN, UserRole.ADMIN)).toBe(true);
      expect(service.hasRole(UserRole.STREAMER, UserRole.STREAMER)).toBe(true);
      expect(service.hasRole(UserRole.DONOR, UserRole.DONOR)).toBe(true);
    });

    it('should return false when user has lower role hierarchy', () => {
      expect(service.hasRole(UserRole.DONOR, UserRole.STREAMER)).toBe(false);
      expect(service.hasRole(UserRole.DONOR, UserRole.ADMIN)).toBe(false);
      expect(service.hasRole(UserRole.STREAMER, UserRole.ADMIN)).toBe(false);
    });

    it('should return false for invalid roles', () => {
      expect(service.hasRole('invalid-role', UserRole.ADMIN)).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has any of the required roles', () => {
      expect(
        service.hasAnyRole(UserRole.ADMIN, [UserRole.STREAMER, UserRole.DONOR]),
      ).toBe(true);
      expect(
        service.hasAnyRole(UserRole.STREAMER, [
          UserRole.STREAMER,
          UserRole.DONOR,
        ]),
      ).toBe(true);
    });

    it('should return false when user has none of the required roles', () => {
      expect(
        service.hasAnyRole(UserRole.DONOR, [UserRole.STREAMER, UserRole.ADMIN]),
      ).toBe(false);
    });
  });

  describe('hasAllRoles', () => {
    it('should return true when user has all required roles', () => {
      expect(
        service.hasAllRoles(UserRole.ADMIN, [
          UserRole.ADMIN,
          UserRole.STREAMER,
        ]),
      ).toBe(true);
    });

    it('should return false when user does not have all required roles', () => {
      expect(
        service.hasAllRoles(UserRole.STREAMER, [
          UserRole.ADMIN,
          UserRole.STREAMER,
        ]),
      ).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has the permission', () => {
      expect(service.hasPermission(UserRole.ADMIN, 'users.create')).toBe(true);
      expect(service.hasPermission(UserRole.STREAMER, 'scans.create')).toBe(
        true,
      );
      expect(service.hasPermission(UserRole.DONOR, 'profile.read')).toBe(true);
    });

    it('should return false when user does not have the permission', () => {
      expect(service.hasPermission(UserRole.DONOR, 'users.create')).toBe(false);
      expect(service.hasPermission(UserRole.STREAMER, 'users.delete')).toBe(
        false,
      );
    });

    it('should return false for invalid roles', () => {
      expect(service.hasPermission('invalid-role', 'users.create')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has any of the required permissions', () => {
      expect(
        service.hasAnyPermission(UserRole.ADMIN, [
          'users.create',
          'invalid.permission',
        ]),
      ).toBe(true);
      expect(
        service.hasAnyPermission(UserRole.STREAMER, [
          'scans.create',
          'users.delete',
        ]),
      ).toBe(true);
    });

    it('should return false when user has none of the required permissions', () => {
      expect(
        service.hasAnyPermission(UserRole.DONOR, [
          'users.create',
          'users.delete',
        ]),
      ).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all required permissions', () => {
      expect(
        service.hasAllPermissions(UserRole.ADMIN, [
          'users.create',
          'users.read',
        ]),
      ).toBe(true);
    });

    it('should return false when user does not have all required permissions', () => {
      expect(
        service.hasAllPermissions(UserRole.STREAMER, [
          'scans.create',
          'users.delete',
        ]),
      ).toBe(false);
    });
  });

  describe('getRolePermissions', () => {
    it('should return permissions for valid roles', () => {
      const adminPermissions = service.getRolePermissions(UserRole.ADMIN);
      const streamerPermissions = service.getRolePermissions(UserRole.STREAMER);
      const donorPermissions = service.getRolePermissions(UserRole.DONOR);

      expect(adminPermissions).toContain('users.create');
      expect(streamerPermissions).toContain('scans.create');
      expect(donorPermissions).toContain('profile.read');
    });

    it('should return empty array for invalid roles', () => {
      expect(service.getRolePermissions('invalid-role')).toEqual([]);
    });
  });

  describe('canAccessResource', () => {
    it('should return true for admin accessing any resource', () => {
      expect(service.canAccessResource('user1', 'user2', UserRole.ADMIN)).toBe(
        true,
      );
    });

    it('should return true when user owns the resource', () => {
      expect(
        service.canAccessResource('user1', 'user1', UserRole.STREAMER),
      ).toBe(true);
      expect(service.canAccessResource('user1', 'user1', UserRole.DONOR)).toBe(
        true,
      );
    });

    it('should return false when user does not own the resource', () => {
      expect(
        service.canAccessResource('user1', 'user2', UserRole.STREAMER),
      ).toBe(false);
      expect(service.canAccessResource('user1', 'user2', UserRole.DONOR)).toBe(
        false,
      );
    });
  });

  describe('isValidRole', () => {
    it('should return true for valid roles', () => {
      expect(service.isValidRole(UserRole.ADMIN)).toBe(true);
      expect(service.isValidRole(UserRole.STREAMER)).toBe(true);
      expect(service.isValidRole(UserRole.DONOR)).toBe(true);
    });

    it('should return false for invalid roles', () => {
      expect(service.isValidRole('invalid-role')).toBe(false);
      expect(service.isValidRole('')).toBe(false);
    });
  });

  describe('getRoleHierarchy', () => {
    it('should return correct hierarchy levels', () => {
      expect(service.getRoleHierarchy(UserRole.ADMIN)).toBe(3);
      expect(service.getRoleHierarchy(UserRole.STREAMER)).toBe(2);
      expect(service.getRoleHierarchy(UserRole.DONOR)).toBe(1);
    });

    it('should return 0 for invalid roles', () => {
      expect(service.getRoleHierarchy('invalid-role')).toBe(0);
    });
  });
});
