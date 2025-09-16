import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Setup2FADto } from './dto/setup-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user.toObject();
      return result;
    }

    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    await this.usersService.updateLastLogin(user._id);

    const payload = { email: user.email, sub: user._id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: false, // TODO: Implement email verification
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Handle name field from frontend - split into firstName and lastName
    let firstName = createUserDto.firstName;
    let lastName = createUserDto.lastName;

    // If name is provided instead of firstName/lastName, split it
    if ((createUserDto as any).name && !firstName && !lastName) {
      const nameParts = (createUserDto as any).name.trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Handle case where only first name is provided (e.g., "John" -> firstName: "John", lastName: "User")
    if (firstName && !lastName) {
      lastName = 'User'; // Default last name for single names
    }

    // Handle case where no names are provided (should not happen with proper frontend validation)
    if (!firstName) {
      throw new BadRequestException('First name is required');
    }

    // Ensure firstName and lastName are at least 2 characters
    if (firstName && firstName.length < 2) {
      throw new BadRequestException(
        'First name must be at least 2 characters long',
      );
    }
    if (lastName && lastName.length < 2) {
      throw new BadRequestException(
        'Last name must be at least 2 characters long',
      );
    }

    // Generate username if not provided
    let username = createUserDto.username;
    if (!username) {
      const emailPrefix = createUserDto.email.split('@')[0];
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      username = `${emailPrefix}_${randomSuffix}`;

      // Ensure username is unique
      let counter = 1;
      while (await this.usersService.findByUsername(username)) {
        username = `${emailPrefix}_${randomSuffix}_${counter}`;
        counter++;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user with hashed password
    const userData = {
      ...createUserDto,
      username,
      firstName,
      lastName,
      password: hashedPassword,
      isActive: true,
    };

    const user = await this.usersService.create(userData);

    // Generate JWT token for automatic login
    const payload = { email: user.email, sub: user._id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: false, // TODO: Implement email verification
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        message:
          'If an account with that email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store reset token in user document
    await this.usersService.setPasswordResetToken(
      user._id,
      resetToken,
      resetTokenExpiry,
    );

    // For now, just return success message since email service is disabled
    // TODO: Re-enable email service when available
    return { message: 'Password reset link has been sent to your email' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByPasswordResetToken(
      resetPasswordDto.token,
    );

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);

    // Update password and clear reset token
    await this.usersService.resetPassword(user._id, hashedPassword);

    return { message: 'Password has been reset successfully' };
  }

  async setup2FA(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException(
        'Two-factor authentication is already enabled',
      );
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `XScan:${user.email}`,
      issuer: 'XScan',
    });

    // Store secret temporarily
    await this.usersService.setTwoFactorSecret(user._id, secret.base32);

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(
      `otpauth://totp/XScan:${user.email}?secret=${secret.base32}&issuer=XScan`,
    );

    return {
      secret: secret.base32,
      qrCodeUrl,
      message:
        'Scan the QR code with your authenticator app and enter the code to enable 2FA',
    };
  }

  async verifyAndEnable2FA(userId: string, setup2FADto: Setup2FADto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('Please setup 2FA first');
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: setup2FADto.code,
      window: 2, // Allow 2 time steps in case of slight time differences
    });

    if (!verified) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Enable 2FA
    await this.usersService.enableTwoFactor(user._id);

    // Email service is temporarily disabled
    // TODO: Re-enable when email service is available
    return { message: 'Two-factor authentication enabled successfully' };
  }

  async verify2FA(userId: string, verify2FADto: Verify2FADto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: verify2FADto.code,
      window: 2,
    });

    if (!verified) {
      throw new BadRequestException('Invalid 2FA code');
    }

    return { message: 'Two-factor authentication verified successfully' };
  }

  async disable2FA(userId: string, verify2FADto: Verify2FADto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    // Verify the code before disabling
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: verify2FADto.code,
      window: 2,
    });

    if (!verified) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Disable 2FA
    await this.usersService.disableTwoFactor(user._id);

    return { message: 'Two-factor authentication disabled successfully' };
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { email: user.email, sub: user._id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
