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
  Headers,
  NotFoundException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DonationsService } from './donations.service';
import { Patch } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { DonationProcessingService } from './donation-processing.service';
import { DonationWebhookService } from './donation-webhook.service';
import { CreateDonationLinkDto } from './dto/create-donation-link.dto';
import {
  UpdateDonationLinkDto,
  UpdateThemeDto,
  UpdateSocialMediaDto,
  AnalyticsEventDto,
} from './dto/update-donation-link.dto';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import {
  DonationHistoryQueryDto,
  TopDonorsQueryDto,
  DonationAnalyticsQueryDto,
  DonationTrendsQueryDto,
  DonationComparisonQueryDto,
} from './dto/donation-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { WebhookManagementService } from './webhook-management.service';

@ApiTags('donations')
@Controller('donations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DonationsController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly analyticsService: AnalyticsService,
    private readonly donationProcessingService: DonationProcessingService,
    private readonly donationWebhookService: DonationWebhookService,
    private readonly webhookManagementService: WebhookManagementService,
  ) {}

  @Post('links')
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

  @Patch('links/:id/set-default')
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Set a donation link as default for the streamer' })
  @ApiResponse({ status: 200, description: 'Default link set successfully' })
  async setDefaultLink(@Request() req, @Param('id') id: string) {
    const updated = await this.donationsService.setDefaultDonationLink(req.user.id, id);
    return { success: true, data: updated };
  }

  @Post('links/bulk')
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Create multiple donation links in bulk' })
  @ApiResponse({
    status: 201,
    description: 'Donation links created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async createBulkDonationLinks(
    @Request() req,
    @Body() createDtos: CreateDonationLinkDto[],
  ) {
    const donationLinks = await this.donationsService.createBulkDonationLinks(
      req.user.id,
      createDtos,
    );
    return {
      success: true,
      data: donationLinks,
      message: `${donationLinks.length} donation links created successfully`,
    };
  }

  @Get('links')
  @Public()
  @ApiOperation({ summary: 'Get all donation links (Public endpoint)' })
  @ApiQuery({
    name: 'streamerId',
    required: false,
    description: 'Filter by streamer ID',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    description: 'Filter by featured status',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of links to return',
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Donation links retrieved successfully',
  })
  async getAllDonationLinks(
    @Query('streamerId') streamerId?: string,
    @Query('isActive') isActive?: boolean,
    @Query('isFeatured') isFeatured?: boolean,
    @Query('limit') limit: number = 20,
    @Query('page') page: number = 1,
  ) {
    const result = await this.donationsService.findAllDonationLinks(
      streamerId,
      isActive,
      isFeatured,
      limit,
      page,
    );
    return {
      success: true,
      data: result.donationLinks,
      pagination: result.pagination,
      message: 'Donation links retrieved successfully',
    };
  }

  @Get('links/featured')
  @Public()
  @ApiOperation({ summary: 'Get featured donation links (Public endpoint)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of links to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Featured donation links retrieved successfully',
  })
  async getFeaturedDonationLinks(@Query('limit') limit: number = 10) {
    const donationLinks =
      await this.donationsService.getFeaturedDonationLinks(limit);
    return {
      success: true,
      data: donationLinks,
      message: 'Featured donation links retrieved successfully',
    };
  }

  @Get('links/:id')
  @Public()
  @ApiOperation({ summary: 'Get donation link by ID (Public endpoint)' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Donation link retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found',
  })
  async getDonationLinkById(@Param('id') id: string) {
    const donationLink = await this.donationsService.findDonationLinkById(id);
    return {
      success: true,
      data: donationLink,
      message: 'Donation link retrieved successfully',
    };
  }

  @Get('links/slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get donation link by slug (Public endpoint)' })
  @ApiParam({ name: 'slug', description: 'Slug of the donation link' })
  @ApiResponse({
    status: 200,
    description: 'Donation link retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found or inactive',
  })
  async getDonationLinkBySlug(@Param('slug') slug: string, @Request() req) {
    const donationLink =
      await this.donationsService.findDonationLinkBySlug(slug);

    // Track page view analytics
    await this.analyticsService.trackPageView(donationLink._id.toString(), req);

    return {
      success: true,
      data: donationLink,
      message: 'Donation link retrieved successfully',
    };
  }

  @Get('links/url/:customUrl')
  @Public()
  @ApiOperation({ summary: 'Get donation link by custom URL (Public endpoint)' })
  @ApiParam({
    name: 'customUrl',
    description: 'Custom URL of the donation link',
  })
  @ApiResponse({
    status: 200,
    description: 'Donation link retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found or inactive',
  })
  async getDonationLinkByCustomUrl(
    @Param('customUrl') customUrl: string,
    @Request() req,
  ) {
    const donationLink =
      await this.donationsService.findDonationLinkByCustomUrl(customUrl);

    // Track page view analytics
    await this.analyticsService.trackPageView(donationLink._id.toString(), req);

    return {
      success: true,
      data: donationLink,
      message: 'Donation link retrieved successfully',
    };
  }

  @Put('links/:id')
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Update donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Donation link updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found or access denied',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - slug or custom URL already exists',
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

  @Put('links/:id/theme')
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Update donation link theme customization' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Theme updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found or access denied',
  })
  async updateDonationLinkTheme(
    @Param('id') id: string,
    @Request() req,
    @Body() themeDto: UpdateThemeDto,
  ) {
    const donationLink = await this.donationsService.updateDonationLinkTheme(
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

  @Put('links/:id/social-media')
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
  async updateDonationLinkSocialMedia(
    @Param('id') id: string,
    @Request() req,
    @Body() socialMediaDto: UpdateSocialMediaDto,
  ) {
    const donationLink =
      await this.donationsService.updateDonationLinkSocialMedia(
        id,
        req.user.id,
        socialMediaDto.socialMediaLinks,
      );
    return {
      success: true,
      data: donationLink,
      message: 'Social media links updated successfully',
    };
  }

  @Delete('links/:id')
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

  @Delete('links/bulk')
  @Roles(UserRole.STREAMER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete multiple donation links in bulk' })
  @ApiResponse({
    status: 204,
    description: 'Donation links deleted successfully',
  })
  async deleteBulkDonationLinks(@Request() req, @Body() ids: string[]) {
    await this.donationsService.deleteBulkDonationLinks(ids, req.user.id);
  }

  @Put('links/:id/toggle-status')
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

  @Put('links/:id/toggle-featured')
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

  @Get('links/:id/stats')
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
      message: 'Statistics retrieved successfully',
    };
  }

  @Get('links/:id/qr-code')
  @ApiOperation({ summary: 'Get QR code for donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'QR code retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found',
  })
  async getDonationLinkQRCode(@Param('id') id: string) {
    const donationLink = await this.donationsService.findDonationLinkById(id);
    return {
      success: true,
      data: {
        qrCodeUrl: donationLink.qrCodeUrl,
        customUrl: donationLink.customUrl,
      },
      message: 'QR code retrieved successfully',
    };
  }

  @Post('links/:id/qr-code/regenerate')
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Regenerate QR code for donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'QR code regenerated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found or access denied',
  })
  async regenerateDonationLinkQRCode(@Param('id') id: string, @Request() req) {
    const donationLink = await this.donationsService.regenerateQRCode(
      id,
      req.user.id,
    );
    return {
      success: true,
      data: {
        qrCodeUrl: donationLink.qrCodeUrl,
        customUrl: donationLink.customUrl,
      },
      message: 'QR code regenerated successfully',
    };
  }

  @Get('links/:id/qr-code/download')
  @ApiOperation({ summary: 'Download QR code as PNG image' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'QR code downloaded successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found',
  })
  async downloadDonationLinkQRCode(@Param('id') id: string) {
    const qrCodeBuffer = await this.donationsService.generateQRCodeBuffer(id);
    return {
      success: true,
      data: {
        qrCodeBuffer: qrCodeBuffer.toString('base64'),
        contentType: 'image/png',
      },
      message: 'QR code generated for download',
    };
  }

  @Get('links/:id/social-share')
  @ApiOperation({ summary: 'Get social media sharing data for donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Social sharing data retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found',
  })
  async getDonationLinkSocialShare(@Param('id') id: string) {
    const socialShareData = await this.donationsService.getSocialShareData(id);
    return {
      success: true,
      data: socialShareData,
      message: 'Social sharing data retrieved successfully',
    };
  }

  @Post('links/:id/analytics/event')
  @ApiOperation({ summary: 'Track analytics event for donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Analytics event tracked successfully',
  })
  async trackAnalyticsEvent(
    @Param('id') id: string,
    @Body() eventData: AnalyticsEventDto,
  ) {
    await this.donationsService.trackAnalyticsEvent(id, eventData);
    return {
      success: true,
      message: 'Analytics event tracked successfully',
    };
  }

  @Get('links/:id/analytics/summary')
  @Roles(UserRole.STREAMER)
  @ApiOperation({ summary: 'Get analytics summary for donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to analyze',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics summary retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found or access denied',
  })
  async getAnalyticsSummary(
    @Param('id') id: string,
    @Query('days') days: number = 30,
    @Request() req,
  ) {
    // Verify ownership
    await this.donationsService.findDonationLinkById(id);

    const analyticsSummary = await this.analyticsService.getAnalyticsSummary(
      id,
      days,
    );
    return {
      success: true,
      data: analyticsSummary,
      message: 'Analytics summary retrieved successfully',
    };
  }

  @Get('links/:id/analytics/realtime')
  @ApiOperation({ summary: 'Get real-time analytics for donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Real-time analytics retrieved successfully',
  })
  async getRealTimeAnalytics(@Param('id') id: string, @Request() req) {
    const realTimeAnalytics =
      await this.analyticsService.getRealTimeAnalytics(id);
    return {
      success: true,
      data: realTimeAnalytics,
      message: 'Real-time analytics retrieved successfully',
    };
  }

  @Get('links/:id/analytics/funnel')
  @ApiOperation({ summary: 'Get conversion funnel analysis for donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to analyze',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Conversion funnel analysis retrieved successfully',
  })
  async getConversionFunnel(
    @Param('id') id: string,
    @Query('days') days: number = 30,
  ) {
    const funnelData = await this.analyticsService.getConversionFunnel(
      id,
      days,
    );
    return {
      success: true,
      data: funnelData,
      message: 'Conversion funnel analysis retrieved successfully',
    };
  }

  @Get('links/:id/analytics/geographic')
  @ApiOperation({ summary: 'Get geographic analytics for donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to analyze',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Geographic analytics retrieved successfully',
  })
  async getGeographicAnalytics(
    @Param('id') id: string,
    @Query('days') days: number = 30,
  ) {
    const geoData = await this.analyticsService.getGeographicAnalytics(
      id,
      days,
    );
    return {
      success: true,
      data: geoData,
      message: 'Geographic analytics retrieved successfully',
    };
  }

  @Get('links/:id/analytics/performance')
  @ApiOperation({ summary: 'Get performance metrics for donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to analyze',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics retrieved successfully',
  })
  async getPerformanceMetrics(
    @Param('id') id: string,
    @Query('days') days: number = 30,
  ) {
    const performanceData = await this.analyticsService.getPerformanceMetrics(
      id,
      days,
    );
    return {
      success: true,
      data: performanceData,
      message: 'Performance metrics retrieved successfully',
    };
  }

  @Get('links/:id/analytics/social-media')
  @ApiOperation({ summary: 'Get social media analytics for donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to analyze',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Social media analytics retrieved successfully',
  })
  async getSocialMediaAnalytics(
    @Param('id') id: string,
    @Query('days') days: number = 30,
  ) {
    const socialData = await this.analyticsService.getSocialMediaAnalytics(
      id,
      days,
    );
    return {
      success: true,
      data: socialData,
      message: 'Social media analytics retrieved successfully',
    };
  }

  @Get('links/:id/analytics/utm')
  @ApiOperation({ summary: 'Get UTM campaign analytics for donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to analyze',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'UTM analytics retrieved successfully',
  })
  async getUTMAnalytics(
    @Param('id') id: string,
    @Query('days') days: number = 30,
  ) {
    const utmData = await this.analyticsService.getUTMAnalytics(id, days);
    return {
      success: true,
      data: utmData,
      message: 'UTM analytics retrieved successfully',
    };
  }

  @Get('links/:id/analytics/export')
  @ApiOperation({ summary: 'Export analytics data for donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date (ISO string)',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Export format (json or csv)',
    enum: ['json', 'csv'],
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics data exported successfully',
  })
  async exportAnalyticsData(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format: 'json' | 'csv' = 'json',
  ) {
    const exportData = await this.analyticsService.exportAnalyticsData(
      id,
      new Date(startDate),
      new Date(endDate),
      format,
    );
    return {
      success: true,
      data: exportData,
      message: 'Analytics data exported successfully',
    };
  }

  @Get('streamer/:streamerId/analytics/dashboard')
  @ApiOperation({ summary: 'Get analytics dashboard for streamer' })
  @ApiParam({ name: 'streamerId', description: 'Streamer ID' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to analyze',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Streamer analytics dashboard retrieved successfully',
  })
  async getStreamerAnalyticsDashboard(
    @Param('streamerId') streamerId: string,
    @Query('days') days: number = 30,
  ) {
    const dashboardData =
      await this.analyticsService.getStreamerAnalyticsDashboard(
        streamerId,
        days,
      );
    return {
      success: true,
      data: dashboardData,
      message: 'Streamer analytics dashboard retrieved successfully',
    };
  }

  @Post('links/:id/analytics/pageview')
  @ApiOperation({ summary: 'Track page view for donation link' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Page view tracked successfully',
  })
  async trackPageView(
    @Param('id') id: string,
    @Request() req,
    @Body() metadata?: any,
  ) {
    await this.analyticsService.trackPageView(id, req, metadata);
    return {
      success: true,
      message: 'Page view tracked successfully',
    };
  }

  @Post('links/:id/analytics/donation-started')
  @ApiOperation({ summary: 'Track donation started event' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Donation started event tracked successfully',
  })
  async trackDonationStarted(
    @Param('id') id: string,
    @Request() req,
    @Body() metadata?: any,
  ) {
    await this.analyticsService.trackDonationStarted(id, req, metadata);
    return {
      success: true,
      message: 'Donation started event tracked successfully',
    };
  }

  @Post('links/:id/analytics/donation-completed')
  @ApiOperation({ summary: 'Track donation completed event' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Donation completed event tracked successfully',
  })
  async trackDonationCompleted(
    @Param('id') id: string,
    @Request() req,
    @Body() metadata?: any,
  ) {
    await this.analyticsService.trackDonationCompleted(id, req, metadata);
    return {
      success: true,
      message: 'Donation completed event tracked successfully',
    };
  }

  @Post('links/:id/analytics/qr-scanned')
  @ApiOperation({ summary: 'Track QR code scan event' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'QR code scan event tracked successfully',
  })
  async trackQRCodeScanned(
    @Param('id') id: string,
    @Request() req,
    @Body() metadata?: any,
  ) {
    await this.analyticsService.trackQRCodeScanned(id, req, metadata);
    return {
      success: true,
      message: 'QR code scan event tracked successfully',
    };
  }

  @Post('links/:id/analytics/social-share')
  @ApiOperation({ summary: 'Track social media share event' })
  @ApiParam({ name: 'id', description: 'Donation link ID' })
  @ApiResponse({
    status: 200,
    description: 'Social share event tracked successfully',
  })
  async trackSocialShare(
    @Param('id') id: string,
    @Request() req,
    @Body() metadata?: any,
  ) {
    await this.analyticsService.trackSocialShare(id, req, metadata);
    return {
      success: true,
      message: 'Social share event tracked successfully',
    };
  }

  @Post('links/:id/analytics/track-link-click')
  @ApiOperation({ summary: 'Track link click event' })
  @ApiResponse({
    status: 200,
    description: 'Link click tracked successfully',
  })
  async trackLinkClick(
    @Param('id') id: string,
    @Request() req,
    @Body() metadata?: any,
  ) {
    await this.analyticsService.trackLinkClick(id, req, metadata);

    return {
      success: true,
      message: 'Link click tracked successfully',
    };
  }

  // ===== DONATION MANAGEMENT ENDPOINTS =====

  @Post()
  @ApiOperation({ summary: 'Create a new donation' })
  @ApiResponse({
    status: 201,
    description: 'Donation created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation link not found',
  })
  async createDonation(@Request() req, @Body() createDto: CreateDonationDto) {
    // Extract donor ID from authenticated user
    createDto.donorId = req.user.id;
    
    const donation = await this.donationsService.createDonation(createDto);
    return {
      success: true,
      data: donation,
      message: 'Donation created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all donations with pagination' })
  @ApiQuery({
    name: 'streamerId',
    required: false,
    description: 'Filter by streamer ID',
  })
  @ApiQuery({
    name: 'donorId',
    required: false,
    description: 'Filter by donor ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by donation status',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of donations per page',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiResponse({
    status: 200,
    description: 'Donations retrieved successfully',
  })
  async getDonations(
    @Query('streamerId') streamerId?: string,
    @Query('donorId') donorId?: string,
    @Query('status') status?: string,
    @Query('limit') limit: number = 20,
    @Query('page') page: number = 1,
  ) {
    const result = await this.donationsService.findDonations(
      streamerId,
      donorId,
      status,
      limit,
      page,
    );
    return {
      success: true,
      data: result.donations,
      pagination: result.pagination,
      message: 'Donations retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get donation by ID' })
  @ApiParam({ name: 'id', description: 'Donation ID' })
  @ApiResponse({
    status: 200,
    description: 'Donation retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found',
  })
  async getDonationById(@Param('id') id: string) {
    const donation = await this.donationsService.findDonationById(id);
    return {
      success: true,
      data: donation,
      message: 'Donation retrieved successfully',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update donation' })
  @ApiParam({ name: 'id', description: 'Donation ID' })
  @ApiResponse({
    status: 200,
    description: 'Donation updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found',
  })
  async updateDonation(
    @Param('id') id: string,
    @Body() updateDto: UpdateDonationDto,
  ) {
    const donation = await this.donationsService.updateDonation(id, updateDto);
    return {
      success: true,
      data: donation,
      message: 'Donation updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete donation' })
  @ApiParam({ name: 'id', description: 'Donation ID' })
  @ApiResponse({
    status: 204,
    description: 'Donation deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found',
  })
  async deleteDonation(@Param('id') id: string) {
    await this.donationsService.deleteDonation(id);
    return {
      success: true,
      message: 'Donation deleted successfully',
    };
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get donation statistics' })
  @ApiQuery({
    name: 'streamerId',
    required: false,
    description: 'Filter by streamer ID',
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    description: 'Time range (24h, 7d, 30d, 90d)',
  })
  @ApiResponse({
    status: 200,
    description: 'Donation statistics retrieved successfully',
  })
  async getDonationStats(
    @Query('streamerId') streamerId?: string,
    @Query('timeRange') timeRange?: string,
  ) {
    const stats = await this.donationsService.getDonationStats(
      streamerId,
      timeRange,
    );
    return {
      success: true,
      data: stats,
      message: 'Donation statistics retrieved successfully',
    };
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get comprehensive donation history with advanced filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Donation history retrieved successfully',
  })
  async getDonationHistory(@Query() query: DonationHistoryQueryDto) {
    const result = await this.donationsService.getDonationHistory(
      query.streamerId,
      query.donorId,
      query.status,
      query.paymentMethod,
      query.currency,
      query.minAmount,
      query.maxAmount,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
      query.isAnonymous,
      query.sortBy,
      query.sortOrder,
      query.limit,
      query.page,
    );
    return {
      success: true,
      data: result.donations,
      pagination: result.pagination,
      summary: result.summary,
      message: 'Donation history retrieved successfully',
    };
  }

  @Get('top-donors/:streamerId')
  @ApiOperation({ summary: 'Get top donors for a streamer' })
  @ApiParam({ name: 'streamerId', description: 'Streamer ID' })
  @ApiResponse({
    status: 200,
    description: 'Top donors retrieved successfully',
  })
  async getTopDonors(
    @Param('streamerId') streamerId: string,
    @Query() query: TopDonorsQueryDto,
  ) {
    const topDonors = await this.donationsService.getTopDonors(
      streamerId,
      query.limit,
      query.timeRange,
    );
    return {
      success: true,
      data: topDonors,
      message: 'Top donors retrieved successfully',
    };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get comprehensive donation analytics' })
  @ApiResponse({
    status: 200,
    description: 'Donation analytics retrieved successfully',
  })
  async getDonationAnalytics(@Query() query: DonationAnalyticsQueryDto) {
    const analytics = await this.donationsService.getDonationAnalytics(
      query.streamerId,
      query.timeRange,
    );
    return {
      success: true,
      data: analytics,
      message: 'Donation analytics retrieved successfully',
    };
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get donation trends over time' })
  @ApiResponse({
    status: 200,
    description: 'Donation trends retrieved successfully',
  })
  async getDonationTrends(@Query() query: DonationTrendsQueryDto) {
    const trends = await this.donationsService.getDonationTrends(
      query.streamerId,
      query.period,
      query.days,
    );
    return {
      success: true,
      data: trends,
      message: 'Donation trends retrieved successfully',
    };
  }

  @Get('comparison')
  @ApiOperation({ summary: 'Compare donation metrics between time periods' })
  @ApiResponse({
    status: 200,
    description: 'Donation comparison retrieved successfully',
  })
  async getDonationComparison(@Query() query: DonationComparisonQueryDto) {
    const comparison = await this.donationsService.getDonationComparison(
      query.streamerId,
      query.currentPeriod,
      query.previousPeriod,
    );
    return {
      success: true,
      data: comparison,
      message: 'Donation comparison retrieved successfully',
    };
  }

  @Get('by-currency')
  @ApiOperation({ summary: 'Get donations grouped by currency' })
  @ApiQuery({
    name: 'streamerId',
    required: false,
    description: 'Filter by streamer ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Donations by currency retrieved successfully',
  })
  async getDonationsByCurrency(@Query('streamerId') streamerId?: string) {
    const donationsByCurrency =
      await this.donationsService.getDonationsByCurrency(streamerId);
    return {
      success: true,
      data: donationsByCurrency,
      message: 'Donations by currency retrieved successfully',
    };
  }

  // ===== DONATION PROCESSING ENDPOINTS =====

  @Post('process')
  @ApiOperation({ summary: 'Process a complete donation flow' })
  @ApiResponse({
    status: 201,
    description: 'Donation processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async processDonation(@Request() req, @Body() createDto: CreateDonationDto) {
    // Extract donor ID from authenticated user
    createDto.donorId = req.user.id;
    
    const result =
      await this.donationProcessingService.processDonation(createDto);
    return {
      success: true,
      data: result,
      message: 'Donation processed successfully',
    };
  }

  @Post('confirm-payment/:donationId')
  @ApiOperation({ summary: 'Confirm external payment for a donation' })
  @ApiParam({ name: 'donationId', description: 'Donation ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed and donation completed',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - payment confirmation failed',
  })
  async confirmExternalPayment(
    @Param('donationId') donationId: string,
    @Body() body: { paymentIntentId: string },
  ) {
    const result = await this.donationProcessingService.confirmExternalPayment(
      donationId,
      body.paymentIntentId,
    );
    return {
      success: true,
      data: result,
      message: 'Payment confirmed and donation completed',
    };
  }

  @Get('processing-status/:donationId')
  @ApiOperation({ summary: 'Get donation processing status' })
  @ApiParam({ name: 'donationId', description: 'Donation ID' })
  @ApiResponse({
    status: 200,
    description: 'Donation processing status retrieved',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found',
  })
  async getProcessingStatus(@Param('donationId') donationId: string) {
    const status =
      await this.donationProcessingService.getProcessingStatus(donationId);
    return {
      success: true,
      data: status,
      message: 'Donation processing status retrieved',
    };
  }

  // ===== WEBHOOK ENDPOINTS =====

  // Payment Provider Webhooks
  @Post('webhooks/stripe')
  @ApiOperation({ summary: 'Process Stripe webhook' })
  @ApiResponse({
    status: 200,
    description: 'Stripe webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid signature or payload',
  })
  async processStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() webhookData: any,
    @Req() request: any,
  ) {
    await this.donationWebhookService.handleStripeWebhook(
      webhookData,
      signature,
    );
    return {
      success: true,
      message: 'Stripe webhook processed successfully',
    };
  }

  @Post('webhooks/paypal')
  @ApiOperation({ summary: 'Process PayPal webhook' })
  @ApiResponse({
    status: 200,
    description: 'PayPal webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid signature or payload',
  })
  async processPayPalWebhook(
    @Headers('paypal-signature') signature: string,
    @Body() webhookData: any,
    @Req() request: any,
  ) {
    await this.donationWebhookService.handlePayPalWebhook(
      webhookData,
      signature,
    );
    return {
      success: true,
      message: 'PayPal webhook processed successfully',
    };
  }

  // Custom Webhook Endpoints
  @Post('webhooks/donation-completed')
  @ApiOperation({ summary: 'Process donation completed webhook' })
  @ApiResponse({
    status: 200,
    description: 'Donation completed webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found',
  })
  async processDonationCompletedWebhook(
    @Headers('x-signature') signature: string,
    @Body() webhookData: any,
    @Req() request: any,
  ) {
    await this.donationWebhookService.processDonationCompletedWebhook(
      signature,
      webhookData,
    );
    return {
      success: true,
      message: 'Donation completed webhook processed successfully',
    };
  }

  @Post('webhooks/donation-started')
  @ApiOperation({ summary: 'Process donation started webhook' })
  @ApiResponse({
    status: 200,
    description: 'Donation started webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found',
  })
  async processDonationStartedWebhook(
    @Headers('x-signature') signature: string,
    @Body() webhookData: any,
    @Req() request: any,
  ) {
    await this.donationWebhookService.processDonationStartedWebhook(
      signature,
      webhookData,
    );
    return {
      success: true,
      message: 'Donation started webhook processed successfully',
    };
  }

  @Post('webhooks/qr-scanned')
  @ApiOperation({ summary: 'Process QR code scanned webhook' })
  @ApiResponse({
    status: 200,
    description: 'QR code scanned webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found',
  })
  async processQRScannedWebhook(
    @Headers('x-signature') signature: string,
    @Body() webhookData: any,
    @Req() request: any,
  ) {
    await this.donationWebhookService.processQRScannedWebhook(
      signature,
      webhookData,
    );
    return {
      success: true,
      message: 'QR code scanned webhook processed successfully',
    };
  }

  @Post('webhooks/social-share')
  @ApiOperation({ summary: 'Process social media share webhook' })
  @ApiResponse({
    status: 200,
    description: 'Social media share webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found',
  })
  async processSocialShareWebhook(
    @Headers('x-signature') signature: string,
    @Body() webhookData: any,
    @Req() request: any,
  ) {
    await this.donationWebhookService.processSocialShareWebhook(
      signature,
      webhookData,
    );
    return {
      success: true,
      message: 'Social media share webhook processed successfully',
    };
  }

  @Post('webhooks/track-link-click')
  @ApiOperation({ summary: 'Process link click webhook' })
  @ApiResponse({
    status: 200,
    description: 'Link click webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found',
  })
  async processLinkClickWebhook(
    @Headers('x-signature') signature: string,
    @Body() webhookData: any,
    @Req() request: any,
  ) {
    await this.donationWebhookService.processLinkClickWebhook(
      signature,
      webhookData,
    );
    return {
      success: true,
      message: 'Link click webhook processed successfully',
    };
  }

  // ===== WEBHOOK MANAGEMENT ENDPOINTS =====

  @Get('webhooks/endpoints')
  @ApiOperation({ summary: 'Get all webhook endpoints' })
  @ApiResponse({
    status: 200,
    description: 'Webhook endpoints retrieved successfully',
  })
  async getWebhookEndpoints() {
    const endpoints = await this.webhookManagementService.getWebhookEndpoints();
    return {
      success: true,
      data: endpoints,
      message: 'Webhook endpoints retrieved successfully',
    };
  }

  @Get('webhooks/endpoints/:id')
  @ApiOperation({ summary: 'Get webhook endpoint by ID' })
  @ApiResponse({
    status: 200,
    description: 'Webhook endpoint retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Webhook endpoint not found',
  })
  async getWebhookEndpoint(@Param('id') id: string) {
    const endpoint = await this.webhookManagementService.getWebhookEndpoint(id);
    if (!endpoint) {
      throw new NotFoundException('Webhook endpoint not found');
    }
    return {
      success: true,
      data: endpoint,
      message: 'Webhook endpoint retrieved successfully',
    };
  }

  @Post('webhooks/endpoints')
  @ApiOperation({ summary: 'Create or update webhook endpoint' })
  @ApiResponse({
    status: 201,
    description: 'Webhook endpoint created/updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async upsertWebhookEndpoint(@Body() endpointData: any) {
    const endpoint =
      await this.webhookManagementService.upsertWebhookEndpoint(endpointData);
    return {
      success: true,
      data: endpoint,
      message: 'Webhook endpoint created/updated successfully',
    };
  }

  @Delete('webhooks/endpoints/:id')
  @ApiOperation({ summary: 'Delete webhook endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Webhook endpoint deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Webhook endpoint not found',
  })
  async deleteWebhookEndpoint(@Param('id') id: string) {
    const deleted =
      await this.webhookManagementService.deleteWebhookEndpoint(id);
    if (!deleted) {
      throw new NotFoundException('Webhook endpoint not found');
    }
    return {
      success: true,
      message: 'Webhook endpoint deleted successfully',
    };
  }

  @Post('webhooks/endpoints/:id/test')
  @ApiOperation({ summary: 'Test webhook endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Webhook endpoint tested successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - endpoint not active',
  })
  @ApiResponse({
    status: 404,
    description: 'Webhook endpoint not found',
  })
  async testWebhookEndpoint(@Param('id') id: string, @Body() testData?: any) {
    const success = await this.webhookManagementService.testWebhookEndpoint(
      id,
      testData,
    );
    return {
      success: true,
      data: { success },
      message: success
        ? 'Webhook endpoint tested successfully'
        : 'Webhook endpoint test failed',
    };
  }

  @Get('webhooks/events')
  @ApiOperation({ summary: 'Get webhook events with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Webhook events retrieved successfully',
  })
  async getWebhookEvents(
    @Query('provider') provider?: string,
    @Query('eventType') eventType?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const filters = { provider, eventType, status, limit, offset };
    const result =
      await this.webhookManagementService.getWebhookEvents(filters);
    return {
      success: true,
      data: result,
      message: 'Webhook events retrieved successfully',
    };
  }

  @Get('webhooks/events/:eventId')
  @ApiOperation({ summary: 'Get webhook event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Webhook event retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Webhook event not found',
  })
  async getWebhookEvent(@Param('eventId') eventId: string) {
    const event = await this.webhookManagementService.getWebhookEvent(eventId);
    if (!event) {
      throw new NotFoundException('Webhook event not found');
    }
    return {
      success: true,
      data: event,
      message: 'Webhook event retrieved successfully',
    };
  }

  @Get('webhooks/stats')
  @ApiOperation({ summary: 'Get webhook statistics' })
  @ApiResponse({
    status: 200,
    description: 'Webhook statistics retrieved successfully',
  })
  async getWebhookStats() {
    const stats = await this.webhookManagementService.getWebhookStats();
    return {
      success: true,
      data: stats,
      message: 'Webhook statistics retrieved successfully',
    };
  }

  @Post('webhooks/retry-failed')
  @ApiOperation({ summary: 'Retry failed webhook events' })
  @ApiResponse({
    status: 200,
    description: 'Failed webhooks retry process completed',
  })
  async retryFailedWebhooks() {
    const retryCount =
      await this.webhookManagementService.retryFailedWebhooks();
    return {
      success: true,
      data: { retryCount },
      message: `Retry process completed. ${retryCount} webhooks scheduled for retry.`,
    };
  }

  @Post('webhooks/cleanup')
  @ApiOperation({ summary: 'Clean up old webhook events' })
  @ApiResponse({
    status: 200,
    description: 'Webhook cleanup completed successfully',
  })
  async cleanupOldWebhookEvents(@Query('daysToKeep') daysToKeep: number = 30) {
    const deletedCount =
      await this.webhookManagementService.cleanupOldWebhookEvents(daysToKeep);
    return {
      success: true,
      data: { deletedCount, daysToKeep },
      message: `Cleanup completed. ${deletedCount} old webhook events deleted.`,
    };
  }
}
