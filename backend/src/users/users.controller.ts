import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { FileUploadService } from './services/file-upload.service';
import { ProfileService } from './services/profile.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfilePrivacyDto } from './dto/profile-privacy.dto';
import { ProfileExportDto } from './dto/profile-export.dto';
import { ProfileDeletionDto } from './dto/profile-deletion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { OwnershipGuard } from '../common/guards/ownership.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { RequireOwnership } from '../common/decorators/ownership.decorator';
import { UserRole } from '../common/enums/roles.enum';
import * as multer from 'multer';
import { BankAccountService } from './services/bank-account.service';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto/bank-account.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly fileUploadService: FileUploadService,
    private readonly profileService: ProfileService,
    private readonly bankAccountService: BankAccountService,
  ) {}

  @Get('discover/streamers')
  @ApiOperation({ summary: 'Discover streamers for donation (Public endpoint)' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search query for streamer name, username, or category',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by streamer category',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
  })
  @ApiResponse({ status: 200, description: 'Streamers retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async discoverStreamers(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.usersService.discoverStreamers(search, category, page, limit);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN)
  @RequirePermissions('users.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN)
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter by user role',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter by active status',
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findAll(@Query('role') role?: string, @Query('active') active?: string) {
    if (role) {
      return this.usersService.findUsersByRole(role);
    }
    if (active === 'true') {
      return this.usersService.findActiveUsers();
    }
    return this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('profile.read')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.sub);
  }

  @Get('profile/stats')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('profile.read')
  @ApiOperation({ summary: 'Get current user profile statistics' })
  @ApiResponse({
    status: 200,
    description: 'Profile statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfileStats(@Request() req) {
    return this.usersService.getProfileStats(req.user.sub);
  }

  @Get('profile/donations')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('profile.read')
  @ApiOperation({ summary: 'Get donation totals for current user (streamer)' })
  @ApiResponse({ status: 200, description: 'Donation totals retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDonationTotals(@Request() req) {
    return this.usersService.getDonationTotals(req.user.sub);
  }

  @Get('profile/completion')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('profile.read')
  @ApiOperation({ summary: 'Get current user profile completion percentage' })
  @ApiResponse({
    status: 200,
    description: 'Profile completion retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfileCompletion(@Request() req) {
    return this.usersService.calculateProfileCompletion(req.user.sub);
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Get public profile by user ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Public profile retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or profile is private',
  })
  getPublicProfile(@Param('id') id: string, @Request() req) {
    const viewerId = req.user?.sub;
    return this.usersService.getPublicProfile(id, viewerId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN)
  @RequirePermissions('users.stats')
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getStats() {
    const [totalUsers, activeUsers] = await Promise.all([
      this.usersService.countUsers(),
      this.usersService.countActiveUsers(),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
    };
  }

  @Get('id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN)
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN)
  @RequirePermissions('users.update')
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('profile/update')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('profile.update')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.sub, updateUserDto);
  }

  @Patch('profile/privacy')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('profile.update')
  @ApiOperation({ summary: 'Update current user privacy settings' })
  @ApiResponse({
    status: 200,
    description: 'Privacy settings updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updatePrivacySettings(@Request() req, @Body() privacyDto: ProfilePrivacyDto) {
    return this.usersService.updatePrivacySettings(req.user.sub, privacyDto);
  }

  @Post('profile/picture')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('profile.update')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiResponse({
    status: 200,
    description: 'Profile picture uploaded successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadProfilePicture(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No file provided');
    }

    // Upload the file and get the file path
    const filePath = await this.fileUploadService.uploadProfilePicture(
      file,
      req.user.sub,
    );

    // Update user's profile picture
    const updatedUser = await this.usersService.update(req.user.sub, {
      profilePicture: filePath,
    });

    return {
      message: 'Profile picture uploaded successfully',
      profilePicture: this.fileUploadService.getProfilePictureUrl(filePath),
      user: updatedUser,
    };
  }

  @Post('profile/cover')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('profile.update')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit for cover photos
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload cover photo' })
  @ApiResponse({
    status: 200,
    description: 'Cover photo uploaded successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadCoverPhoto(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No file provided');
    }

    // Upload the file and get the file path
    const filePath = await this.fileUploadService.uploadCoverPhoto(
      file,
      req.user.sub,
    );

    // Update user's cover photo
    const updatedUser = await this.usersService.update(req.user.sub, {
      coverPhoto: filePath,
    });

    return {
      message: 'Cover photo uploaded successfully',
      coverPhoto: this.fileUploadService.getCoverPhotoUrl(filePath),
      user: updatedUser,
    };
  }

  @Post('profile/export')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('profile.read')
  @ApiOperation({ summary: 'Export current user profile data' })
  @ApiResponse({ status: 200, description: 'Profile exported successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  exportProfile(@Request() req, @Body() exportDto: ProfileExportDto) {
    return this.usersService.exportProfile(req.user.sub, exportDto);
  }

  @Post('profile/deletion-request')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('profile.delete')
  @ApiOperation({ summary: 'Request account deletion' })
  @ApiResponse({
    status: 200,
    description: 'Deletion request submitted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid password' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  requestDeletion(@Request() req, @Body() deletionDto: ProfileDeletionDto) {
    return this.usersService.requestDeletion(req.user.sub, deletionDto);
  }

  @Delete('profile/deletion-request')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('profile.delete')
  @ApiOperation({ summary: 'Cancel account deletion request' })
  @ApiResponse({
    status: 200,
    description: 'Deletion request cancelled successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  cancelDeletionRequest(@Request() req) {
    return this.usersService.cancelDeletionRequest(req.user.sub);
  }

  @Patch('profile/change-password')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('profile.password')
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.sub, changePasswordDto);
  }

  @Patch('id/:id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN)
  @RequirePermissions('users.activate')
  @ApiOperation({ summary: 'Activate user account (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  @Patch('id/:id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN)
  @RequirePermissions('users.deactivate')
  @ApiOperation({ summary: 'Deactivate user account (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch('id/:id/badges/:badge')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN)
  @RequirePermissions('users.update')
  @ApiOperation({ summary: 'Add verification badge to user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'badge', description: 'Badge name' })
  @ApiResponse({ status: 200, description: 'Badge added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  addVerificationBadge(@Param('id') id: string, @Param('badge') badge: string) {
    return this.usersService.addVerificationBadge(id, badge);
  }

  @Delete('id/:id/badges/:badge')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN)
  @RequirePermissions('users.update')
  @ApiOperation({ summary: 'Remove verification badge from user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'badge', description: 'Badge name' })
  @ApiResponse({ status: 200, description: 'Badge removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  removeVerificationBadge(
    @Param('id') id: string,
    @Param('badge') badge: string,
  ) {
    return this.usersService.removeVerificationBadge(id, badge);
  }

  @Delete('id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN)
  @RequirePermissions('users.delete')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('streamer/:username')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get streamer profile by username (Public endpoint, optional auth to resolve follow state)' })
  @ApiParam({ name: 'username', description: 'Streamer username' })
  @ApiResponse({ status: 200, description: 'Streamer profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Streamer not found' })
  async getStreamerProfile(@Param('username') username: string, @Request() req) {
    // Extract user ID from JWT token if available (optional authentication)
    const currentUserId = req.user?.sub;
    return this.usersService.getStreamerProfile(username, currentUserId);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Follow or unfollow a streamer' })
  @ApiParam({ name: 'id', description: 'Streamer ID' })
  @ApiResponse({ status: 200, description: 'Follow status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Streamer not found' })
  async toggleFollow(@Request() req, @Param('id') streamerId: string) {
    return this.usersService.toggleFollow(req.user.sub, streamerId);
  }

  // Bank Account Management Endpoints
  @Get('bank-accounts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user bank accounts' })
  @ApiResponse({ status: 200, description: 'Bank accounts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserBankAccounts(@Request() req) {
    return this.bankAccountService.getUserBankAccounts(req.user.sub);
  }

  @Post('bank-accounts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new bank account' })
  @ApiResponse({ status: 201, description: 'Bank account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Bank account already exists' })
  async createBankAccount(
    @Request() req,
    @Body() createBankAccountDto: CreateBankAccountDto,
  ) {
    return this.bankAccountService.createBankAccount(req.user.sub, createBankAccountDto);
  }

  @Get('bank-accounts/:accountId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific bank account' })
  @ApiParam({ name: 'accountId', description: 'Bank account ID' })
  @ApiResponse({ status: 200, description: 'Bank account retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  async getBankAccount(
    @Request() req,
    @Param('accountId') accountId: string,
  ) {
    return this.bankAccountService.getBankAccount(req.user.sub, accountId);
  }

  @Patch('bank-accounts/:accountId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a bank account' })
  @ApiParam({ name: 'accountId', description: 'Bank account ID' })
  @ApiResponse({ status: 200, description: 'Bank account updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  @ApiResponse({ status: 409, description: 'Bank account already exists' })
  async updateBankAccount(
    @Request() req,
    @Param('accountId') accountId: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ) {
    return this.bankAccountService.updateBankAccount(req.user.sub, accountId, updateBankAccountDto);
  }

  @Delete('bank-accounts/:accountId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a bank account' })
  @ApiParam({ name: 'accountId', description: 'Bank account ID' })
  @ApiResponse({ status: 200, description: 'Bank account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  async deleteBankAccount(
    @Request() req,
    @Param('accountId') accountId: string,
  ) {
    return this.bankAccountService.deleteBankAccount(req.user.sub, accountId);
  }

  @Patch('bank-accounts/:accountId/set-default')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Set a bank account as default' })
  @ApiParam({ name: 'accountId', description: 'Bank account ID' })
  @ApiResponse({ status: 200, description: 'Default bank account updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  async setDefaultBankAccount(
    @Request() req,
    @Param('accountId') accountId: string,
  ) {
    return this.bankAccountService.setDefaultBankAccount(req.user.sub, accountId);
  }

  @Get('bank-accounts/stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get bank account statistics' })
  @ApiResponse({ status: 200, description: 'Bank account statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBankAccountStats(@Request() req) {
    return this.bankAccountService.getBankAccountStats(req.user.sub);
  }
}
