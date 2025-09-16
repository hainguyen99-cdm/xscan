import { Model } from 'mongoose';
import { WebhookEvent, WebhookEventDocument } from './schemas/webhook-event.schema';
import { ConfigService } from '../config/config.service';
import { DonationsService } from './donations.service';
export interface WebhookEndpoint {
    id: string;
    name: string;
    url: string;
    provider: string;
    events: string[];
    isActive: boolean;
    secret?: string;
    retryConfig: {
        maxRetries: number;
        retryDelay: number;
        backoffMultiplier: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface WebhookRetryConfig {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    retryDelay: number;
}
export declare class WebhookManagementService {
    private webhookEventModel;
    private readonly configService;
    private readonly donationsService;
    private readonly logger;
    private readonly webhookEndpoints;
    private readonly retryConfig;
    constructor(webhookEventModel: Model<WebhookEventDocument>, configService: ConfigService, donationsService: DonationsService);
    private initializeWebhookEndpoints;
    getWebhookEndpoints(): Promise<WebhookEndpoint[]>;
    getWebhookEndpoint(id: string): Promise<WebhookEndpoint | null>;
    upsertWebhookEndpoint(endpoint: Partial<WebhookEndpoint>): Promise<WebhookEndpoint>;
    deleteWebhookEndpoint(id: string): Promise<boolean>;
    testWebhookEndpoint(id: string, testData?: any): Promise<boolean>;
    storeWebhookEvent(eventData: Partial<WebhookEvent>): Promise<WebhookEvent>;
    getWebhookEvent(eventId: string): Promise<WebhookEvent | null>;
    getWebhookEvents(filters?: {
        provider?: string;
        eventType?: string;
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        events: WebhookEvent[];
        total: number;
    }>;
    retryFailedWebhooks(): Promise<number>;
    private retryWebhookEvent;
    getWebhookStats(): Promise<{
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
    }>;
    cleanupOldWebhookEvents(daysToKeep?: number): Promise<number>;
}
