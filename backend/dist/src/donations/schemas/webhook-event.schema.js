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
exports.WebhookEventSchema = exports.WebhookEvent = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let WebhookEvent = class WebhookEvent {
};
exports.WebhookEvent = WebhookEvent;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "eventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "eventType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "payload", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: false }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "processedData", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "errorMessage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: false, default: 0 }),
    __metadata("design:type", Number)
], WebhookEvent.prototype, "retryCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: false, default: 3 }),
    __metadata("design:type", Number)
], WebhookEvent.prototype, "maxRetries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: false }),
    __metadata("design:type", Date)
], WebhookEvent.prototype, "nextRetryAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: false }),
    __metadata("design:type", Number)
], WebhookEvent.prototype, "processingTimeMs", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "signature", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, required: false, default: false }),
    __metadata("design:type", Boolean)
], WebhookEvent.prototype, "signatureValid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, type: mongoose_2.Types.ObjectId, ref: 'Donation' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WebhookEvent.prototype, "relatedDonationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: false }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "ipAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "userAgent", void 0);
exports.WebhookEvent = WebhookEvent = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], WebhookEvent);
exports.WebhookEventSchema = mongoose_1.SchemaFactory.createForClass(WebhookEvent);
exports.WebhookEventSchema.index({ provider: 1, eventType: 1 });
exports.WebhookEventSchema.index({ status: 1, createdAt: 1 });
exports.WebhookEventSchema.index({ relatedDonationId: 1 });
exports.WebhookEventSchema.index({ createdAt: 1 });
exports.WebhookEventSchema.index({ nextRetryAt: 1 });
//# sourceMappingURL=webhook-event.schema.js.map