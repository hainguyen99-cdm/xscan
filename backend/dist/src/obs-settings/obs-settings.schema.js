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
exports.OBSSettingsSchema = exports.OBSSettings = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let OBSSettings = class OBSSettings {
    toObject() {
        return this;
    }
};
exports.OBSSettings = OBSSettings;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], OBSSettings.prototype, "streamerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
        minlength: 32,
        maxlength: 64,
    }),
    __metadata("design:type", String)
], OBSSettings.prototype, "alertToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            tokenExpiresAt: { type: Date },
            lastTokenRegeneration: { type: Date },
            allowedIPs: [{ type: String, trim: true }],
            maxConnections: { type: Number, min: 1, max: 100, default: 10 },
            requireIPValidation: { type: Boolean, default: false },
            requireRequestSigning: { type: Boolean, default: false },
            requestSignatureSecret: { type: String, trim: true },
            lastSecurityAudit: { type: Date },
            securityViolations: [{
                    type: { type: String, enum: ['invalid_token', 'ip_blocked', 'rate_limit_exceeded', 'replay_attack', 'signature_mismatch'] },
                    timestamp: { type: Date, default: Date.now },
                    ip: { type: String },
                    userAgent: { type: String },
                    details: { type: String }
                }],
            isTokenRevoked: { type: Boolean, default: false },
            revokedAt: { type: Date },
            revocationReason: { type: String },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], OBSSettings.prototype, "securitySettings", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            enabled: { type: Boolean, default: true },
            url: { type: String, trim: true },
            mediaType: { type: String, enum: ['image', 'gif', 'video'], default: 'image' },
            width: { type: Number, min: 50, max: 1920, default: 300 },
            height: { type: Number, min: 50, max: 1080, default: 200 },
            borderRadius: { type: Number, min: 0, max: 50, default: 8 },
            shadow: { type: Boolean, default: true },
            shadowColor: { type: String, default: '#000000' },
            shadowBlur: { type: Number, min: 0, max: 50, default: 10 },
            shadowOffsetX: { type: Number, min: -20, max: 20, default: 2 },
            shadowOffsetY: { type: Number, min: -20, max: 20, default: 2 },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], OBSSettings.prototype, "imageSettings", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            enabled: { type: Boolean, default: true },
            url: { type: String, trim: true },
            volume: { type: Number, min: 0, max: 100, default: 80 },
            fadeIn: { type: Number, min: 0, max: 5000, default: 0 },
            fadeOut: { type: Number, min: 0, max: 5000, default: 0 },
            loop: { type: Boolean, default: false },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], OBSSettings.prototype, "soundSettings", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            enabled: { type: Boolean, default: true },
            animationType: { type: String, enum: ['fade', 'slide', 'bounce', 'zoom', 'none'], default: 'fade' },
            duration: { type: Number, min: 200, max: 5000, default: 500 },
            easing: { type: String, enum: ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'], default: 'ease-out' },
            direction: { type: String, enum: ['left', 'right', 'top', 'bottom'], default: 'right' },
            bounceIntensity: { type: Number, min: 0, max: 100, default: 20 },
            zoomScale: { type: Number, min: 0.1, max: 3, default: 1.2 },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], OBSSettings.prototype, "animationSettings", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            backgroundColor: { type: String, default: '#1a1a1a' },
            textColor: { type: String, default: '#ffffff' },
            accentColor: { type: String, default: '#00ff00' },
            borderColor: { type: String, default: '#333333' },
            borderWidth: { type: Number, min: 0, max: 10, default: 2 },
            borderStyle: { type: String, enum: ['solid', 'dashed', 'dotted', 'none'], default: 'solid' },
            fontFamily: { type: String, default: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' },
            fontSize: { type: Number, min: 12, max: 72, default: 16 },
            fontWeight: { type: String, enum: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'], default: 'normal' },
            fontStyle: { type: String, enum: ['normal', 'italic'], default: 'normal' },
            textShadow: { type: Boolean, default: true },
            textShadowColor: { type: String, default: '#000000' },
            textShadowBlur: { type: Number, min: 0, max: 20, default: 3 },
            textShadowOffsetX: { type: Number, min: -10, max: 10, default: 1 },
            textShadowOffsetY: { type: Number, min: -10, max: 10, default: 1 },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], OBSSettings.prototype, "styleSettings", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            x: { type: Number, min: 0, max: 1920, default: 100 },
            y: { type: Number, min: 0, max: 1080, default: 100 },
            anchor: { type: String, enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'], default: 'top-left' },
            zIndex: { type: Number, min: 0, max: 9999, default: 1000 },
            responsive: { type: Boolean, default: true },
            mobileScale: { type: Number, min: 0.1, max: 2, default: 0.8 },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], OBSSettings.prototype, "positionSettings", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            duration: { type: Number, min: 1000, max: 30000, default: 5000 },
            fadeInDuration: { type: Number, min: 0, max: 5000, default: 300 },
            fadeOutDuration: { type: Number, min: 0, max: 5000, default: 300 },
            autoHide: { type: Boolean, default: true },
            showProgress: { type: Boolean, default: false },
            progressColor: { type: String, default: '#00ff00' },
            progressHeight: { type: Number, min: 1, max: 20, default: 3 },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], OBSSettings.prototype, "displaySettings", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            enabled: { type: Boolean, default: true },
            maxAlerts: { type: Number, min: 1, max: 10, default: 3 },
            alertSpacing: { type: Number, min: 0, max: 100, default: 20 },
            cooldown: { type: Number, min: 0, max: 60000, default: 1000 },
            priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], OBSSettings.prototype, "generalSettings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], OBSSettings.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['auto', 'basic', 'donation-levels'],
        default: 'auto',
        description: 'Controls which settings to use: auto (use donation levels if available and matching, otherwise basic), basic (always use basic settings), donation-levels (always use donation levels if available)'
    }),
    __metadata("design:type", String)
], OBSSettings.prototype, "settingsBehavior", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], OBSSettings.prototype, "lastUsedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], OBSSettings.prototype, "totalAlerts", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                presetId: { type: String, required: true },
                presetName: { type: String, required: true },
                description: { type: String },
                configuration: {
                    imageSettings: { type: Object },
                    soundSettings: { type: Object },
                    animationSettings: { type: Object },
                    styleSettings: { type: Object },
                    positionSettings: { type: Object },
                    displaySettings: { type: Object },
                    generalSettings: { type: Object },
                },
                createdAt: { type: Date, default: Date.now },
                updatedAt: { type: Date, default: Date.now },
            }],
        default: [],
    }),
    __metadata("design:type", Array)
], OBSSettings.prototype, "presets", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                levelId: { type: String, required: true },
                levelName: { type: String, required: true },
                minAmount: { type: Number, required: true },
                maxAmount: { type: Number, required: true },
                currency: { type: String, default: 'VND' },
                isEnabled: { type: Boolean, default: true },
                configuration: {
                    imageSettings: { type: Object },
                    soundSettings: { type: Object },
                    animationSettings: { type: Object },
                    styleSettings: { type: Object },
                    positionSettings: { type: Object },
                    displaySettings: { type: Object },
                    generalSettings: { type: Object },
                },
                createdAt: { type: Date, default: Date.now },
                updatedAt: { type: Date, default: Date.now },
            }],
        default: [],
    }),
    __metadata("design:type", Array)
], OBSSettings.prototype, "donationLevels", void 0);
exports.OBSSettings = OBSSettings = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], OBSSettings);
exports.OBSSettingsSchema = mongoose_1.SchemaFactory.createForClass(OBSSettings);
exports.OBSSettingsSchema.index({ streamerId: 1, isActive: 1 });
//# sourceMappingURL=obs-settings.schema.js.map