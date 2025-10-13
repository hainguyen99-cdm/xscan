import { Controller, UseGuards, Post, Body, Request, Get, Put, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { OBSSettingsService } from './obs-settings.service';
import { CreateOBSSettingsDto, OBSSettingsResponseDto } from './dto';

@ApiTags('OBS Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('obs-settings')
export class OBSSettingsController {
  constructor(private readonly obsSettingsService: OBSSettingsService) {}

  @Post()
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiResponse({ status: 201, description: 'OBS settings created successfully', type: OBSSettingsResponseDto })
  async create(
    @Body() createOBSSettingsDto: CreateOBSSettingsDto,
    @Request() req,
  ): Promise<OBSSettingsResponseDto> {
    if (req.user?.role !== UserRole.ADMIN && req.user?.sub && req.user?.sub !== createOBSSettingsDto.streamerId) {
      createOBSSettingsDto.streamerId = req.user.sub;
    }
    const settings = await this.obsSettingsService.create(createOBSSettingsDto);
    return settings.toObject();
  }

  @Get('my-settings')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiResponse({ status: 200, description: 'OBS settings retrieved successfully', type: OBSSettingsResponseDto })
  async getMySettings(@Request() req): Promise<OBSSettingsResponseDto> {
    const settings = await this.obsSettingsService.findByStreamerId(req.user.sub);
    return settings.toObject();
  }

  @Get('donation-levels')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiResponse({ status: 200, description: 'Donation levels retrieved successfully' })
  async getDonationLevels(@Request() req): Promise<{ donationLevels: any[] }> {
    const settings = await this.obsSettingsService.findByStreamerId(req.user.sub);
    return { donationLevels: ((settings as any).donationLevels || []) };
  }

  @Put('donation-levels/:levelId')
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  @ApiResponse({ status: 200, description: 'Donation level updated successfully' })
  async updateDonationLevel(
    @Param('levelId') levelId: string,
    @Body() body: any,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    console.log('[OBS Settings] updateDonationLevel called', {
      streamerId: req?.user?.sub,
      levelId,
      hasCustomization: !!body?.customization,
      hasConfiguration: !!body?.configuration,
      hasPrimitives: !!(body?.levelName || body?.minAmount || body?.maxAmount || body?.currency || typeof body?.isEnabled === 'boolean')
    });
    await this.obsSettingsService.updateDonationLevel(req.user.sub, levelId, body);
    return { success: true, message: 'Donation level updated successfully' };
  }
}

export {};


