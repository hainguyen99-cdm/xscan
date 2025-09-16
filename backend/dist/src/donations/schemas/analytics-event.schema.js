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
exports.AnalyticsEventSchema = exports.AnalyticsEvent = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let AnalyticsEvent = class AnalyticsEvent {
};
exports.AnalyticsEvent = AnalyticsEvent;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'DonationLink', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AnalyticsEvent.prototype, "donationLinkId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: [
            'page_view',
            'donation_started',
            'donation_completed',
            'qr_code_scanned',
            'social_share',
            'link_clicked',
        ],
    }),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "eventType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], AnalyticsEvent.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "sessionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "visitorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], AnalyticsEvent.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], AnalyticsEvent.prototype, "isProcessed", void 0);
exports.AnalyticsEvent = AnalyticsEvent = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], AnalyticsEvent);
exports.AnalyticsEventSchema = mongoose_1.SchemaFactory.createForClass(AnalyticsEvent);
exports.AnalyticsEventSchema.index({ donationLinkId: 1, eventType: 1 });
exports.AnalyticsEventSchema.index({ timestamp: -1 });
exports.AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
exports.AnalyticsEventSchema.index({ sessionId: 1 });
exports.AnalyticsEventSchema.index({ visitorId: 1 });
//# sourceMappingURL=analytics-event.schema.js.map