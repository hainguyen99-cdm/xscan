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
var WebhookManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookManagementService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const webhook_event_schema_1 = require("./schemas/webhook-event.schema");
const config_service_1 = require("../config/config.service");
const donations_service_1 = require("./donations.service");
let WebhookManagementService = WebhookManagementService_1 = class WebhookManagementService {
    constructor(webhookEventModel, configService, donationsService) {
        this.webhookEventModel = webhookEventModel;
        this.configService = configService;
        this.donationsService = donationsService;
        this.logger = new common_1.Logger(WebhookManagementService_1.name);
        this.webhookEndpoints = new Map();
        this.retryConfig = {
            maxRetries: 3,
            initialDelay: 1000,
            maxDelay: 30000,
            backoffMultiplier: 2,
            retryDelay: 1000,
        };
        this.initializeWebhookEndpoints();
    }
    async initializeWebhookEndpoints() {
        const baseUrl = this.configService.frontendUrl;
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
        this.logger.log(`Initialized ${this.webhookEndpoints.size} webhook endpoints`);
    }
    async getWebhookEndpoints() {
        return Array.from(this.webhookEndpoints.values());
    }
    async getWebhookEndpoint(id) {
        return this.webhookEndpoints.get(id) || null;
    }
    async upsertWebhookEndpoint(endpoint) {
        if (!endpoint.id) {
            throw new common_1.HttpException('Webhook endpoint ID is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const existing = this.webhookEndpoints.get(endpoint.id);
        if (existing) {
            const updated = { ...existing, ...endpoint, updatedAt: new Date() };
            this.webhookEndpoints.set(endpoint.id, updated);
            this.logger.log(`Updated webhook endpoint: ${endpoint.id}`);
            return updated;
        }
        else {
            const newEndpoint = {
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
    async deleteWebhookEndpoint(id) {
        const deleted = this.webhookEndpoints.delete(id);
        if (deleted) {
            this.logger.log(`Deleted webhook endpoint: ${id}`);
        }
        return deleted;
    }
    async testWebhookEndpoint(id, testData) {
        const endpoint = this.webhookEndpoints.get(id);
        if (!endpoint) {
            throw new common_1.HttpException('Webhook endpoint not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (!endpoint.isActive) {
            throw new common_1.HttpException('Webhook endpoint is not active', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const testEvent = {
                id: `test-${Date.now()}`,
                type: 'test.webhook',
                data: testData || { message: 'Test webhook from XScan' },
                created: Math.floor(Date.now() / 1000),
            };
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
        }
        catch (error) {
            this.logger.error(`Failed to test webhook endpoint ${id}: ${error.message}`);
            return false;
        }
    }
    async storeWebhookEvent(eventData) {
        try {
            const webhookEvent = new this.webhookEventModel({
                eventId: eventData.eventId ||
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
        }
        catch (error) {
            this.logger.error(`Failed to store webhook event: ${error.message}`);
            throw error;
        }
    }
    async getWebhookEvent(eventId) {
        return this.webhookEventModel.findOne({ eventId }).exec();
    }
    async getWebhookEvents(filters = {}) {
        const query = {};
        if (filters.provider)
            query.provider = filters.provider;
        if (filters.eventType)
            query.eventType = filters.eventType;
        if (filters.status)
            query.status = filters.status;
        const total = await this.webhookEventModel.countDocuments(query);
        const events = await this.webhookEventModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(filters.limit || 50)
            .skip(filters.offset || 0)
            .exec();
        return { events, total };
    }
    async retryFailedWebhooks() {
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
            }
            catch (error) {
                this.logger.error(`Failed to retry webhook event ${event.eventId}: ${error.message}`);
            }
        }
        this.logger.log(`Retried ${retryCount} failed webhook events`);
        return retryCount;
    }
    async retryWebhookEvent(event) {
        const retryCount = event.retryCount + 1;
        const delay = Math.min(this.retryConfig.initialDelay *
            Math.pow(this.retryConfig.backoffMultiplier, retryCount - 1), this.retryConfig.maxDelay);
        const nextRetryAt = new Date(Date.now() + delay);
        await this.webhookEventModel.updateOne({ _id: event._id }, {
            $set: {
                retryCount,
                nextRetryAt,
                status: retryCount >= this.retryConfig.maxRetries ? 'failed' : 'pending',
            },
        });
        if (retryCount < this.retryConfig.maxRetries) {
            this.logger.log(`Scheduled retry ${retryCount} for webhook event ${event.eventId} at ${nextRetryAt}`);
        }
        else {
            this.logger.warn(`Max retries reached for webhook event ${event.eventId}`);
        }
    }
    async getWebhookStats() {
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
        const providerMap = {};
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
            averageProcessingTime: result.processingTimeCount > 0
                ? result.totalProcessingTime / result.processingTimeCount
                : 0,
            lastWebhookProcessed: result.lastWebhookProcessed
                ? result.lastWebhookProcessed.toISOString()
                : 'Never',
            providers: providerMap,
        };
    }
    async cleanupOldWebhookEvents(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await this.webhookEventModel.deleteMany({
            createdAt: { $lt: cutoffDate },
            status: { $in: ['completed', 'failed'] },
        });
        this.logger.log(`Cleaned up ${result.deletedCount} old webhook events older than ${daysToKeep} days`);
        return result.deletedCount;
    }
};
exports.WebhookManagementService = WebhookManagementService;
exports.WebhookManagementService = WebhookManagementService = WebhookManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(webhook_event_schema_1.WebhookEvent.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_service_1.ConfigService,
        donations_service_1.DonationsService])
], WebhookManagementService);
//# sourceMappingURL=webhook-management.service.js.map