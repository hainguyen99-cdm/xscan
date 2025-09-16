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
exports.NotificationPreferencesSchema = exports.NotificationPreferences = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let NotificationPreferences = class NotificationPreferences {
};
exports.NotificationPreferences = NotificationPreferences;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], NotificationPreferences.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "inApp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "push", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "donationConfirmations", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "streamerUpdates", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "securityAlerts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "marketing", void 0);
exports.NotificationPreferences = NotificationPreferences = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], NotificationPreferences);
exports.NotificationPreferencesSchema = mongoose_1.SchemaFactory.createForClass(NotificationPreferences);
//# sourceMappingURL=notification-preferences.schema.js.map