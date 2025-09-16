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
exports.DonationSchema = exports.Donation = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Donation = class Donation {
};
exports.Donation = Donation;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Donation.prototype, "donorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Donation.prototype, "streamerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'DonationLink', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Donation.prototype, "donationLinkId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0.01 }),
    __metadata("design:type", Number)
], Donation.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['VND'],
        default: 'VND',
    }),
    __metadata("design:type", String)
], Donation.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 500 }),
    __metadata("design:type", String)
], Donation.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], Donation.prototype, "isAnonymous", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], Donation.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['wallet', 'stripe', 'paypal', 'bank_transfer'],
        default: 'wallet',
    }),
    __metadata("design:type", String)
], Donation.prototype, "paymentMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Donation.prototype, "transactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Donation.prototype, "paymentIntentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Donation.prototype, "processingFee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Donation.prototype, "netAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Donation.prototype, "failureReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Donation.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Donation.prototype, "failedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Donation.prototype, "isRefunded", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Donation.prototype, "refundedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Donation.prototype, "refundReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Donation.prototype, "metadata", void 0);
exports.Donation = Donation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Donation);
exports.DonationSchema = mongoose_1.SchemaFactory.createForClass(Donation);
exports.DonationSchema.index({ donorId: 1 });
exports.DonationSchema.index({ streamerId: 1 });
exports.DonationSchema.index({ donationLinkId: 1 });
exports.DonationSchema.index({ status: 1 });
exports.DonationSchema.index({ createdAt: -1 });
exports.DonationSchema.index({ paymentMethod: 1 });
exports.DonationSchema.index({ isAnonymous: 1 });
//# sourceMappingURL=donation.schema.js.map