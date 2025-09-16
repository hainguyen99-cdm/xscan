import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  ProfilePrivacyDto,
  ProfileVisibility,
} from './dto/profile-privacy.dto';
import { ProfileExportDto, ExportFormat } from './dto/profile-export.dto';
import { ProfileDeletionDto } from './dto/profile-deletion.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  const mockUser = {
    _id: 'user-id',
    email: 'test@example.com',
    username: 'testuser',
    role: 'donor',
    isActive: true,
    twoFactorEnabled: false,
    password: 'hashedPassword',
    toObject: () => ({
      _id: 'user-id',
      email: 'test@example.com',
      username: 'testuser',
      role: 'donor',
      isActive: true,
      twoFactorEnabled: false,
    }),
  };

  const mockUserModel = {
    new: jest.fn().mockResolvedValue(mockUser),
    constructor: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await service.findById('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('calculateProfileCompletion', () => {
    it('should calculate profile completion percentage', async () => {
      const userWithCompleteProfile = {
        ...mockUser,
        phone: '+1234567890',
        address: '123 Main St',
        profilePicture: 'profile.jpg',
      };

      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithCompleteProfile),
      } as any);

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithCompleteProfile),
      } as any);

      const result = await service.calculateProfileCompletion(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toBe(100);
    });

    it('should calculate partial profile completion', async () => {
      const userWithPartialProfile = {
        ...mockUser,
        phone: '+1234567890',
        // Missing address and profilePicture
      };

      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithPartialProfile),
      } as any);

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithPartialProfile),
      } as any);

      const result = await service.calculateProfileCompletion(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toBe(75); // 6 out of 8 fields completed (75%)
    });
  });

  describe('updatePrivacySettings', () => {
    it('should update privacy settings', async () => {
      const privacyDto: ProfilePrivacyDto = {
        profileVisibility: ProfileVisibility.PRIVATE,
        showEmail: false,
        showPhone: true,
        showAddress: false,
        showLastLogin: true,
      };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockUser, ...privacyDto }),
      } as any);

      const result = await service.updatePrivacySettings(
        '507f1f77bcf86cd799439011',
        privacyDto,
      );
      expect(result.profileVisibility).toBe(ProfileVisibility.PRIVATE);
    });
  });

  describe('getPublicProfile', () => {
    it('should return public profile with privacy settings', async () => {
      const userWithPrivacySettings = {
        ...mockUser,
        address: '123 Main St', // Add address to mock user
        showEmail: true,
        showPhone: false,
        showAddress: true,
        showLastLogin: false,
      };

      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithPrivacySettings),
      } as any);

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithPrivacySettings),
      } as any);

      const result = await service.getPublicProfile(
        '507f1f77bcf86cd799439011',
        'viewer123',
      );
      expect(result.email).toBeDefined();
      expect(result.phone).toBeUndefined();
      expect(result.address).toBeDefined();
      expect(result.lastLoginAt).toBeUndefined();
    });
  });

  describe('exportProfile', () => {
    it('should export profile data', async () => {
      const exportDto: ProfileExportDto = {
        format: ExportFormat.JSON,
        fields: ['username', 'email', 'firstName', 'lastName'],
        includeSensitiveData: false,
      };

      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await service.exportProfile(
        '507f1f77bcf86cd799439011',
        exportDto,
      );
      expect(result.username).toBe('testuser');
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('Test');
      expect(result.lastName).toBe('User');
    });
  });

  describe('getProfileStats', () => {
    it('should return profile statistics', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await service.getProfileStats('507f1f77bcf86cd799439011');
      expect(result.profileCompletionPercentage).toBe(80);
      expect(result.profileViews).toBe(10);
      expect(result.profileViewers).toBe(2);
      expect(result.verificationBadges).toEqual(['verified']);
    });
  });

  describe('addVerificationBadge', () => {
    it('should add verification badge', async () => {
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      await service.addVerificationBadge(
        '507f1f77bcf86cd799439011',
        'verified',
      );
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          $addToSet: { verificationBadges: 'verified' },
        },
      );
    });
  });

  describe('removeVerificationBadge', () => {
    it('should remove verification badge', async () => {
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      await service.removeVerificationBadge(
        '507f1f77bcf86cd799439011',
        'verified',
      );
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          $pull: { verificationBadges: 'verified' },
        },
      );
    });
  });
});
