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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookStatsDto = exports.WebhookResponseDto = exports.DonationWebhookDataDto = exports.CustomWebhookDto = exports.PayPalWebhookDto = exports.StripeWebhookDto = exports.WebhookPayloadDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class WebhookPayloadDto {
}
exports.WebhookPayloadDto = WebhookPayloadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier for the webhook event' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WebhookPayloadDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of webhook event' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WebhookPayloadDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Webhook event data' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], WebhookPayloadDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unix timestamp when the event was created' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WebhookPayloadDto.prototype, "created", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Webhook signature for verification' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WebhookPayloadDto.prototype, "signature", void 0);
class StripeWebhookDto {
}
exports.StripeWebhookDto = StripeWebhookDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stripe webhook signature' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StripeWebhookDto.prototype, "stripe-signature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stripe webhook payload' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], StripeWebhookDto.prototype, "body", void 0);
class PayPalWebhookDto {
}
exports.PayPalWebhookDto = PayPalWebhookDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'PayPal webhook signature' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PayPalWebhookDto.prototype, "paypal-signature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'PayPal webhook payload' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PayPalWebhookDto.prototype, "body", void 0);
class CustomWebhookDto {
}
exports.CustomWebhookDto = CustomWebhookDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Custom webhook signature' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CustomWebhookDto.prototype, "x-signature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Custom webhook payload' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CustomWebhookDto.prototype, "body", void 0);
class DonationWebhookDataDto {
}
exports.DonationWebhookDataDto = DonationWebhookDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Donation ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DonationWebhookDataDto.prototype, "donationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Donor information' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DonationWebhookDataDto.prototype, "donor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Streamer/KOL ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DonationWebhookDataDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Donation amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DonationWebhookDataDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DonationWebhookDataDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Donation message' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationWebhookDataDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment status' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DonationWebhookDataDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DonationWebhookDataDto.prototype, "metadata", void 0);
class WebhookResponseDto {
}
exports.WebhookResponseDto = WebhookResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Success status' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WebhookResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response message' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WebhookResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Response data' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], WebhookResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timestamp of response' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], WebhookResponseDto.prototype, "timestamp", void 0);
class WebhookStatsDto {
}
exports.WebhookStatsDto = WebhookStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total webhooks processed' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WebhookStatsDto.prototype, "totalWebhooks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Successfully processed webhooks' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WebhookStatsDto.prototype, "successfulWebhooks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failed webhooks' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WebhookStatsDto.prototype, "failedWebhooks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average processing time in milliseconds' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WebhookStatsDto.prototype, "averageProcessingTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last webhook processed timestamp' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], WebhookStatsDto.prototype, "lastWebhookProcessed", void 0);
//# sourceMappingURL=webhook.dto.js.map