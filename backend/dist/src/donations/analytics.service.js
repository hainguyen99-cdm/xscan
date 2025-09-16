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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const analytics_event_schema_1 = require("./schemas/analytics-event.schema");
const donation_link_schema_1 = require("./schemas/donation-link.schema");
const donation_schema_1 = require("./schemas/donation.schema");
const UAParser = require('ua-parser-js');
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    constructor(analyticsEventModel, donationLinkModel, donationModel) {
        this.analyticsEventModel = analyticsEventModel;
        this.donationLinkModel = donationLinkModel;
        this.donationModel = donationModel;
        this.logger = new common_1.Logger(AnalyticsService_1.name);
    }
    async trackPageView(donationLinkId, req, metadata) {
        try {
            const eventData = await this.buildEventData(req, 'page_view', metadata);
            await this.analyticsEventModel.create({
                donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
                ...eventData,
            });
            await this.donationLinkModel.findByIdAndUpdate(donationLinkId, {
                $inc: { pageViews: 1 },
            });
            this.logger.log(`Page view tracked for donation link: ${donationLinkId}`);
        }
        catch (error) {
            this.logger.error(`Failed to track page view: ${error.message}`);
        }
    }
    async trackDonationStarted(donationLinkId, req, metadata) {
        try {
            const eventData = await this.buildEventData(req, 'donation_started', metadata);
            await this.analyticsEventModel.create({
                donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
                ...eventData,
            });
            this.logger.log(`Donation started tracked for donation link: ${donationLinkId}`);
        }
        catch (error) {
            this.logger.error(`Failed to track donation started: ${error.message}`);
        }
    }
    async trackDonationCompleted(donationLinkId, req, metadata) {
        try {
            const eventData = await this.buildEventData(req, 'donation_completed', metadata);
            await this.analyticsEventModel.create({
                donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
                ...eventData,
            });
            this.logger.log(`Donation completed tracked for donation link: ${donationLinkId}`);
        }
        catch (error) {
            this.logger.error(`Failed to track donation completed: ${error.message}`);
        }
    }
    async trackQRCodeScanned(donationLinkId, req, metadata) {
        try {
            const eventData = await this.buildEventData(req, 'qr_code_scanned', metadata);
            await this.analyticsEventModel.create({
                donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
                ...eventData,
            });
            this.logger.log(`QR code scan tracked for donation link: ${donationLinkId}`);
        }
        catch (error) {
            this.logger.error(`Failed to track QR code scan: ${error.message}`);
        }
    }
    async trackSocialShare(donationLinkId, req, metadata) {
        try {
            const eventData = await this.buildEventData(req, 'social_share', metadata);
            await this.analyticsEventModel.create({
                donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
                ...eventData,
            });
            this.logger.log(`Social share tracked for donation link: ${donationLinkId}`);
        }
        catch (error) {
            this.logger.error(`Failed to track social share: ${error.message}`);
        }
    }
    async trackLinkClick(donationLinkId, req, metadata) {
        try {
            const eventData = await this.buildEventData(req, 'link_clicked', metadata);
            await this.analyticsEventModel.create({
                donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
                ...eventData,
            });
            this.logger.log(`Link click tracked for donation link: ${donationLinkId}`);
        }
        catch (error) {
            this.logger.error(`Failed to track link click: ${error.message}`);
        }
    }
    async getAnalyticsSummary(donationLinkId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const events = await this.analyticsEventModel.aggregate([
                {
                    $match: {
                        donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
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
                        donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
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
                        donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
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
                        donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
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
                    averageEventsPerDay: events.reduce((sum, day) => sum + day.totalEvents, 0) / days,
                },
                dailyEvents: events,
                eventTypeBreakdown: eventTypeCounts,
                deviceBreakdown: deviceStats,
                browserBreakdown: browserStats,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get analytics summary: ${error.message}`);
            throw error;
        }
    }
    async getRealTimeAnalytics(donationLinkId) {
        try {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const [hourlyStats, dailyStats, currentVisitors] = await Promise.all([
                this.analyticsEventModel.countDocuments({
                    donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
                    timestamp: { $gte: oneHourAgo },
                }),
                this.analyticsEventModel.countDocuments({
                    donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
                    timestamp: { $gte: oneDayAgo },
                }),
                this.analyticsEventModel.distinct('sessionId', {
                    donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
                    timestamp: { $gte: new Date(now.getTime() - 30 * 60 * 1000) },
                }),
            ]);
            return {
                lastHour: hourlyStats,
                last24Hours: dailyStats,
                currentVisitors: currentVisitors.length,
                timestamp: now,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get real-time analytics: ${error.message}`);
            throw error;
        }
    }
    async getConversionFunnel(donationLinkId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const funnelData = await this.analyticsEventModel.aggregate([
                {
                    $match: {
                        donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
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
            const pageViews = funnelData.find((d) => d.eventType === 'page_view')?.count || 0;
            const donationStarted = funnelData.find((d) => d.eventType === 'donation_started')?.count || 0;
            const donationCompleted = funnelData.find((d) => d.eventType === 'donation_completed')?.count ||
                0;
            return {
                funnel: {
                    pageViews,
                    donationStarted,
                    donationCompleted,
                    conversionRates: {
                        viewToStart: pageViews > 0 ? (donationStarted / pageViews) * 100 : 0,
                        startToComplete: donationStarted > 0
                            ? (donationCompleted / donationStarted) * 100
                            : 0,
                        overall: pageViews > 0 ? (donationCompleted / pageViews) * 100 : 0,
                    },
                },
                eventBreakdown: funnelData,
                timeRange: days,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get conversion funnel: ${error.message}`);
            throw error;
        }
    }
    async getGeographicAnalytics(donationLinkId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const geoData = await this.analyticsEventModel.aggregate([
                {
                    $match: {
                        donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
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
        }
        catch (error) {
            this.logger.error(`Failed to get geographic analytics: ${error.message}`);
            throw error;
        }
    }
    async getPerformanceMetrics(donationLinkId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const performanceData = await this.analyticsEventModel.aggregate([
                {
                    $match: {
                        donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
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
            const errorData = await this.analyticsEventModel.aggregate([
                {
                    $match: {
                        donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
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
            const loadTimeData = await this.analyticsEventModel.aggregate([
                {
                    $match: {
                        donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
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
        }
        catch (error) {
            this.logger.error(`Failed to get performance metrics: ${error.message}`);
            throw error;
        }
    }
    async getSocialMediaAnalytics(donationLinkId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const socialData = await this.analyticsEventModel.aggregate([
                {
                    $match: {
                        donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
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
        }
        catch (error) {
            this.logger.error(`Failed to get social media analytics: ${error.message}`);
            throw error;
        }
    }
    async getUTMAnalytics(donationLinkId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const utmData = await this.analyticsEventModel.aggregate([
                {
                    $match: {
                        donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
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
        }
        catch (error) {
            this.logger.error(`Failed to get UTM analytics: ${error.message}`);
            throw error;
        }
    }
    async exportAnalyticsData(donationLinkId, startDate, endDate, format = 'json') {
        try {
            const events = await this.analyticsEventModel
                .find({
                donationLinkId: new mongoose_2.Types.ObjectId(donationLinkId),
                timestamp: { $gte: startDate, $lte: endDate },
            })
                .sort({ timestamp: 1 });
            if (format === 'csv') {
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
        }
        catch (error) {
            this.logger.error(`Failed to export analytics data: ${error.message}`);
            throw error;
        }
    }
    async getStreamerAnalyticsDashboard(streamerId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const donationLinks = await this.donationLinkModel
                .find({
                streamerId: new mongoose_2.Types.ObjectId(streamerId),
            })
                .select('_id slug customUrl title');
            const linkIds = donationLinks.map((link) => link._id);
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
        }
        catch (error) {
            this.logger.error(`Failed to get streamer analytics dashboard: ${error.message}`);
            throw error;
        }
    }
    async cleanupOldEvents(daysToKeep = 365) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            const result = await this.analyticsEventModel.deleteMany({
                timestamp: { $lt: cutoffDate },
            });
            this.logger.log(`Cleaned up ${result.deletedCount} old analytics events`);
        }
        catch (error) {
            this.logger.error(`Failed to cleanup old events: ${error.message}`);
        }
    }
    async buildEventData(req, eventType, metadata) {
        const userAgent = req.headers['user-agent'] || '';
        const parser = new UAParser(userAgent);
        const result = parser.getResult();
        let sessionId = req.headers['x-session-id'];
        if (!sessionId) {
            sessionId = this.generateSessionId();
        }
        let visitorId = req.headers['x-visitor-id'];
        if (!visitorId) {
            visitorId = this.generateVisitorId();
        }
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
    extractUTMParams(query) {
        const utmParams = {};
        if (query.utm_source)
            utmParams.utmSource = query.utm_source;
        if (query.utm_medium)
            utmParams.utmMedium = query.utm_medium;
        if (query.utm_campaign)
            utmParams.utmCampaign = query.utm_campaign;
        if (query.utm_term)
            utmParams.utmTerm = query.utm_term;
        if (query.utm_content)
            utmParams.utmContent = query.utm_content;
        return utmParams;
    }
    getDeviceType(result) {
        if (result.device.type) {
            return result.device.type;
        }
        if (result.os.name === 'Android' || result.os.name === 'iOS') {
            return 'mobile';
        }
        return 'desktop';
    }
    generateSessionId() {
        return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateVisitorId() {
        return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(analytics_event_schema_1.AnalyticsEvent.name)),
    __param(1, (0, mongoose_1.InjectModel)(donation_link_schema_1.DonationLink.name)),
    __param(2, (0, mongoose_1.InjectModel)(donation_schema_1.Donation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map