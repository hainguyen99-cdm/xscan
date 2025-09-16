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
exports.StreamerApplicationSchema = exports.StreamerApplication = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let StreamerApplication = class StreamerApplication {
};
exports.StreamerApplication = StreamerApplication;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], StreamerApplication.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 50 }),
    __metadata("design:type", String)
], StreamerApplication.prototype, "username", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], StreamerApplication.prototype, "displayName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, lowercase: true }),
    __metadata("design:type", String)
], StreamerApplication.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['twitch', 'youtube', 'kick', 'facebook', 'other'] }),
    __metadata("design:type", String)
], StreamerApplication.prototype, "platform", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], StreamerApplication.prototype, "channelUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 1000 }),
    __metadata("design:type", String)
], StreamerApplication.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], StreamerApplication.prototype, "monthlyViewers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], StreamerApplication.prototype, "contentCategory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 1000 }),
    __metadata("design:type", String)
], StreamerApplication.prototype, "reasonForApplying", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], StreamerApplication.prototype, "referrer", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'pending' }),
    __metadata("design:type", String)
], StreamerApplication.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 1000 }),
    __metadata("design:type", String)
], StreamerApplication.prototype, "reviewNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], StreamerApplication.prototype, "reviewedByAdminId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], StreamerApplication.prototype, "reviewedAt", void 0);
exports.StreamerApplication = StreamerApplication = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], StreamerApplication);
exports.StreamerApplicationSchema = mongoose_1.SchemaFactory.createForClass(StreamerApplication);
//# sourceMappingURL=streamer-application.schema.js.map