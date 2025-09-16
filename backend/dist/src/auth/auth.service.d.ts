import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Setup2FADto } from './dto/setup-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: string;
            username: any;
            role: any;
            isActive: any;
            isEmailVerified: boolean;
            twoFactorEnabled: any;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            username: string;
            role: string;
            isActive: boolean;
            isEmailVerified: boolean;
            twoFactorEnabled: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    setup2FA(userId: string): Promise<{
        secret: string;
        qrCodeUrl: string;
        message: string;
    }>;
    verifyAndEnable2FA(userId: string, setup2FADto: Setup2FADto): Promise<{
        message: string;
    }>;
    verify2FA(userId: string, verify2FADto: Verify2FADto): Promise<{
        message: string;
    }>;
    disable2FA(userId: string, verify2FADto: Verify2FADto): Promise<{
        message: string;
    }>;
    refreshToken(userId: string): Promise<{
        access_token: string;
    }>;
}
