import { DonationsService } from './donations.service';
import { AnalyticsService } from './analytics.service';
import { DonationProcessingService } from './donation-processing.service';
import { DonationWebhookService } from './donation-webhook.service';
import { CreateDonationLinkDto } from './dto/create-donation-link.dto';
import { UpdateDonationLinkDto, UpdateThemeDto, UpdateSocialMediaDto, AnalyticsEventDto } from './dto/update-donation-link.dto';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { DonationHistoryQueryDto, TopDonorsQueryDto, DonationAnalyticsQueryDto, DonationTrendsQueryDto, DonationComparisonQueryDto } from './dto/donation-history.dto';
import { WebhookManagementService } from './webhook-management.service';
export declare class DonationsController {
    private readonly donationsService;
    private readonly analyticsService;
    private readonly donationProcessingService;
    private readonly donationWebhookService;
    private readonly webhookManagementService;
    constructor(donationsService: DonationsService, analyticsService: AnalyticsService, donationProcessingService: DonationProcessingService, donationWebhookService: DonationWebhookService, webhookManagementService: WebhookManagementService);
    createDonationLink(req: any, createDto: CreateDonationLinkDto): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
        message: string;
    }>;
    setDefaultLink(req: any, id: string): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
    }>;
    createBulkDonationLinks(req: any, createDtos: CreateDonationLinkDto[]): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink[];
        message: string;
    }>;
    getAllDonationLinks(streamerId?: string, isActive?: boolean, isFeatured?: boolean, limit?: number, page?: number): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink[];
        pagination: any;
        message: string;
    }>;
    getFeaturedDonationLinks(limit?: number): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink[];
        message: string;
    }>;
    getDonationLinkById(id: string): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
        message: string;
    }>;
    getDonationLinkBySlug(slug: string, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getDonationLinkByCustomUrl(customUrl: string, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    updateDonationLink(id: string, req: any, updateDto: UpdateDonationLinkDto): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
        message: string;
    }>;
    updateDonationLinkTheme(id: string, req: any, themeDto: UpdateThemeDto): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
        message: string;
    }>;
    updateDonationLinkSocialMedia(id: string, req: any, socialMediaDto: UpdateSocialMediaDto): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
        message: string;
    }>;
    deleteDonationLink(id: string, req: any): Promise<void>;
    deleteBulkDonationLinks(req: any, ids: string[]): Promise<void>;
    toggleDonationLinkStatus(id: string, req: any): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
        message: string;
    }>;
    toggleDonationLinkFeatured(id: string, req: any): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
        message: string;
    }>;
    getDonationLinkStats(id: string, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getDonationLinkQRCode(id: string): Promise<{
        success: boolean;
        data: {
            qrCodeUrl: string;
            customUrl: string;
        };
        message: string;
    }>;
    regenerateDonationLinkQRCode(id: string, req: any): Promise<{
        success: boolean;
        data: {
            qrCodeUrl: string;
            customUrl: string;
        };
        message: string;
    }>;
    downloadDonationLinkQRCode(id: string): Promise<{
        success: boolean;
        data: {
            qrCodeBuffer: string;
            contentType: string;
        };
        message: string;
    }>;
    getDonationLinkSocialShare(id: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    trackAnalyticsEvent(id: string, eventData: AnalyticsEventDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getAnalyticsSummary(id: string, days: number, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getRealTimeAnalytics(id: string, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getConversionFunnel(id: string, days?: number): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getGeographicAnalytics(id: string, days?: number): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getPerformanceMetrics(id: string, days?: number): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getSocialMediaAnalytics(id: string, days?: number): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getUTMAnalytics(id: string, days?: number): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    exportAnalyticsData(id: string, startDate: string, endDate: string, format?: 'json' | 'csv'): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getStreamerAnalyticsDashboard(streamerId: string, days?: number): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    trackPageView(id: string, req: any, metadata?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    trackDonationStarted(id: string, req: any, metadata?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    trackDonationCompleted(id: string, req: any, metadata?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    trackQRCodeScanned(id: string, req: any, metadata?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    trackSocialShare(id: string, req: any, metadata?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    trackLinkClick(id: string, req: any, metadata?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    createDonation(req: any, createDto: CreateDonationDto): Promise<{
        success: boolean;
        data: import("./schemas/donation.schema").Donation;
        message: string;
    }>;
    getDonations(streamerId?: string, donorId?: string, status?: string, limit?: number, page?: number): Promise<{
        success: boolean;
        data: import("./schemas/donation.schema").Donation[];
        pagination: any;
        message: string;
    }>;
    getDonationById(id: string): Promise<{
        success: boolean;
        data: import("./schemas/donation.schema").Donation;
        message: string;
    }>;
    updateDonation(id: string, updateDto: UpdateDonationDto): Promise<{
        success: boolean;
        data: import("./schemas/donation.schema").Donation;
        message: string;
    }>;
    deleteDonation(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getDonationStats(streamerId?: string, timeRange?: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getDonationHistory(query: DonationHistoryQueryDto): Promise<{
        success: boolean;
        data: import("./schemas/donation.schema").Donation[];
        pagination: any;
        summary: any;
        message: string;
    }>;
    getTopDonors(streamerId: string, query: TopDonorsQueryDto): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    getDonationAnalytics(query: DonationAnalyticsQueryDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getDonationTrends(query: DonationTrendsQueryDto): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    getDonationComparison(query: DonationComparisonQueryDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getDonationsByCurrency(streamerId?: string): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    processDonation(req: any, createDto: CreateDonationDto): Promise<{
        success: boolean;
        data: import("./donation-processing.service").DonationProcessingResult;
        message: string;
    }>;
    confirmExternalPayment(donationId: string, body: {
        paymentIntentId: string;
    }): Promise<{
        success: boolean;
        data: import("./donation-processing.service").DonationProcessingResult;
        message: string;
    }>;
    getProcessingStatus(donationId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    processStripeWebhook(signature: string, webhookData: any, request: any): Promise<{
        success: boolean;
        message: string;
    }>;
    processPayPalWebhook(signature: string, webhookData: any, request: any): Promise<{
        success: boolean;
        message: string;
    }>;
    processDonationCompletedWebhook(signature: string, webhookData: any, request: any): Promise<{
        success: boolean;
        message: string;
    }>;
    processDonationStartedWebhook(signature: string, webhookData: any, request: any): Promise<{
        success: boolean;
        message: string;
    }>;
    processQRScannedWebhook(signature: string, webhookData: any, request: any): Promise<{
        success: boolean;
        message: string;
    }>;
    processSocialShareWebhook(signature: string, webhookData: any, request: any): Promise<{
        success: boolean;
        message: string;
    }>;
    processLinkClickWebhook(signature: string, webhookData: any, request: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getWebhookEndpoints(): Promise<{
        success: boolean;
        data: import("./webhook-management.service").WebhookEndpoint[];
        message: string;
    }>;
    getWebhookEndpoint(id: string): Promise<{
        success: boolean;
        data: import("./webhook-management.service").WebhookEndpoint;
        message: string;
    }>;
    upsertWebhookEndpoint(endpointData: any): Promise<{
        success: boolean;
        data: import("./webhook-management.service").WebhookEndpoint;
        message: string;
    }>;
    deleteWebhookEndpoint(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    testWebhookEndpoint(id: string, testData?: any): Promise<{
        success: boolean;
        data: {
            success: boolean;
        };
        message: string;
    }>;
    getWebhookEvents(provider?: string, eventType?: string, status?: string, limit?: number, offset?: number): Promise<{
        success: boolean;
        data: {
            events: import("./schemas/webhook-event.schema").WebhookEvent[];
            total: number;
        };
        message: string;
    }>;
    getWebhookEvent(eventId: string): Promise<{
        success: boolean;
        data: import("./schemas/webhook-event.schema").WebhookEvent;
        message: string;
    }>;
    getWebhookStats(): Promise<{
        success: boolean;
        data: {
            totalWebhooks: number;
            successfulWebhooks: number;
            failedWebhooks: number;
            averageProcessingTime: number;
            lastWebhookProcessed: string;
            providers: Record<string, {
                total: number;
                success: number;
                failed: number;
            }>;
        };
        message: string;
    }>;
    retryFailedWebhooks(): Promise<{
        success: boolean;
        data: {
            retryCount: number;
        };
        message: string;
    }>;
    cleanupOldWebhookEvents(daysToKeep?: number): Promise<{
        success: boolean;
        data: {
            deletedCount: number;
            daysToKeep: number;
        };
        message: string;
    }>;
}
