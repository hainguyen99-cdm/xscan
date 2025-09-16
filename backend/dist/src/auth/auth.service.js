"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password: _, ...result } = user.toObject();
            return result;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
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
                isEmailVerified: false,
                twoFactorEnabled: user.twoFactorEnabled,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    }
    async register(createUserDto) {
        const existingUser = await this.usersService.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        let firstName = createUserDto.firstName;
        let lastName = createUserDto.lastName;
        if (createUserDto.name && !firstName && !lastName) {
            const nameParts = createUserDto.name.trim().split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
        }
        if (firstName && !lastName) {
            lastName = 'User';
        }
        if (!firstName) {
            throw new common_1.BadRequestException('First name is required');
        }
        if (firstName && firstName.length < 2) {
            throw new common_1.BadRequestException('First name must be at least 2 characters long');
        }
        if (lastName && lastName.length < 2) {
            throw new common_1.BadRequestException('Last name must be at least 2 characters long');
        }
        let username = createUserDto.username;
        if (!username) {
            const emailPrefix = createUserDto.email.split('@')[0];
            const randomSuffix = Math.random().toString(36).substring(2, 6);
            username = `${emailPrefix}_${randomSuffix}`;
            let counter = 1;
            while (await this.usersService.findByUsername(username)) {
                username = `${emailPrefix}_${randomSuffix}_${counter}`;
                counter++;
            }
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const userData = {
            ...createUserDto,
            username,
            firstName,
            lastName,
            password: hashedPassword,
            isActive: true,
        };
        const user = await this.usersService.create(userData);
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
                isEmailVerified: false,
                twoFactorEnabled: user.twoFactorEnabled,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    }
    async forgotPassword(forgotPasswordDto) {
        const user = await this.usersService.findByEmail(forgotPasswordDto.email);
        if (!user) {
            return {
                message: 'If an account with that email exists, a password reset link has been sent',
            };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.usersService.setPasswordResetToken(user._id, resetToken, resetTokenExpiry);
        return { message: 'Password reset link has been sent to your email' };
    }
    async resetPassword(resetPasswordDto) {
        const user = await this.usersService.findByPasswordResetToken(resetPasswordDto.token);
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        if (user.passwordResetExpires < new Date()) {
            throw new common_1.BadRequestException('Reset token has expired');
        }
        const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
        await this.usersService.resetPassword(user._id, hashedPassword);
        return { message: 'Password has been reset successfully' };
    }
    async setup2FA(userId) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.twoFactorEnabled) {
            throw new common_1.BadRequestException('Two-factor authentication is already enabled');
        }
        const secret = speakeasy.generateSecret({
            name: `XScan:${user.email}`,
            issuer: 'XScan',
        });
        await this.usersService.setTwoFactorSecret(user._id, secret.base32);
        const qrCodeUrl = await QRCode.toDataURL(`otpauth://totp/XScan:${user.email}?secret=${secret.base32}&issuer=XScan`);
        return {
            secret: secret.base32,
            qrCodeUrl,
            message: 'Scan the QR code with your authenticator app and enter the code to enable 2FA',
        };
    }
    async verifyAndEnable2FA(userId, setup2FADto) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.twoFactorSecret) {
            throw new common_1.BadRequestException('Please setup 2FA first');
        }
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: setup2FADto.code,
            window: 2,
        });
        if (!verified) {
            throw new common_1.BadRequestException('Invalid 2FA code');
        }
        await this.usersService.enableTwoFactor(user._id);
        return { message: 'Two-factor authentication enabled successfully' };
    }
    async verify2FA(userId, verify2FADto) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.twoFactorEnabled || !user.twoFactorSecret) {
            throw new common_1.BadRequestException('Two-factor authentication is not enabled');
        }
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: verify2FADto.code,
            window: 2,
        });
        if (!verified) {
            throw new common_1.BadRequestException('Invalid 2FA code');
        }
        return { message: 'Two-factor authentication verified successfully' };
    }
    async disable2FA(userId, verify2FADto) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.twoFactorEnabled) {
            throw new common_1.BadRequestException('Two-factor authentication is not enabled');
        }
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: verify2FADto.code,
            window: 2,
        });
        if (!verified) {
            throw new common_1.BadRequestException('Invalid 2FA code');
        }
        await this.usersService.disableTwoFactor(user._id);
        return { message: 'Two-factor authentication disabled successfully' };
    }
    async refreshToken(userId) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const payload = { email: user.email, sub: user._id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map