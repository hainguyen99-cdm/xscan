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
exports.PaymentWebhookDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class PaymentWebhookDto {
}
exports.PaymentWebhookDto = PaymentWebhookDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Webhook event ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of webhook event' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Webhook event data' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PaymentWebhookDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when the event was created' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentWebhookDto.prototype, "created", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment provider (stripe, paypal, etc.)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PaymentWebhookDto.prototype, "metadata", void 0);
//# sourceMappingURL=payment-webhook.dto.js.map