import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Setup2FADto } from './dto/setup-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
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
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    setup2FA(req: any): Promise<{
        secret: string;
        qrCodeUrl: string;
        message: string;
    }>;
    verifyAndEnable2FA(req: any, setup2FADto: Setup2FADto): Promise<{
        message: string;
    }>;
    verify2FA(req: any, verify2FADto: Verify2FADto): Promise<{
        message: string;
    }>;
    disable2FA(req: any, verify2FADto: Verify2FADto): Promise<{
        message: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            username: string;
            role: string;
            isActive: boolean;
            isEmailVerified: boolean;
            twoFactorEnabled: boolean;
            profilePicture: string;
            coverPhoto: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    refreshToken(req: any): Promise<{
        access_token: string;
    }>;
}
