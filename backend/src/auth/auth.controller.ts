import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Setup2FADto } from './dto/setup-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UsersService } from '../users/users.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('setup-2fa')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA setup initiated' })
  async setup2FA(@Req() req: any) {
    return this.authService.setup2FA(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-2fa')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify and enable 2FA' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  async verifyAndEnable2FA(@Req() req: any, @Body() setup2FADto: Setup2FADto) {
    return this.authService.verifyAndEnable2FA(req.user.sub, setup2FADto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-2fa-code')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify 2FA code for login' })
  @ApiResponse({ status: 200, description: '2FA code verified' })
  async verify2FA(@Req() req: any, @Body() verify2FADto: Verify2FADto) {
    return this.authService.verify2FA(req.user.sub, verify2FADto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('disable-2fa')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  async disable2FA(@Req() req: any, @Body() verify2FADto: Verify2FADto) {
    return this.authService.disable2FA(req.user.sub, verify2FADto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Req() req: any) {
    // For now, just return success - the frontend will handle token removal
    // In the future, you could implement a blacklist or token invalidation
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Req() req: any) {
    // Get full user data from database to include firstName/lastName
    const user = await this.usersService.findById(req.user.sub);
    
    // Return the user profile with the same structure as login
    return {
      user: {
        id: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: false, // TODO: Implement email verification
        twoFactorEnabled: user.twoFactorEnabled,
        profilePicture: user.profilePicture,
        coverPhoto: user.coverPhoto,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refreshToken(@Req() req: any) {
    return this.authService.refreshToken(req.user.sub);
  }
}
