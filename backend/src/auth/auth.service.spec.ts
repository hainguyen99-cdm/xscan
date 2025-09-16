import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    updateLastLogin: jest.fn(),
    setPasswordResetToken: jest.fn(),
    findByPasswordResetToken: jest.fn(),
    resetPassword: jest.fn(),
    setTwoFactorSecret: jest.fn(),
    enableTwoFactor: jest.fn(),
    disableTwoFactor: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return user data and token for valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash('password123', 10);

      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        role: 'donor',
        isActive: true,
        twoFactorEnabled: false,
        password: hashedPassword,
        toObject: () => ({
          _id: 'user-id',
          email: 'test@example.com',
          username: 'testuser',
          role: 'donor',
          isActive: true,
          twoFactorEnabled: false,
        }),
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.updateLastLogin.mockResolvedValue(undefined);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          username: 'testuser',
          role: 'donor',
          isActive: true,
          twoFactorEnabled: false,
        },
      });

      expect(mockUsersService.updateLastLogin).toHaveBeenCalledWith('user-id');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: 'user-id',
        role: 'donor',
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await bcrypt.hash('password123', 10);

      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        password: hashedPassword,
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should create user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'donor',
      };

      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        role: 'donor',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register(createUserDto);

      expect(result).toEqual({
        message: 'Registration successful',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          username: 'testuser',
          role: 'donor',
          isActive: true,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      });
    });

    it('should throw ConflictException for existing email', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'donor',
      };

      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
