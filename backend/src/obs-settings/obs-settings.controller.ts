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
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { OBSSettingsService } from './obs-settings.service';
import { OBSWidgetGateway } from './obs-widget.gateway';
import { CreateOBSSettingsDto, UpdateOBSSettingsDto, OBSSettingsResponseDto, WidgetUrlResponseDto, WidgetConnectionStatusDto, FullWidgetUrlResponseDto, TokenVerificationResponseDto, TokenRenderResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { MediaUploadService } from '../common/services/media-upload.service';
import { TestAlertDto, TestAlertResponseDto, DonationAlertDto, DonationAlertResponseDto } from './dto/configuration.dto';
import { SavePresetDto, PresetDto, ConfigurationValidationDto, ExportConfigurationDto, ImportConfigurationDto, TestResultDto, ResetSectionDto, TemplateDto } from './dto/configuration.dto';
import { RevokeTokenDto, UpdateSecuritySettingsDto, SecurityStatusDto, SecurityAuditResponseDto } from './dto/security.dto';
import { Request as ExpressRequest } from 'express';
import { randomBytes } from 'crypto';

@ApiTags('OBS Settings')
@Controller('obs-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OBSSettingsController {
  constructor(
    private readonly obsSettingsService: OBSSettingsService,
    private readonly mediaUploadService: MediaUploadService,
    private readonly obsWidgetGateway: OBSWidgetGateway,
  ) {}

  @Post()
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create OBS settings for a streamer' })
  @ApiResponse({
    status: 201,
    description: 'OBS settings created successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'OBS settings already exist for this streamer' })
  async create(
    @Body() createOBSSettingsDto: CreateOBSSettingsDto,
    @Request() req,
  ): Promise<OBSSettingsResponseDto> {
    // Ensure streamer can only create settings for themselves (unless admin)
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== createOBSSettingsDto.streamerId) {
      createOBSSettingsDto.streamerId = req.user.sub;
    }

    const settings = await this.obsSettingsService.create(createOBSSettingsDto);
    return settings.toObject();
  }

  @Get('my-settings')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get current user\'s OBS settings' })
  @ApiResponse({
    status: 200,
    description: 'OBS settings retrieved successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async getMySettings(@Request() req): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.findByStreamerId(req.user.sub);
    const settingsObj = settings.toObject();
    
    // Add widgetUrl to the response
    const widgetUrlData = await this.obsSettingsService.getWidgetUrl(req.user.sub);
    settingsObj.widgetUrl = widgetUrlData.widgetUrl;
    
    return settingsObj;
  }

  @Get('streamer/:streamerId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get OBS settings by streamer ID (Admin only)' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiResponse({
    status: 200,
    description: 'OBS settings retrieved successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async getByStreamerId(@Param('streamerId') streamerId: string): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.findByStreamerId(streamerId);
    const settingsObj = settings.toObject();
    
    // Add widgetUrl to the response
    const widgetUrlData = await this.obsSettingsService.getWidgetUrl(streamerId);
    settingsObj.widgetUrl = widgetUrlData.widgetUrl;
    
    return settingsObj;
  }

  @Get('token/:alertToken')
  @ApiOperation({ summary: 'Get OBS settings by alert token (Public endpoint for OBS widget)' })
  @ApiParam({ name: 'alertToken', description: 'Alert token for OBS widget' })
  @ApiResponse({
    status: 200,
    description: 'OBS settings retrieved successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async getByAlertToken(@Param('alertToken') alertToken: string): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.findByAlertToken(alertToken);
    return settings.toObject();
  }

  @Get('widget-url/:streamerId')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get widget URL for OBS setup' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiResponse({
    status: 200,
    description: 'Widget URL retrieved successfully',
    type: WidgetUrlResponseDto
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async getWidgetUrl(@Param('streamerId') streamerId: string, @Request() req): Promise<WidgetUrlResponseDto> {
    // Ensure streamer can only get their own widget URL (unless admin)
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== streamerId) {
      throw new BadRequestException('You can only access your own widget URL');
    }

    return this.obsSettingsService.getWidgetUrl(streamerId);
  }

  @Get('widget-status/:streamerId')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get OBS widget connection status' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiResponse({
    status: 200,
    description: 'Widget status retrieved successfully',
    type: WidgetConnectionStatusDto
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async getWidgetStatus(@Param('streamerId') streamerId: string, @Request() req): Promise<WidgetConnectionStatusDto> {
    // Ensure streamer can only get their own widget status (unless admin)
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== streamerId) {
      throw new BadRequestException('You can only access your own widget status');
    }

    return this.obsSettingsService.getWidgetStatus(streamerId);
  }

  @Get('widget-url/:streamerId/full')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get full widget URL with alert token for verification' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiResponse({
    status: 200,
    description: 'Full widget URL retrieved successfully',
    type: FullWidgetUrlResponseDto
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async getFullWidgetUrl(@Param('streamerId') streamerId: string, @Request() req): Promise<FullWidgetUrlResponseDto> {
    // Ensure streamer can only get their own full widget URL (unless admin)
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== streamerId) {
      throw new BadRequestException('You can only access your own full widget URL');
    }

    return this.obsSettingsService.getFullWidgetUrl(streamerId);
  }

  @Get('verify/:streamerId/:alertToken')
  @ApiOperation({ summary: 'Verify alert token for Widget URL format (Public endpoint)' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiParam({ name: 'alertToken', description: 'Alert token for verification' })
  @ApiResponse({
    status: 200,
    description: 'Alert token verified successfully',
    type: TokenVerificationResponseDto
  })
  @ApiResponse({ status: 404, description: 'Alert token not found or invalid' })
  async verifyAlertToken(
    @Param('streamerId') streamerId: string,
    @Param('alertToken') alertToken: string
  ): Promise<TokenVerificationResponseDto> {
    try {
      const settings = await this.obsSettingsService.findByAlertToken(alertToken);
      
      // Check if the streamerId matches
      if (settings.streamerId.toString() !== streamerId) {
        return {
          isValid: false,
          streamerId,
          alertToken,
          widgetUrl: '',
          message: 'Alert token does not match the provided streamer ID'
        };
      }

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const widgetUrl = `${baseUrl}/widget/alert/${streamerId}/${alertToken}`;

      return {
        isValid: true,
        streamerId,
        alertToken,
        widgetUrl,
        message: 'Alert token verified successfully'
      };
    } catch (error) {
      return {
        isValid: false,
        streamerId,
        alertToken,
        widgetUrl: '',
        message: 'Alert token not found or invalid'
      };
    }
  }

  @Get('render-token/:streamerId')
  @ApiOperation({ summary: 'Render alert token for Widget URL format (Public endpoint)' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiResponse({
    status: 200,
    description: 'Alert token rendered successfully',
    type: TokenRenderResponseDto
  })
  @ApiResponse({ status: 404, description: 'Streamer not found or no OBS settings' })
  async renderAlertToken(@Param('streamerId') streamerId: string): Promise<TokenRenderResponseDto> {
    try {
      const settings = await this.obsSettingsService.findByStreamerId(streamerId);
      
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const widgetUrl = `${baseUrl}/widget/alert/${streamerId}/${settings.alertToken}`;

      return {
        streamerId,
        alertToken: settings.alertToken,
        widgetUrl,
        message: 'Alert token rendered successfully for Widget URL'
      };
    } catch (error) {
      throw new NotFoundException('Streamer not found or no OBS settings configured');
    }
  }

  @Get('my-widget-url')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get current user\'s widget URL for OBS setup' })
  @ApiResponse({
    status: 200,
    description: 'Widget URL retrieved successfully',
    type: WidgetUrlResponseDto
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async getMyWidgetUrl(@Request() req): Promise<WidgetUrlResponseDto> {
    return this.obsSettingsService.getWidgetUrl(req.user.sub);
  }

  @Get('my-widget-status')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get current user\'s OBS widget connection status' })
  @ApiResponse({
    status: 200,
    description: 'Widget status retrieved successfully',
    type: WidgetConnectionStatusDto
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async getMyWidgetStatus(@Request() req): Promise<WidgetConnectionStatusDto> {
    return this.obsSettingsService.getWidgetStatus(req.user.sub);
  }

  @Post('my-widget-url/regenerate')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Regenerate current user\'s widget URL and alert token for security' })
  @ApiResponse({
    status: 200,
    description: 'Widget URL regenerated successfully',
    type: WidgetUrlResponseDto
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async regenerateMyWidgetUrl(@Request() req): Promise<WidgetUrlResponseDto> {
    // This will regenerate the alert token and return the new widget URL
    await this.obsSettingsService.regenerateAlertToken(req.user.sub);
    return this.obsSettingsService.getWidgetUrl(req.user.sub);
  }

  @Post('my-widget-url/test-connection')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Test current user\'s OBS widget connection by sending a test alert' })
  @ApiResponse({
    status: 200,
    description: 'Connection test completed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        connectedWidgets: { type: 'number' },
        testAlertSent: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async testMyWidgetConnection(@Request() req): Promise<{
    success: boolean;
    message: string;
    connectedWidgets: number;
    testAlertSent: boolean;
  }> {
    const connectedWidgets = this.obsWidgetGateway.getStreamerClientCount(req.user.sub);
    const isConnected = connectedWidgets > 0;
    
    let testAlertSent = false;
    if (isConnected) {
      // Send a test alert to verify the connection
      try {
        await this.obsSettingsService.triggerTestAlert(req.user.sub, {
          donorName: 'Connection Test',
          amount: '0.00',
          message: 'Testing widget connection...',
          useCurrentSettings: true
        });
        testAlertSent = true;
      } catch (error) {
        console.error('Failed to send test alert:', error);
      }
    }

    return {
      success: isConnected,
      message: isConnected 
        ? 'Widget is connected and ready to receive alerts' 
        : 'No widgets are currently connected. Please check your OBS setup.',
      connectedWidgets,
      testAlertSent
    };
  }

  @Post('widget-url/:streamerId/regenerate')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Regenerate widget URL and alert token for security' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiResponse({
    status: 200,
    description: 'Widget URL regenerated successfully',
    type: WidgetUrlResponseDto
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async regenerateWidgetUrl(@Param('streamerId') streamerId: string, @Request() req): Promise<WidgetUrlResponseDto> {
    // Ensure streamer can only regenerate their own widget URL (unless admin)
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== streamerId) {
      throw new BadRequestException('You can only regenerate your own widget URL');
    }

    // This will regenerate the alert token and return the new widget URL
    const settings = await this.obsSettingsService.regenerateAlertToken(streamerId);
    return this.obsSettingsService.getWidgetUrl(streamerId);
  }

  @Post('widget-url/:streamerId/test-connection')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Test OBS widget connection by sending a test alert' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiResponse({
    status: 200,
    description: 'Connection test completed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        connectedWidgets: { type: 'number' },
        testAlertSent: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async testWidgetConnection(@Param('streamerId') streamerId: string, @Request() req): Promise<{
    success: boolean;
    message: string;
    connectedWidgets: number;
    testAlertSent: boolean;
  }> {
    // Ensure streamer can only test their own widget connection (unless admin)
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== streamerId) {
      throw new BadRequestException('You can only test your own widget connection');
    }

    const connectedWidgets = this.obsWidgetGateway.getStreamerClientCount(streamerId);
    const isConnected = connectedWidgets > 0;
    
    let testAlertSent = false;
    if (isConnected) {
      // Send a test alert to verify the connection
      try {
        await this.obsSettingsService.triggerTestAlert(streamerId, {
          donorName: 'Connection Test',
          amount: '0.00',
          message: 'Testing widget connection...',
          useCurrentSettings: true
        });
        testAlertSent = true;
      } catch (error) {
        console.error('Failed to send test alert:', error);
      }
    }

    return {
      success: isConnected,
      message: isConnected 
        ? 'Widget is connected and ready to receive alerts' 
        : 'No widgets are currently connected. Please check your OBS setup.',
      connectedWidgets,
      testAlertSent
    };
  }

  @Patch('my-settings')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update current user\'s OBS settings' })
  @ApiResponse({
    status: 200,
    description: 'OBS settings updated successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async updateMySettings(
    @Body() updateOBSSettingsDto: UpdateOBSSettingsDto,
    @Request() req,
  ): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.update(req.user.sub, updateOBSSettingsDto);
    return settings.toObject();
  }

  @Patch(':streamerId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update OBS settings by streamer ID (Admin only)' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiResponse({
    status: 200,
    description: 'OBS settings updated successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async updateByStreamerId(
    @Param('streamerId') streamerId: string,
    @Body() updateOBSSettingsDto: UpdateOBSSettingsDto,
  ): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.update(streamerId, updateOBSSettingsDto);
    return settings.toObject();
  }

  @Delete('my-settings')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user\'s OBS settings' })
  @ApiResponse({ status: 204, description: 'OBS settings deleted successfully' })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async deleteMySettings(@Request() req): Promise<void> {
    await this.obsSettingsService.delete(req.user.sub);
  }

  @Delete(':streamerId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete OBS settings by streamer ID (Admin only)' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiResponse({ status: 204, description: 'OBS settings deleted successfully' })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async deleteByStreamerId(@Param('streamerId') streamerId: string): Promise<void> {
    await this.obsSettingsService.delete(streamerId);
  }

  @Post('my-settings/toggle-active')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle current user\'s OBS settings active status' })
  @ApiResponse({
    status: 200,
    description: 'OBS settings active status toggled successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async toggleMySettingsActive(@Request() req): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.toggleActive(req.user.sub);
    return settings.toObject();
  }

  @Post(':streamerId/toggle-active')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle OBS settings active status by streamer ID (Admin only)' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiResponse({
    status: 200,
    description: 'OBS settings active status toggled successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async toggleActiveByStreamerId(@Param('streamerId') streamerId: string): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.toggleActive(streamerId);
    return settings.toObject();
  }

  @Post('my-settings/regenerate-token')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Regenerate alert token for current user\'s OBS settings' })
  @ApiResponse({
    status: 200,
    description: 'Alert token regenerated successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async regenerateMyAlertToken(@Request() req): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.regenerateAlertToken(req.user.sub);
    return settings.toObject();
  }

  @Post(':streamerId/regenerate-token')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Regenerate alert token for OBS settings by streamer ID (Admin only)' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiResponse({
    status: 200,
    description: 'Alert token regenerated successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async regenerateAlertTokenByStreamerId(@Param('streamerId') streamerId: string): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.regenerateAlertToken(streamerId);
    return settings.toObject();
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all OBS settings (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'All OBS settings retrieved successfully',
    type: [OBSSettingsResponseDto],
  })
  async findAll(): Promise<OBSSettingsResponseDto[]> {
    const settings = await this.obsSettingsService.findAll();
    return settings.map(setting => setting.toObject());
  }

  @Get('stats/overview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get OBS settings statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalSettings: { type: 'number' },
        activeSettings: { type: 'number' },
        totalAlerts: { type: 'number' },
        averageAlertsPerSetting: { type: 'number' },
      },
    },
  })
  async getStats() {
    return this.obsSettingsService.getStats();
  }

  @Post('my-settings/upload-media')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Upload media for current user\'s OBS settings' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Media file to upload (image, gif, video, or audio)',
        },
        mediaType: {
          type: 'string',
          enum: ['image', 'gif', 'video', 'audio'],
          description: 'Type of media being uploaded',
        },
        settingsType: {
          type: 'string',
          enum: ['image', 'sound'],
          description: 'Which settings to update (image or sound)',
        },
      },
      required: ['file', 'mediaType', 'settingsType'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Media uploaded and OBS settings updated successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or validation error' })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async uploadMediaForMySettings(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('mediaType') mediaType: string,
    @Body('settingsType') settingsType: string,
  ): Promise<OBSSettingsResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!mediaType || !settingsType) {
      throw new BadRequestException('Media type and settings type are required');
    }

    // Validate settings type
    if (!['image', 'sound'].includes(settingsType)) {
      throw new BadRequestException('Settings type must be either "image" or "sound"');
    }

    // Convert Express.Multer.File to MediaFile interface
    const mediaFile: any = { // MediaFile interface is not defined, using any for now
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    };

    try {
      // Upload media file
      const uploadedMedia = await this.mediaUploadService.uploadMedia(mediaFile, req.user.sub);
      
      // Update OBS settings with the new media URL
      const updateData: any = {};
      
      if (settingsType === 'image') {
        updateData.imageSettings = {
          url: uploadedMedia.url,
          mediaType: uploadedMedia.type === 'gif' ? 'gif' : uploadedMedia.type === 'video' ? 'video' : 'image',
          width: uploadedMedia.dimensions?.width || 300,
          height: uploadedMedia.dimensions?.height || 200,
        };
      } else if (settingsType === 'sound') {
        updateData.soundSettings = {
          url: uploadedMedia.url,
        };
      }

      const updatedSettings = await this.obsSettingsService.update(req.user.sub, updateData);
      return updatedSettings.toObject();
    } catch (error) {
      throw new BadRequestException(`Media upload failed: ${error.message}`);
    }
  }

  @Post(':streamerId/upload-media')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Upload media for OBS settings by streamer ID (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Media file to upload (image, gif, video, or audio)',
        },
        mediaType: {
          type: 'string',
          enum: ['image', 'gif', 'video', 'audio'],
          description: 'Type of media being uploaded',
        },
        settingsType: {
          type: 'string',
          enum: ['image', 'sound'],
          description: 'Which settings to update (image or sound)',
        },
      },
      required: ['file', 'mediaType', 'settingsType'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Media uploaded and OBS settings updated successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or validation error' })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async uploadMediaForStreamer(
    @Param('streamerId') streamerId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('mediaType') mediaType: string,
    @Body('settingsType') settingsType: string,
  ): Promise<OBSSettingsResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!mediaType || !settingsType) {
      throw new BadRequestException('Media type and settings type are required');
    }

    // Validate settings type
    if (!['image', 'sound'].includes(settingsType)) {
      throw new BadRequestException('Settings type must be either "image" or "sound"');
    }

    // Convert Express.Multer.File to MediaFile interface
    const mediaFile: any = { // MediaFile interface is not defined, using any for now
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    };

    try {
      // Upload media file
      const uploadedMedia = await this.mediaUploadService.uploadMedia(mediaFile, streamerId);
      
      // Update OBS settings with the new media URL
      const updateData: any = {};
      
      if (settingsType === 'image') {
        updateData.imageSettings = {
          url: uploadedMedia.url,
          mediaType: uploadedMedia.type === 'gif' ? 'gif' : uploadedMedia.type === 'video' ? 'video' : 'image',
          width: uploadedMedia.dimensions?.width || 300,
          height: uploadedMedia.dimensions?.height || 200,
        };
      } else if (settingsType === 'sound') {
        updateData.soundSettings = {
          url: uploadedMedia.url,
        };
      }

      const updatedSettings = await this.obsSettingsService.update(streamerId, updateData);
      return updatedSettings.toObject();
    } catch (error) {
      throw new BadRequestException(`Media upload failed: ${error.message}`);
    }
  }

  @Delete('my-settings/remove-media')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove media from current user\'s OBS settings' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        settingsType: {
          type: 'string',
          enum: ['image', 'sound'],
          description: 'Which settings to clear (image or sound)',
        },
      },
      required: ['settingsType'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Media removed from OBS settings successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async removeMediaFromMySettings(
    @Request() req,
    @Body('settingsType') settingsType: string,
  ): Promise<OBSSettingsResponseDto> {
    if (!settingsType) {
      throw new BadRequestException('Settings type is required');
    }

    if (!['image', 'sound'].includes(settingsType)) {
      throw new BadRequestException('Settings type must be either "image" or "sound"');
    }

    const updateData: any = {};
    
    if (settingsType === 'image') {
      updateData.imageSettings = { url: null };
    } else if (settingsType === 'sound') {
      updateData.soundSettings = { url: null };
    }

    const updatedSettings = await this.obsSettingsService.update(req.user.sub, updateData);
    return updatedSettings.toObject();
  }

  @Delete(':streamerId/remove-media')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove media from OBS settings by streamer ID (Admin only)' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        settingsType: {
          type: 'string',
          enum: ['image', 'sound'],
          description: 'Which settings to clear (image or sound)',
        },
      },
      required: ['settingsType'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Media removed from OBS settings successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async removeMediaFromStreamer(
    @Param('streamerId') streamerId: string,
    @Body('settingsType') settingsType: string,
  ): Promise<OBSSettingsResponseDto> {
    if (!settingsType) {
      throw new BadRequestException('Settings type is required');
    }

    if (!['image', 'sound'].includes(settingsType)) {
      throw new BadRequestException('Settings type must be either "image" or "sound"');
    }

    const updateData: any = {};
    
    if (settingsType === 'image') {
      updateData.imageSettings = { url: null };
    } else if (settingsType === 'sound') {
      updateData.soundSettings = { url: null };
    }

    const updatedSettings = await this.obsSettingsService.update(streamerId, updateData);
    return updatedSettings.toObject();
  }

  // Configuration Preset Management
  @Post('my-settings/save-preset')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Save current OBS settings as a preset' })
  @ApiBody({ type: SavePresetDto })
  @ApiResponse({
    status: 201,
    description: 'Preset saved successfully',
    schema: {
      type: 'object',
      properties: {
        presetId: { type: 'string' },
        presetName: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  async savePreset(
    @Request() req,
    @Body() savePresetDto: SavePresetDto,
  ) {
    const result = await this.obsSettingsService.savePreset(req.user.sub, savePresetDto.presetName, savePresetDto.description);
    return result;
  }

  @Get('my-settings/presets')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all saved presets for current user' })
  @ApiResponse({
    status: 200,
    description: 'Presets retrieved successfully',
    type: [PresetDto],
  })
  async getPresets(@Request() req): Promise<PresetDto[]> {
    const presets = await this.obsSettingsService.getPresets(req.user.sub);
    return presets;
  }

  @Post('my-settings/load-preset/:presetId')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Load a saved preset for current user' })
  @ApiParam({ name: 'presetId', description: 'Preset ID to load' })
  @ApiResponse({
    status: 200,
    description: 'Preset loaded successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Preset not found' })
  async loadPreset(
    @Request() req,
    @Param('presetId') presetId: string,
  ): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.loadPreset(req.user.sub, presetId);
    return settings.toObject();
  }

  @Delete('my-settings/preset/:presetId')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a saved preset for current user' })
  @ApiParam({ name: 'presetId', description: 'Preset ID to delete' })
  @ApiResponse({ status: 204, description: 'Preset deleted successfully' })
  @ApiResponse({ status: 404, description: 'Preset not found' })
  async deletePreset(
    @Request() req,
    @Param('presetId') presetId: string,
  ): Promise<void> {
    await this.obsSettingsService.deletePreset(req.user.sub, presetId);
  }

  // Configuration Validation
  @Post('my-settings/validate')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Validate OBS settings configuration without saving' })
  @ApiBody({ type: CreateOBSSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Configuration validation completed',
    type: ConfigurationValidationDto,
  })
  async validateConfiguration(
    @Request() req,
    @Body() configuration: CreateOBSSettingsDto,
  ): Promise<ConfigurationValidationDto> {
    const validation = await this.obsSettingsService.validateConfiguration(configuration);
    return validation;
  }

  // Configuration Export/Import
  @Get('my-settings/export')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Export current OBS settings configuration' })
  @ApiResponse({
    status: 200,
    description: 'Configuration exported successfully',
    type: ExportConfigurationDto,
  })
  async exportConfiguration(@Request() req): Promise<ExportConfigurationDto> {
    const exportData = await this.obsSettingsService.exportConfiguration(req.user.sub);
    return exportData;
  }

  @Post('my-settings/import')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Import OBS settings configuration' })
  @ApiBody({ type: ImportConfigurationDto })
  @ApiResponse({
    status: 200,
    description: 'Configuration imported successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid import data' })
  async importConfiguration(
    @Request() req,
    @Body() importConfigurationDto: ImportConfigurationDto,
  ): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.importConfiguration(
      req.user.sub, 
      importConfigurationDto.importData, 
      importConfigurationDto.overwrite
    );
    return settings.toObject();
  }

  // Configuration Testing
  @Post('my-settings/test-configuration')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Test OBS settings configuration without saving' })
  @ApiBody({ type: CreateOBSSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Configuration test completed',
    type: TestResultDto,
  })
  async testConfiguration(
    @Request() req,
    @Body() configuration: CreateOBSSettingsDto,
  ): Promise<TestResultDto> {
    const testResults = await this.obsSettingsService.testConfiguration(configuration);
    return testResults;
  }

  // Configuration Reset
  @Post('my-settings/reset-to-defaults')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Reset OBS settings to default values' })
  @ApiResponse({
    status: 200,
    description: 'Settings reset to defaults successfully',
    type: OBSSettingsResponseDto,
  })
  async resetToDefaults(@Request() req): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.resetToDefaults(req.user.sub);
    return settings.toObject();
  }

  @Post('my-settings/reset-section')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Reset a specific section of OBS settings to defaults' })
  @ApiBody({ type: ResetSectionDto })
  @ApiResponse({
    status: 200,
    description: 'Section reset to defaults successfully',
    type: OBSSettingsResponseDto,
  })
  async resetSection(
    @Request() req,
    @Body() resetSectionDto: ResetSectionDto,
  ): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.resetSection(req.user.sub, resetSectionDto.section);
    return settings.toObject();
  }

  // Configuration Templates
  @Get('templates')
  @ApiOperation({ summary: 'Get available OBS settings templates' })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
    type: [TemplateDto],
  })
  async getTemplates(): Promise<TemplateDto[]> {
    const templates = await this.obsSettingsService.getTemplates();
    return templates;
  }

  @Post('my-settings/apply-template/:templateId')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Apply a template to current user\'s OBS settings' })
  @ApiParam({ name: 'templateId', description: 'Template ID to apply' })
  @ApiResponse({
    status: 200,
    description: 'Template applied successfully',
    type: OBSSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async applyTemplate(
    @Request() req,
    @Param('templateId') templateId: string,
  ): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.applyTemplate(req.user.sub, templateId);
    return settings.toObject();
  }

  // Test Alert Functionality
  @Post('my-settings/test-alert')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Trigger a test alert using current OBS settings' })
  @ApiBody({ type: TestAlertDto })
  @ApiResponse({
    status: 200,
    description: 'Test alert triggered successfully',
    type: TestAlertResponseDto,
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async triggerTestAlert(
    @Request() req,
    @Body() testAlertDto: TestAlertDto,
  ): Promise<TestAlertResponseDto> {
    const result = await this.obsSettingsService.triggerTestAlert(req.user.sub, testAlertDto);
    return result;
  }

  @Get('my-settings/test-alert-history')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get test alert history for current user' })
  @ApiResponse({
    status: 200,
    description: 'Test alert history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        streamerId: { type: 'string' },
        testAlerts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              alertId: { type: 'string' },
              donorName: { type: 'string' },
              amount: { type: 'string' },
              message: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              success: { type: 'boolean' },
            },
          },
        },
        total: { type: 'number' },
      },
    },
  })
  async getTestAlertHistory(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const history = await this.obsSettingsService.getTestAlertHistory(req.user.sub, limitNumber);
    return history;
  }

  @Post('streamer/:streamerId/test-alert')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Trigger a test alert for a specific streamer (Admin only)' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiBody({ type: TestAlertDto })
  @ApiResponse({
    status: 200,
    description: 'Test alert triggered successfully',
    type: TestAlertResponseDto,
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async triggerTestAlertForStreamer(
    @Param('streamerId') streamerId: string,
    @Body() testAlertDto: TestAlertDto,
  ): Promise<TestAlertResponseDto> {
    const result = await this.obsSettingsService.triggerTestAlert(streamerId, testAlertDto);
    return result;
  }

  @Post('widget/:alertToken/alert')
  @ApiOperation({ summary: 'Trigger an alert for OBS widget using alert token' })
  @ApiParam({ name: 'alertToken', description: 'Alert token for OBS widget' })
  @ApiBody({ type: TestAlertDto })
  @ApiResponse({
    status: 200,
    description: 'Alert triggered successfully',
    type: TestAlertResponseDto,
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async triggerWidgetAlert(
    @Param('alertToken') alertToken: string,
    @Body() testAlertDto: TestAlertDto,
  ): Promise<TestAlertResponseDto> {
    const result = await this.obsSettingsService.triggerWidgetAlert(alertToken, testAlertDto);
    return result;
  }

  @Post('widget/:alertToken/donation-alert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger donation alert for OBS widget' })
  @ApiParam({ name: 'alertToken', description: '64-character alert token' })
  @ApiResponse({ status: 200, description: 'Donation alert triggered successfully', type: DonationAlertResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async triggerDonationAlert(
    @Param('alertToken') alertToken: string,
    @Body() donationAlertDto: DonationAlertDto,
    @Request() req,
  ): Promise<DonationAlertResponseDto> {
    console.log(`Processing donation alert request for token: ${alertToken.substring(0, 8)}...`);
    
    // Get client IP and user agent for security validation
    const clientIp = this.getClientIp(req);
    const userAgent = req.headers['user-agent'];
    
    console.log(`Client IP: ${clientIp}, User Agent: ${userAgent?.substring(0, 50)}...`);
    
    // Basic rate limiting - in production, use a proper rate limiting library
    const rateLimitKey = `donation_alert:${clientIp}:${alertToken}`;
    const recentRequests = await this.checkRateLimit(rateLimitKey);
    
    if (recentRequests >= 10) { // 10 requests per minute per IP per token
      throw new BadRequestException('Rate limit exceeded. Please wait before making another request.');
    }

    // Use enhanced security validation
    const settings = await this.obsSettingsService.findByAlertTokenWithSecurity(
      alertToken,
      clientIp,
      userAgent
    );
    
    const streamerId = settings.streamerId.toString();
    
    console.log(`Found OBS settings for streamer: ${streamerId}`);
    
    // Validate donation data
    if (!donationAlertDto.donorName || !donationAlertDto.amount || !donationAlertDto.currency) {
      throw new BadRequestException('Missing required donation fields: donorName, amount, and currency are required');
    }

    // Prepare donation alert data
    const alertData = {
      donorName: donationAlertDto.isAnonymous ? 'Anonymous' : donationAlertDto.donorName,
      amount: donationAlertDto.amount,
      currency: donationAlertDto.currency,
      message: donationAlertDto.message || 'Thank you for your donation!',
      donationId: donationAlertDto.donationId,
      paymentMethod: donationAlertDto.paymentMethod,
      isAnonymous: donationAlertDto.isAnonymous || false,
      timestamp: new Date(),
    };

    console.log(`Prepared alert data:`, {
      donorName: alertData.donorName,
      amount: alertData.amount,
      currency: alertData.currency,
      donationId: alertData.donationId,
      paymentMethod: alertData.paymentMethod,
    });

    // Generate unique alert ID
    const alertId = `donation_alert_${Date.now()}_${randomBytes(8).toString('hex')}`;

    // Create widget URL using the service method for consistency
    const { widgetUrl } = await this.obsSettingsService.getWidgetUrl(streamerId);

    // Send donation alert via WebSocket to all connected OBS widgets
    this.obsWidgetGateway.sendDonationAlert(
      streamerId,
      alertData.donorName,
      parseFloat(alertData.amount),
      alertData.currency,
      alertData.message
    );

    console.log(`Sent donation alert via WebSocket to streamer: ${streamerId}`);

    // Get count of connected widgets for this streamer
    const connectedWidgets = this.obsWidgetGateway.getStreamerClientCount(streamerId);

    console.log(`Connected OBS widgets for streamer ${streamerId}: ${connectedWidgets}`);

    // Log the donation alert for analytics
    console.log('Donation alert triggered:', {
      streamerId,
      alertId,
      alertData,
      widgetUrl,
      connectedWidgets,
      clientIp,
      userAgent,
      settings: {
        imageSettings: settings.imageSettings,
        soundSettings: settings.soundSettings,
        animationSettings: settings.animationSettings,
        styleSettings: settings.styleSettings,
        positionSettings: settings.positionSettings,
        displaySettings: settings.displaySettings,
        generalSettings: settings.generalSettings,
      },
    });

    return {
      success: true,
      alertId,
      streamerId,
      alertData,
      widgetUrl,
      message: 'Donation alert triggered successfully',
      connectedWidgets: connectedWidgets,
    };
  }

  @Post('widget/:alertToken/test-alert-public')
  @ApiOperation({ summary: 'Send test alert to OBS widget (Public endpoint for testing)' })
  @ApiParam({ name: 'alertToken', description: 'Alert token for OBS widget' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        donorName: { type: 'string', example: 'Test User' },
        amount: { type: 'string', example: '$10.00' },
        message: { type: 'string', example: 'This is a test alert!' },
        useCurrentSettings: { type: 'boolean', example: true, description: 'Whether to use saved OBS settings' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Test alert sent successfully' })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async sendTestAlertPublic(
    @Param('alertToken') alertToken: string,
    @Body() testData: { donorName: string; amount: string; message: string; useCurrentSettings?: boolean }
  ) {
    try {
      // Use the service method to trigger the test alert with proper settings handling
      const result = await this.obsSettingsService.triggerWidgetAlert(alertToken, {
        donorName: testData.donorName,
        amount: testData.amount,
        message: testData.message,
        useCurrentSettings: testData.useCurrentSettings ?? true // Default to using saved settings
      });
      
      return { 
        success: true, 
        message: 'Test alert sent successfully',
        streamerId: result.streamerId,
        alertId: result.alertId,
        useCurrentSettings: testData.useCurrentSettings ?? true
      };
    } catch (error) {
      throw new NotFoundException('OBS settings not found for this alert token');
    }
  }

  /**
   * Get client IP address for rate limiting
   */
  private getClientIp(req: ExpressRequest): string {
    // This is a simplified implementation
    // In production, you'd want to handle various proxy scenarios
    return (req as any).ip || (req as any).connection?.remoteAddress || '127.0.0.1';
  }

  /**
   * Simple rate limiting check
   */
  private async checkRateLimit(key: string): Promise<number> {
    // TODO: Implement proper rate limiting with Redis
    // In production, use Redis or a proper rate limiting library
    return 0; // Placeholder - implement proper rate limiting
  }

  // ==================== SECURITY ENDPOINTS ====================

  @Post('security/revoke-token')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Revoke alert token for security' })
  @ApiResponse({ status: 200, description: 'Token revoked successfully' })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async revokeAlertToken(
    @Body() revokeTokenDto: RevokeTokenDto,
    @Request() req,
  ): Promise<{ message: string }> {
    const streamerId = req.user.role === UserRole.ADMIN ? req.body.streamerId : req.user.sub;
    
    await this.obsSettingsService.revokeAlertToken(streamerId, revokeTokenDto.reason);
    
    return { message: 'Alert token revoked successfully' };
  }

  @Post('security/regenerate-token')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Regenerate alert token with enhanced security' })
  @ApiResponse({ status: 200, description: 'Token regenerated successfully', type: OBSSettingsResponseDto })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async regenerateAlertTokenWithSecurity(
    @Request() req,
  ): Promise<OBSSettingsResponseDto> {
    const streamerId = req.user.role === UserRole.ADMIN ? req.body.streamerId : req.user.sub;
    
    const settings = await this.obsSettingsService.regenerateAlertToken(streamerId);
    return settings.toObject();
  }

  @Patch('security/settings')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update security settings' })
  @ApiResponse({ status: 200, description: 'Security settings updated successfully', type: OBSSettingsResponseDto })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async updateSecuritySettings(
    @Body() updateSecuritySettingsDto: UpdateSecuritySettingsDto,
    @Request() req,
  ): Promise<OBSSettingsResponseDto> {
    const streamerId = req.user.role === UserRole.ADMIN ? req.body.streamerId : req.user.sub;
    
    const settings = await this.obsSettingsService.updateSecuritySettings(
      streamerId, 
      updateSecuritySettingsDto.securitySettings
    );
    return settings.toObject();
  }

  @Get('security/status')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get security status for current user' })
  @ApiResponse({ status: 200, description: 'Security status retrieved successfully', type: SecurityStatusDto })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async getSecurityStatus(@Request() req): Promise<SecurityStatusDto> {
    const streamerId = req.user.role === UserRole.ADMIN ? req.query.streamerId as string : req.user.sub;
    
    return this.obsSettingsService.getSecurityStatus(streamerId);
  }

  @Get('security/audit-log')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get security audit log' })
  @ApiResponse({ status: 200, description: 'Security audit log retrieved successfully', type: SecurityAuditResponseDto })
  @ApiResponse({ status: 404, description: 'OBS settings not found' })
  async getSecurityAuditLog(
    @Request() req,
    @Query('limit') limit: string = '50',
  ): Promise<SecurityAuditResponseDto> {
    const streamerId = req.user.role === UserRole.ADMIN ? req.query.streamerId as string : req.user.sub;
    const limitNum = parseInt(limit, 10);
    
    const violations = await this.obsSettingsService.getSecurityAuditLog(streamerId, limitNum);
    const settings = await this.obsSettingsService.findByStreamerId(streamerId);
    
    return {
      streamerId,
      violations: violations.map(v => ({
        ...v,
        timestamp: v.timestamp.toISOString(),
      })),
      totalViolations: violations.length,
      lastSecurityAudit: settings.securitySettings?.lastSecurityAudit?.toISOString() || settings.updatedAt.toISOString(),
    };
  }

  @Post('security/validate-token')
  @ApiOperation({ summary: 'Validate alert token with security checks' })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async validateAlertToken(
    @Body() body: { alertToken: string; clientIp?: string; userAgent?: string; signatureData?: any },
  ): Promise<{ isValid: boolean; streamerId?: string; error?: string }> {
    const { alertToken, clientIp, userAgent, signatureData } = body;
    
    if (!alertToken) {
      throw new BadRequestException('Alert token is required');
    }

    const validationResult = await this.obsSettingsService.findByAlertTokenWithSecurity(
      alertToken, 
      clientIp, 
      userAgent, 
      signatureData
    );

    return {
      isValid: true,
      streamerId: validationResult.streamerId.toString(),
    };
  }

  @Post('security/create-signature')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create request signature for secure API calls' })
  @ApiResponse({ status: 200, description: 'Signature created successfully' })
  async createRequestSignature(
    @Body() body: { timestamp: number; nonce: string },
    @Request() req,
  ): Promise<{ signature: string }> {
    const streamerId = req.user.role === UserRole.ADMIN ? req.body.streamerId : req.user.sub;
    const settings = await this.obsSettingsService.findByStreamerId(streamerId);
    
    if (!settings.securitySettings?.requestSignatureSecret) {
      throw new BadRequestException('Request signing is not enabled for this account');
    }

    const signature = this.obsSettingsService.createRequestSignature(
      body.timestamp,
      body.nonce,
      settings.securitySettings.requestSignatureSecret
    );

    return { signature };
  }
} 