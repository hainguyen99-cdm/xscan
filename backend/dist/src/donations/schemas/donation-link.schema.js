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
exports.DonationLinkSchema = exports.DonationLink = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let DonationLink = class DonationLink {
};
exports.DonationLink = DonationLink;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DonationLink.prototype, "streamerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
    }),
    __metadata("design:type", String)
], DonationLink.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, minlength: 1, maxlength: 100 }),
    __metadata("design:type", String)
], DonationLink.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 500 }),
    __metadata("design:type", String)
], DonationLink.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, trim: true }),
    __metadata("design:type", String)
], DonationLink.prototype, "customUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], DonationLink.prototype, "qrCodeUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], DonationLink.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], DonationLink.prototype, "allowAnonymous", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            primaryColor: { type: String, required: true, default: '#3B82F6' },
            secondaryColor: { type: String, required: true, default: '#1E40AF' },
            backgroundColor: { type: String, required: true, default: '#FFFFFF' },
            textColor: { type: String, required: true, default: '#1F2937' },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], DonationLink.prototype, "theme", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], DonationLink.prototype, "totalDonations", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], DonationLink.prototype, "totalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: 'VND' }),
    __metadata("design:type", String)
], DonationLink.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], DonationLink.prototype, "pageViews", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], DonationLink.prototype, "socialMediaLinks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], DonationLink.prototype, "isFeatured", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], DonationLink.prototype, "isDefault", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], DonationLink.prototype, "lastDonationAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], DonationLink.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], DonationLink.prototype, "isExpired", void 0);
exports.DonationLink = DonationLink = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DonationLink);
exports.DonationLinkSchema = mongoose_1.SchemaFactory.createForClass(DonationLink);
exports.DonationLinkSchema.index({ streamerId: 1 });
exports.DonationLinkSchema.index({ isActive: 1 });
exports.DonationLinkSchema.index({ isExpired: 1 });
exports.DonationLinkSchema.index({ createdAt: -1 });
//# sourceMappingURL=donation-link.schema.js.map