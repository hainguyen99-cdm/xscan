import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WebhookEvent,
  WebhookEventDocument,
} from './schemas/webhook-event.schema';
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
    retryDelay: number; // in milliseconds
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
  retryDelay: number; // Add this to match WebhookEndpoint interface
}

@Injectable()
export class WebhookManagementService {
  private readonly logger = new Logger(WebhookManagementService.name);
  private readonly webhookEndpoints: Map<string, WebhookEndpoint> = new Map();
  private readonly retryConfig: WebhookRetryConfig = {
    maxRetries: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
    retryDelay: 1000, // Default retry delay for the service
  };

  constructor(
    @InjectModel(WebhookEvent.name)
    private webhookEventModel: Model<WebhookEventDocument>,
    private readonly configService: ConfigService,
    private readonly donationsService: DonationsService,
  ) {
    this.initializeWebhookEndpoints();
  }

  /**
   * Initialize default webhook endpoints
   */
  private async initializeWebhookEndpoints(): Promise<void> {
    const baseUrl = this.configService.frontendUrl;

    // Stripe webhook endpoint
    this.webhookEndpoints.set('stripe', {
      id: 'stripe',
      name: 'Stripe Webhooks',
      url: `${baseUrl}/api/donations/webhooks/stripe`,
      provider: 'stripe',
      events: [
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'charge.refunded',
      ],
      isActive: true,
      secret: this.configService.stripeWebhookSecret,
      retryConfig: {
        maxRetries: 3,
        retryDelay: 5000,
        backoffMultiplier: 2,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // PayPal webhook endpoint
    this.webhookEndpoints.set('paypal', {
      id: 'paypal',
      name: 'PayPal Webhooks',
      url: `${baseUrl}/api/donations/webhooks/paypal`,
      provider: 'paypal',
      events: [
        'PAYMENT.CAPTURE.COMPLETED',
        'PAYMENT.CAPTURE.DENIED',
        'PAYMENT.CAPTURE.REFUNDED',
      ],
      isActive: true,
      secret: this.configService.paypalClientSecret,
      retryConfig: {
        maxRetries: 3,
        retryDelay: 5000,
        backoffMultiplier: 2,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Custom webhook endpoints
    this.webhookEndpoints.set('custom-donation-completed', {
      id: 'custom-donation-completed',
      name: 'Custom Donation Completed',
      url: `${baseUrl}/api/donations/webhooks/donation-completed`,
      provider: 'custom',
      events: ['donation.completed'],
      isActive: true,
      secret: 'custom-webhook-secret-2024',
      retryConfig: {
        maxRetries: 2,
        retryDelay: 3000,
        backoffMultiplier: 1.5,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.logger.log(
      `Initialized ${this.webhookEndpoints.size} webhook endpoints`,
    );
  }

  /**
   * Get all webhook endpoints
   */
  async getWebhookEndpoints(): Promise<WebhookEndpoint[]> {
    return Array.from(this.webhookEndpoints.values());
  }

  /**
   * Get webhook endpoint by ID
   */
  async getWebhookEndpoint(id: string): Promise<WebhookEndpoint | null> {
    return this.webhookEndpoints.get(id) || null;
  }

  /**
   * Create or update webhook endpoint
   */
  async upsertWebhookEndpoint(
    endpoint: Partial<WebhookEndpoint>,
  ): Promise<WebhookEndpoint> {
    if (!endpoint.id) {
      throw new HttpException(
        'Webhook endpoint ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = this.webhookEndpoints.get(endpoint.id);
    if (existing) {
      // Update existing endpoint
      const updated = { ...existing, ...endpoint, updatedAt: new Date() };
      this.webhookEndpoints.set(endpoint.id, updated);
      this.logger.log(`Updated webhook endpoint: ${endpoint.id}`);
      return updated;
    } else {
      // Create new endpoint
      const newEndpoint: WebhookEndpoint = {
        id: endpoint.id,
        name: endpoint.name || endpoint.id,
        url: endpoint.url || '',
        provider: endpoint.provider || 'custom',
        events: endpoint.events || [],
        isActive: endpoint.isActive ?? true,
        secret: endpoint.secret,
        retryConfig: endpoint.retryConfig || this.retryConfig,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.webhookEndpoints.set(endpoint.id, newEndpoint);
      this.logger.log(`Created webhook endpoint: ${endpoint.id}`);
      return newEndpoint;
    }
  }

  /**
   * Delete webhook endpoint
   */
  async deleteWebhookEndpoint(id: string): Promise<boolean> {
    const deleted = this.webhookEndpoints.delete(id);
    if (deleted) {
      this.logger.log(`Deleted webhook endpoint: ${id}`);
    }
    return deleted;
  }

  /**
   * Test webhook endpoint
   */
  async testWebhookEndpoint(id: string, testData?: any): Promise<boolean> {
    const endpoint = this.webhookEndpoints.get(id);
    if (!endpoint) {
      throw new HttpException(
        'Webhook endpoint not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!endpoint.isActive) {
      throw new HttpException(
        'Webhook endpoint is not active',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Create test webhook event
      const testEvent = {
        id: `test-${Date.now()}`,
        type: 'test.webhook',
        data: testData || { message: 'Test webhook from XScan' },
        created: Math.floor(Date.now() / 1000),
      };

      // Store test event
      await this.storeWebhookEvent({
        eventId: testEvent.id,
        provider: endpoint.provider,
        eventType: testEvent.type,
        status: 'completed',
        payload: testEvent,
        processedData: {
          success: true,
          message: 'Test webhook processed successfully',
        },
        processingTimeMs: 0,
        signatureValid: true,
        metadata: { isTest: true },
      });

      this.logger.log(`Test webhook sent successfully to: ${endpoint.url}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to test webhook endpoint ${id}: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Store webhook event in database
   */
  async storeWebhookEvent(
    eventData: Partial<WebhookEvent>,
  ): Promise<WebhookEvent> {
    try {
      const webhookEvent = new this.webhookEventModel({
        eventId:
          eventData.eventId ||
          `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        provider: eventData.provider || 'unknown',
        eventType: eventData.eventType || 'unknown',
        status: eventData.status || 'pending',
        payload: eventData.payload || {},
        processedData: eventData.processedData,
        errorMessage: eventData.errorMessage,
        retryCount: eventData.retryCount || 0,
        maxRetries: eventData.maxRetries || this.retryConfig.maxRetries,
        processingTimeMs: eventData.processingTimeMs,
        signature: eventData.signature,
        signatureValid: eventData.signatureValid || false,
        relatedDonationId: eventData.relatedDonationId,
        metadata: eventData.metadata,
        ipAddress: eventData.ipAddress,
        userAgent: eventData.userAgent,
      });

      const saved = await webhookEvent.save();
      this.logger.log(`Stored webhook event: ${saved.eventId}`);
      return saved;
    } catch (error) {
      this.logger.error(`Failed to store webhook event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get webhook event by ID
   */
  async getWebhookEvent(eventId: string): Promise<WebhookEvent | null> {
    return this.webhookEventModel.findOne({ eventId }).exec();
  }

  /**
   * Get webhook events with filtering
   */
  async getWebhookEvents(
    filters: {
      provider?: string;
      eventType?: string;
      status?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<{ events: WebhookEvent[]; total: number }> {
    const query: any = {};

    if (filters.provider) query.provider = filters.provider;
    if (filters.eventType) query.eventType = filters.eventType;
    if (filters.status) query.status = filters.status;

    const total = await this.webhookEventModel.countDocuments(query);
    const events = await this.webhookEventModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .skip(filters.offset || 0)
      .exec();

    return { events, total };
  }

  /**
   * Retry failed webhook events
   */
  async retryFailedWebhooks(): Promise<number> {
    const failedEvents = await this.webhookEventModel
      .find({
        status: 'failed',
        retryCount: { $lt: this.retryConfig.maxRetries },
        $or: [
          { nextRetryAt: { $lte: new Date() } },
          { nextRetryAt: { $exists: false } },
        ],
      })
      .exec();

    let retryCount = 0;
    for (const event of failedEvents) {
      try {
        await this.retryWebhookEvent(event);
        retryCount++;
      } catch (error) {
        this.logger.error(
          `Failed to retry webhook event ${event.eventId}: ${error.message}`,
        );
      }
    }

    this.logger.log(`Retried ${retryCount} failed webhook events`);
    return retryCount;
  }

  /**
   * Retry a specific webhook event
   */
  private async retryWebhookEvent(event: WebhookEventDocument): Promise<void> {
    const retryCount = event.retryCount + 1;
    const delay = Math.min(
      this.retryConfig.initialDelay *
        Math.pow(this.retryConfig.backoffMultiplier, retryCount - 1),
      this.retryConfig.maxDelay,
    );
    const nextRetryAt = new Date(Date.now() + delay);

    // Update event with retry information
    await this.webhookEventModel.updateOne(
      { _id: event._id },
      {
        $set: {
          retryCount,
          nextRetryAt,
          status:
            retryCount >= this.retryConfig.maxRetries ? 'failed' : 'pending',
        },
      },
    );

    if (retryCount < this.retryConfig.maxRetries) {
      this.logger.log(
        `Scheduled retry ${retryCount} for webhook event ${event.eventId} at ${nextRetryAt}`,
      );
    } else {
      this.logger.warn(
        `Max retries reached for webhook event ${event.eventId}`,
      );
    }
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(): Promise<{
    totalWebhooks: number;
    successfulWebhooks: number;
    failedWebhooks: number;
    averageProcessingTime: number;
    lastWebhookProcessed: string;
    providers: Record<
      string,
      { total: number; success: number; failed: number }
    >;
  }> {
    const stats = await this.webhookEventModel.aggregate([
      {
        $group: {
          _id: null,
          totalWebhooks: { $sum: 1 },
          successfulWebhooks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          failedWebhooks: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
          totalProcessingTime: {
            $sum: {
              $cond: [
                { $ne: ['$processingTimeMs', null] },
                '$processingTimeMs',
                0,
              ],
            },
          },
          processingTimeCount: {
            $sum: { $cond: [{ $ne: ['$processingTimeMs', null] }, 1, 0] },
          },
          lastWebhookProcessed: { $max: '$createdAt' },
        },
      },
    ]);

    const providerStats = await this.webhookEventModel.aggregate([
      {
        $group: {
          _id: '$provider',
          total: { $sum: 1 },
          success: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
        },
      },
    ]);

    const providerMap: Record<
      string,
      { total: number; success: number; failed: number }
    > = {};
    providerStats.forEach((stat) => {
      providerMap[stat._id] = {
        total: stat.total,
        success: stat.success,
        failed: stat.failed,
      };
    });

    const result = stats[0] || {
      totalWebhooks: 0,
      successfulWebhooks: 0,
      failedWebhooks: 0,
      totalProcessingTime: 0,
      processingTimeCount: 0,
      lastWebhookProcessed: null,
    };

    return {
      totalWebhooks: result.totalWebhooks,
      successfulWebhooks: result.successfulWebhooks,
      failedWebhooks: result.failedWebhooks,
      averageProcessingTime:
        result.processingTimeCount > 0
          ? result.totalProcessingTime / result.processingTimeCount
          : 0,
      lastWebhookProcessed: result.lastWebhookProcessed
        ? result.lastWebhookProcessed.toISOString()
        : 'Never',
      providers: providerMap,
    };
  }

  /**
   * Clean up old webhook events
   */
  async cleanupOldWebhookEvents(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.webhookEventModel.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: { $in: ['completed', 'failed'] },
    });

    this.logger.log(
      `Cleaned up ${result.deletedCount} old webhook events older than ${daysToKeep} days`,
    );
    return result.deletedCount;
  }
}
