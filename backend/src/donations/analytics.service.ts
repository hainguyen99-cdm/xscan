import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AnalyticsEvent,
  AnalyticsEventDocument,
} from './schemas/analytics-event.schema';
import {
  DonationLink,
  DonationLinkDocument,
} from './schemas/donation-link.schema';
import { Donation, DonationDocument } from './schemas/donation.schema';
import { Request } from 'express';
const UAParser = require('ua-parser-js');

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(AnalyticsEvent.name)
    private analyticsEventModel: Model<AnalyticsEventDocument>,
    @InjectModel(DonationLink.name)
    private donationLinkModel: Model<DonationLinkDocument>,
    @InjectModel(Donation.name) private donationModel: Model<DonationDocument>,
  ) {}

  /**
   * Track a page view event for a donation link
   */
  async trackPageView(
    donationLinkId: string,
    req: Request,
    metadata?: any,
  ): Promise<void> {
    try {
      const eventData = await this.buildEventData(req, 'page_view', metadata);

      await this.analyticsEventModel.create({
        donationLinkId: new Types.ObjectId(donationLinkId),
        ...eventData,
      });

      // Increment page views in donation link
      await this.donationLinkModel.findByIdAndUpdate(donationLinkId, {
        $inc: { pageViews: 1 },
      });

      this.logger.log(`Page view tracked for donation link: ${donationLinkId}`);
    } catch (error) {
      this.logger.error(`Failed to track page view: ${error.message}`);
    }
  }

  /**
   * Track a donation started event
   */
  async trackDonationStarted(
    donationLinkId: string,
    req: Request,
    metadata?: any,
  ): Promise<void> {
    try {
      const eventData = await this.buildEventData(
        req,
        'donation_started',
        metadata,
      );

      await this.analyticsEventModel.create({
        donationLinkId: new Types.ObjectId(donationLinkId),
        ...eventData,
      });

      this.logger.log(
        `Donation started tracked for donation link: ${donationLinkId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to track donation started: ${error.message}`);
    }
  }

  /**
   * Track a donation completed event
   */
  async trackDonationCompleted(
    donationLinkId: string,
    req: Request,
    metadata?: any,
  ): Promise<void> {
    try {
      const eventData = await this.buildEventData(
        req,
        'donation_completed',
        metadata,
      );

      await this.analyticsEventModel.create({
        donationLinkId: new Types.ObjectId(donationLinkId),
        ...eventData,
      });

      this.logger.log(
        `Donation completed tracked for donation link: ${donationLinkId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to track donation completed: ${error.message}`);
    }
  }

  /**
   * Track a QR code scan event
   */
  async trackQRCodeScanned(
    donationLinkId: string,
    req: Request,
    metadata?: any,
  ): Promise<void> {
    try {
      const eventData = await this.buildEventData(
        req,
        'qr_code_scanned',
        metadata,
      );

      await this.analyticsEventModel.create({
        donationLinkId: new Types.ObjectId(donationLinkId),
        ...eventData,
      });

      this.logger.log(
        `QR code scan tracked for donation link: ${donationLinkId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to track QR code scan: ${error.message}`);
    }
  }

  /**
   * Track a social media share event
   */
  async trackSocialShare(
    donationLinkId: string,
    req: Request,
    metadata?: any,
  ): Promise<void> {
    try {
      const eventData = await this.buildEventData(
        req,
        'social_share',
        metadata,
      );

      await this.analyticsEventModel.create({
        donationLinkId: new Types.ObjectId(donationLinkId),
        ...eventData,
      });

      this.logger.log(
        `Social share tracked for donation link: ${donationLinkId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to track social share: ${error.message}`);
    }
  }

  /**
   * Track a link click event
   */
  async trackLinkClick(
    donationLinkId: string,
    req: Request,
    metadata?: any,
  ): Promise<void> {
    try {
      const eventData = await this.buildEventData(
        req,
        'link_clicked',
        metadata,
      );

      await this.analyticsEventModel.create({
        donationLinkId: new Types.ObjectId(donationLinkId),
        ...eventData,
      });

      this.logger.log(
        `Link click tracked for donation link: ${donationLinkId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to track link click: ${error.message}`);
    }
  }

  /**
   * Get analytics summary for a donation link
   */
  async getAnalyticsSummary(
    donationLinkId: string,
    days: number = 30,
  ): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const events = await this.analyticsEventModel.aggregate([
        {
          $match: {
            donationLinkId: new Types.ObjectId(donationLinkId),
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              eventType: '$eventType',
              date: {
                $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.date',
            events: {
              $push: {
                eventType: '$_id.eventType',
                count: '$count',
              },
            },
            totalEvents: { $sum: '$count' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const eventTypeCounts = await this.analyticsEventModel.aggregate([
        {
          $match: {
            donationLinkId: new Types.ObjectId(donationLinkId),
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 },
          },
        },
      ]);

      const deviceStats = await this.analyticsEventModel.aggregate([
        {
          $match: {
            donationLinkId: new Types.ObjectId(donationLinkId),
            timestamp: { $gte: startDate },
            'metadata.deviceType': { $exists: true },
          },
        },
        {
          $group: {
            _id: '$metadata.deviceType',
            count: { $sum: 1 },
          },
        },
      ]);

      const browserStats = await this.analyticsEventModel.aggregate([
        {
          $match: {
            donationLinkId: new Types.ObjectId(donationLinkId),
            timestamp: { $gte: startDate },
            'metadata.browser': { $exists: true },
          },
        },
        {
          $group: {
            _id: '$metadata.browser',
            count: { $sum: 1 },
          },
        },
      ]);

      return {
        summary: {
          totalEvents: events.reduce((sum, day) => sum + day.totalEvents, 0),
          totalDays: days,
          averageEventsPerDay:
            events.reduce((sum, day) => sum + day.totalEvents, 0) / days,
        },
        dailyEvents: events,
        eventTypeBreakdown: eventTypeCounts,
        deviceBreakdown: deviceStats,
        browserBreakdown: browserStats,
      };
    } catch (error) {
      this.logger.error(`Failed to get analytics summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get real-time analytics for a donation link
   */
  async getRealTimeAnalytics(donationLinkId: string): Promise<any> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [hourlyStats, dailyStats, currentVisitors] = await Promise.all([
        // Last hour events
        this.analyticsEventModel.countDocuments({
          donationLinkId: new Types.ObjectId(donationLinkId),
          timestamp: { $gte: oneHourAgo },
        }),
        // Last 24 hours events
        this.analyticsEventModel.countDocuments({
          donationLinkId: new Types.ObjectId(donationLinkId),
          timestamp: { $gte: oneDayAgo },
        }),
        // Current active sessions (last 30 minutes)
        this.analyticsEventModel.distinct('sessionId', {
          donationLinkId: new Types.ObjectId(donationLinkId),
          timestamp: { $gte: new Date(now.getTime() - 30 * 60 * 1000) },
        }),
      ]);

      return {
        lastHour: hourlyStats,
        last24Hours: dailyStats,
        currentVisitors: currentVisitors.length,
        timestamp: now,
      };
    } catch (error) {
      this.logger.error(`Failed to get real-time analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get conversion funnel analysis for a donation link
   */
  async getConversionFunnel(
    donationLinkId: string,
    days: number = 30,
  ): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const funnelData = await this.analyticsEventModel.aggregate([
        {
          $match: {
            donationLinkId: new Types.ObjectId(donationLinkId),
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorId' },
          },
        },
        {
          $project: {
            eventType: '$_id',
            count: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' },
          },
        },
      ]);

      // Calculate conversion rates
      const pageViews =
        funnelData.find((d) => d.eventType === 'page_view')?.count || 0;
      const donationStarted =
        funnelData.find((d) => d.eventType === 'donation_started')?.count || 0;
      const donationCompleted =
        funnelData.find((d) => d.eventType === 'donation_completed')?.count ||
        0;

      return {
        funnel: {
          pageViews,
          donationStarted,
          donationCompleted,
          conversionRates: {
            viewToStart:
              pageViews > 0 ? (donationStarted / pageViews) * 100 : 0,
            startToComplete:
              donationStarted > 0
                ? (donationCompleted / donationStarted) * 100
                : 0,
            overall: pageViews > 0 ? (donationCompleted / pageViews) * 100 : 0,
          },
        },
        eventBreakdown: funnelData,
        timeRange: days,
      };
    } catch (error) {
      this.logger.error(`Failed to get conversion funnel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get geographic analytics for a donation link
   */
  async getGeographicAnalytics(
    donationLinkId: string,
    days: number = 30,
  ): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const geoData = await this.analyticsEventModel.aggregate([
        {
          $match: {
            donationLinkId: new Types.ObjectId(donationLinkId),
            timestamp: { $gte: startDate },
            'metadata.country': { $exists: true },
          },
        },
        {
          $group: {
            _id: {
              country: '$metadata.country',
              city: '$metadata.city',
            },
            count: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorId' },
            donations: {
              $sum: {
                $cond: [{ $eq: ['$eventType', 'donation_completed'] }, 1, 0],
              },
            },
          },
        },
        {
          $group: {
            _id: '$_id.country',
            cities: {
              $push: {
                city: '$_id.city',
                count: '$count',
                uniqueVisitors: { $size: '$uniqueVisitors' },
                donations: '$donations',
              },
            },
            totalCount: { $sum: '$count' },
            totalUniqueVisitors: { $addToSet: '$uniqueVisitors' },
            totalDonations: { $sum: '$donations' },
          },
        },
        {
          $project: {
            country: '$_id',
            cities: 1,
            totalCount: 1,
            totalUniqueVisitors: { $size: '$totalUniqueVisitors' },
            totalDonations: 1,
          },
        },
        { $sort: { totalCount: -1 } },
      ]);

      return {
        geographic: geoData,
        timeRange: days,
      };
    } catch (error) {
      this.logger.error(`Failed to get geographic analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get performance metrics for a donation link
   */
  async getPerformanceMetrics(
    donationLinkId: string,
    days: number = 30,
  ): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get response time data (if available in metadata)
      const performanceData = await this.analyticsEventModel.aggregate([
        {
          $match: {
            donationLinkId: new Types.ObjectId(donationLinkId),
            timestamp: { $gte: startDate },
            'metadata.responseTime': { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$metadata.responseTime' },
            minResponseTime: { $min: '$metadata.responseTime' },
            maxResponseTime: { $max: '$metadata.responseTime' },
            totalRequests: { $sum: 1 },
          },
        },
      ]);

      // Get error rates
      const errorData = await this.analyticsEventModel.aggregate([
        {
          $match: {
            donationLinkId: new Types.ObjectId(donationLinkId),
            timestamp: { $gte: startDate },
            'metadata.error': { $exists: true },
          },
        },
        {
          $group: {
            _id: '$metadata.error',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Get load time distribution
      const loadTimeData = await this.analyticsEventModel.aggregate([
        {
          $match: {
            donationLinkId: new Types.ObjectId(donationLinkId),
            timestamp: { $gte: startDate },
            'metadata.loadTime': { $exists: true },
          },
        },
        {
          $group: {
            _id: {
              $cond: [
                { $lt: ['$metadata.loadTime', 1000] },
                'fast',
                {
                  $cond: [
                    { $lt: ['$metadata.loadTime', 3000] },
                    'medium',
                    'slow',
                  ],
                },
              ],
            },
            count: { $sum: 1 },
            avgLoadTime: { $avg: '$metadata.loadTime' },
          },
        },
      ]);

      return {
        performance: performanceData[0] || {},
        errors: errorData,
        loadTimeDistribution: loadTimeData,
        timeRange: days,
      };
    } catch (error) {
      this.logger.error(`Failed to get performance metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get social media analytics for a donation link
   */
  async getSocialMediaAnalytics(
    donationLinkId: string,
    days: number = 30,
  ): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const socialData = await this.analyticsEventModel.aggregate([
        {
          $match: {
            donationLinkId: new Types.ObjectId(donationLinkId),
            timestamp: { $gte: startDate },
            eventType: 'social_share',
          },
        },
        {
          $group: {
            _id: '$metadata.socialPlatform',
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$visitorId' },
            totalReach: { $sum: { $ifNull: ['$metadata.reach', 0] } },
            totalEngagement: { $sum: { $ifNull: ['$metadata.engagement', 0] } },
          },
        },
        {
          $project: {
            platform: '$_id',
            shares: '$count',
            uniqueUsers: { $size: '$uniqueUsers' },
            totalReach: 1,
            totalEngagement: 1,
            avgReach: { $divide: ['$totalReach', '$count'] },
            avgEngagement: { $divide: ['$totalEngagement', '$count'] },
          },
        },
        { $sort: { shares: -1 } },
      ]);

      return {
        socialMedia: socialData,
        timeRange: days,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get social media analytics: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get UTM campaign analytics for a donation link
   */
  async getUTMAnalytics(
    donationLinkId: string,
    days: number = 30,
  ): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const utmData = await this.analyticsEventModel.aggregate([
        {
          $match: {
            donationLinkId: new Types.ObjectId(donationLinkId),
            timestamp: { $gte: startDate },
            $or: [
              { 'metadata.utmSource': { $exists: true } },
              { 'metadata.utmMedium': { $exists: true } },
              { 'metadata.utmCampaign': { $exists: true } },
            ],
          },
        },
        {
          $group: {
            _id: {
              source: '$metadata.utmSource',
              medium: '$metadata.utmMedium',
              campaign: '$metadata.utmCampaign',
            },
            count: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorId' },
            donations: {
              $sum: {
                $cond: [{ $eq: ['$eventType', 'donation_completed'] }, 1, 0],
              },
            },
            totalAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$eventType', 'donation_completed'] },
                  { $ifNull: ['$metadata.donationAmount', 0] },
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            utmSource: '$_id.source',
            utmMedium: '$_id.medium',
            utmCampaign: '$_id.campaign',
            visits: '$count',
            uniqueVisitors: { $size: '$uniqueVisitors' },
            donations: '$donations',
            totalAmount: '$totalAmount',
            conversionRate: {
              $cond: [
                { $gt: ['$count', 0] },
                { $multiply: [{ $divide: ['$donations', '$count'] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { visits: -1 } },
      ]);

      return {
        utmCampaigns: utmData,
        timeRange: days,
      };
    } catch (error) {
      this.logger.error(`Failed to get UTM analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export analytics data for a donation link
   */
  async exportAnalyticsData(
    donationLinkId: string,
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json',
  ): Promise<any> {
    try {
      const events = await this.analyticsEventModel
        .find({
          donationLinkId: new Types.ObjectId(donationLinkId),
          timestamp: { $gte: startDate, $lte: endDate },
        })
        .sort({ timestamp: 1 });

      if (format === 'csv') {
        // Convert to CSV format
        const csvData = events.map((event) => ({
          timestamp: event.timestamp.toISOString(),
          eventType: event.eventType,
          sessionId: event.sessionId,
          visitorId: event.visitorId,
          userAgent: event.metadata?.userAgent,
          ipAddress: event.metadata?.ipAddress,
          referrer: event.metadata?.referrer,
          deviceType: event.metadata?.deviceType,
          browser: event.metadata?.browser,
          os: event.metadata?.os,
          country: event.metadata?.country,
          city: event.metadata?.city,
          utmSource: event.metadata?.utmSource,
          utmMedium: event.metadata?.utmMedium,
          utmCampaign: event.metadata?.utmCampaign,
        }));

        return {
          format: 'csv',
          data: csvData,
          filename: `analytics_${donationLinkId}_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`,
        };
      }

      return {
        format: 'json',
        data: events,
        metadata: {
          donationLinkId,
          startDate,
          endDate,
          totalEvents: events.length,
          exportDate: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to export analytics data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get analytics dashboard summary for a streamer
   */
  async getStreamerAnalyticsDashboard(
    streamerId: string,
    days: number = 30,
  ): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get all donation links for the streamer
      const donationLinks = await this.donationLinkModel
        .find({
          streamerId: new Types.ObjectId(streamerId),
        })
        .select('_id slug customUrl title');

      const linkIds = donationLinks.map((link) => link._id);

      // Get overall analytics for all links
      const overallStats = await this.analyticsEventModel.aggregate([
        {
          $match: {
            donationLinkId: { $in: linkIds },
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorId' },
            totalSessions: { $addToSet: '$sessionId' },
          },
        },
      ]);

      // Get top performing links
      const topLinks = await this.analyticsEventModel.aggregate([
        {
          $match: {
            donationLinkId: { $in: linkIds },
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$donationLinkId',
            totalEvents: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorId' },
            donations: {
              $sum: {
                $cond: [{ $eq: ['$eventType', 'donation_completed'] }, 1, 0],
              },
            },
          },
        },
        {
          $lookup: {
            from: 'donationlinks',
            localField: '_id',
            foreignField: '_id',
            as: 'linkInfo',
          },
        },
        {
          $project: {
            linkId: '$_id',
            slug: { $arrayElemAt: ['$linkInfo.slug', 0] },
            customUrl: { $arrayElemAt: ['$linkInfo.customUrl', 0] },
            title: { $arrayElemAt: ['$linkInfo.title', 0] },
            totalEvents: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' },
            donations: 1,
          },
        },
        { $sort: { totalEvents: -1 } },
        { $limit: 10 },
      ]);

      return {
        overview: {
          totalLinks: donationLinks.length,
          totalEvents: overallStats[0]?.totalEvents || 0,
          uniqueVisitors: overallStats[0]?.uniqueVisitors?.length || 0,
          totalSessions: overallStats[0]?.totalSessions?.length || 0,
        },
        topPerformingLinks: topLinks,
        timeRange: days,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get streamer analytics dashboard: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Clean up old analytics events
   */
  async cleanupOldEvents(daysToKeep: number = 365): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.analyticsEventModel.deleteMany({
        timestamp: { $lt: cutoffDate },
      });

      this.logger.log(`Cleaned up ${result.deletedCount} old analytics events`);
    } catch (error) {
      this.logger.error(`Failed to cleanup old events: ${error.message}`);
    }
  }

  /**
   * Build event data from request
   */
  private async buildEventData(
    req: Request,
    eventType: string,
    metadata?: any,
  ): Promise<any> {
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Generate or retrieve session ID
    let sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
      sessionId = this.generateSessionId();
    }

    // Generate or retrieve visitor ID
    let visitorId = req.headers['x-visitor-id'] as string;
    if (!visitorId) {
      visitorId = this.generateVisitorId();
    }

    // Extract UTM parameters from query string
    const utmParams = this.extractUTMParams(req.query);

    return {
      eventType,
      metadata: {
        userAgent,
        ipAddress: req.ip || req.connection.remoteAddress,
        referrer: req.headers.referer || req.headers.referrer,
        ...utmParams,
        deviceType: this.getDeviceType(result),
        browser: result.browser.name,
        os: result.os.name,
        ...metadata,
      },
      sessionId,
      visitorId,
      timestamp: new Date(),
    };
  }

  /**
   * Extract UTM parameters from query string
   */
  private extractUTMParams(query: any): any {
    const utmParams: any = {};

    if (query.utm_source) utmParams.utmSource = query.utm_source;
    if (query.utm_medium) utmParams.utmMedium = query.utm_medium;
    if (query.utm_campaign) utmParams.utmCampaign = query.utm_campaign;
    if (query.utm_term) utmParams.utmTerm = query.utm_term;
    if (query.utm_content) utmParams.utmContent = query.utm_content;

    return utmParams;
  }

  /**
   * Determine device type from user agent
   */
  private getDeviceType(result: any): string {
    if (result.device.type) {
      return result.device.type;
    }

    if (result.os.name === 'Android' || result.os.name === 'iOS') {
      return 'mobile';
    }

    return 'desktop';
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique visitor ID
   */
  private generateVisitorId(): string {
    return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
