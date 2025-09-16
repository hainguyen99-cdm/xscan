import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DonationsService } from './donations.service';
import { AnalyticsService } from './analytics.service';
import { CreateDonationLinkDto } from './dto/create-donation-link.dto';
import {
  UpdateDonationLinkDto,
  UpdateThemeDto,
  UpdateSocialMediaDto,
} from './dto/update-donation-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';

@ApiTags('donation-links')
@Controller('donation-links')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DonationLinksController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get()
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Get all donation links for the authenticated streamer' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiResponse({
    status: 200,
    description: 'Donation links retrieved successfully',
  })
  async getDonationLinks(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const donationLinks = await this.donationsService.getDonationLinks(
      req.user.id,
      { page, limit, search, status },
    );
    return {
      success: true,
      data: donationLinks,
    };
  }

  @Get('check-url')
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Check if a custom URL is available' })
  @ApiQuery({ name: 'url', required: true, description: 'Custom URL to check' })
  @ApiResponse({
    status: 200,
    description: 'URL availability checked successfully',
  })
  async checkUrlAvailability(@Query('url') url: string, @Request() req) {
    const isAvailable = await this.donationsService.checkUrlAvailability(
      url,
      req.user.id,
    );
    return {
      success: true,
      data: { isAvailable },
    };
  }

  @Get(':id')
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Get a specific donation link by ID' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Donation link retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found or access denied',
  })
  async getDonationLink(@Param('id') id: string, @Request() req) {
    const donationLink = await this.donationsService.getDonationLink(
      id,
      req.user.id,
    );
    return {
      success: true,
      data: donationLink,
    };
  }

  @Post()
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Create a new donation link' })
  @ApiResponse({
    status: 201,
    description: 'Donation link created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - slug or custom URL already exists',
  })
  async createDonationLink(
    @Request() req,
    @Body() createDto: CreateDonationLinkDto,
  ) {
    const donationLink = await this.donationsService.createDonationLink(
      req.user.id,
      createDto,
    );
    return {
      success: true,
      data: donationLink,
      message: 'Donation link created successfully',
    };
  }

  @Put(':id')
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Update a donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Donation link updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found or access denied',
  })
  async updateDonationLink(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateDonationLinkDto,
  ) {
    const donationLink = await this.donationsService.updateDonationLink(
      id,
      req.user.id,
      updateDto,
    );
    return {
      success: true,
      data: donationLink,
      message: 'Donation link updated successfully',
    };
  }

  @Delete(':id')
  @Roles(UserRole.STREAMER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 204,
    description: 'Donation link deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found or access denied',
  })
  async deleteDonationLink(@Param('id') id: string, @Request() req) {
    await this.donationsService.deleteDonationLink(id, req.user.id);
  }

  @Put(':id/theme')
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Update donation link theme' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Theme updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found or access denied',
  })
  async updateTheme(
    @Param('id') id: string,
    @Request() req,
    @Body() themeDto: UpdateThemeDto,
  ) {
    const donationLink = await this.donationsService.updateTheme(
      id,
      req.user.id,
      themeDto,
    );
    return {
      success: true,
      data: donationLink,
      message: 'Theme updated successfully',
    };
  }

  @Put(':id/social-media')
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Update donation link social media links' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Social media links updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found or access denied',
  })
  async updateSocialMedia(
    @Param('id') id: string,
    @Request() req,
    @Body() socialMediaDto: UpdateSocialMediaDto,
  ) {
    const donationLink = await this.donationsService.updateSocialMedia(
      id,
      req.user.id,
      socialMediaDto,
    );
    return {
      success: true,
      data: donationLink,
      message: 'Social media links updated successfully',
    };
  }

  @Put(':id/toggle-status')
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Toggle donation link active status' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Donation link status toggled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found or access denied',
  })
  async toggleDonationLinkStatus(@Param('id') id: string, @Request() req) {
    const donationLink = await this.donationsService.toggleDonationLinkStatus(
      id,
      req.user.id,
    );
    return {
      success: true,
      data: donationLink,
      message: `Donation link ${donationLink.isActive ? 'activated' : 'deactivated'} successfully`,
    };
  }

  @Put(':id/toggle-featured')
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Toggle donation link featured status' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Donation link featured status toggled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found or access denied',
  })
  async toggleDonationLinkFeatured(@Param('id') id: string, @Request() req) {
    const donationLink = await this.donationsService.toggleDonationLinkFeatured(
      id,
      req.user.id,
    );
    return {
      success: true,
      data: donationLink,
      message: `Donation link ${donationLink.isFeatured ? 'featured' : 'unfeatured'} successfully`,
    };
  }

  @Get(':id/stats')
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Get donation link statistics' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found or access denied',
  })
  async getDonationLinkStats(@Param('id') id: string, @Request() req) {
    const stats = await this.donationsService.getDonationLinkStats(
      id,
      req.user.id,
    );
    return {
      success: true,
      data: stats,
    };
  }

}
