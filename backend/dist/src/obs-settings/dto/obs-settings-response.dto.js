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
exports.OBSSettingsResponseDto = exports.GeneralSettingsResponseDto = exports.DisplaySettingsResponseDto = exports.PositionSettingsResponseDto = exports.StyleSettingsResponseDto = exports.AnimationSettingsResponseDto = exports.SoundSettingsResponseDto = exports.ImageSettingsResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ImageSettingsResponseDto {
}
exports.ImageSettingsResponseDto = ImageSettingsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ImageSettingsResponseDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ImageSettingsResponseDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['image', 'gif', 'video'] }),
    __metadata("design:type", String)
], ImageSettingsResponseDto.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ImageSettingsResponseDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ImageSettingsResponseDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ImageSettingsResponseDto.prototype, "borderRadius", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ImageSettingsResponseDto.prototype, "shadow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ImageSettingsResponseDto.prototype, "shadowColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ImageSettingsResponseDto.prototype, "shadowBlur", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ImageSettingsResponseDto.prototype, "shadowOffsetX", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ImageSettingsResponseDto.prototype, "shadowOffsetY", void 0);
class SoundSettingsResponseDto {
}
exports.SoundSettingsResponseDto = SoundSettingsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SoundSettingsResponseDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SoundSettingsResponseDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SoundSettingsResponseDto.prototype, "volume", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SoundSettingsResponseDto.prototype, "fadeIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SoundSettingsResponseDto.prototype, "fadeOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SoundSettingsResponseDto.prototype, "loop", void 0);
class AnimationSettingsResponseDto {
}
exports.AnimationSettingsResponseDto = AnimationSettingsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], AnimationSettingsResponseDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['fade', 'slide', 'bounce', 'zoom', 'none'] }),
    __metadata("design:type", String)
], AnimationSettingsResponseDto.prototype, "animationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnimationSettingsResponseDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'] }),
    __metadata("design:type", String)
], AnimationSettingsResponseDto.prototype, "easing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['left', 'right', 'top', 'bottom'] }),
    __metadata("design:type", String)
], AnimationSettingsResponseDto.prototype, "direction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnimationSettingsResponseDto.prototype, "bounceIntensity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnimationSettingsResponseDto.prototype, "zoomScale", void 0);
class StyleSettingsResponseDto {
}
exports.StyleSettingsResponseDto = StyleSettingsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StyleSettingsResponseDto.prototype, "backgroundColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StyleSettingsResponseDto.prototype, "textColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StyleSettingsResponseDto.prototype, "accentColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StyleSettingsResponseDto.prototype, "borderColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StyleSettingsResponseDto.prototype, "borderWidth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['solid', 'dashed', 'dotted', 'none'] }),
    __metadata("design:type", String)
], StyleSettingsResponseDto.prototype, "borderStyle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StyleSettingsResponseDto.prototype, "fontFamily", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StyleSettingsResponseDto.prototype, "fontSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StyleSettingsResponseDto.prototype, "fontWeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['normal', 'italic'] }),
    __metadata("design:type", String)
], StyleSettingsResponseDto.prototype, "fontStyle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], StyleSettingsResponseDto.prototype, "textShadow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StyleSettingsResponseDto.prototype, "textShadowColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StyleSettingsResponseDto.prototype, "textShadowBlur", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StyleSettingsResponseDto.prototype, "textShadowOffsetX", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StyleSettingsResponseDto.prototype, "textShadowOffsetY", void 0);
class PositionSettingsResponseDto {
}
exports.PositionSettingsResponseDto = PositionSettingsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PositionSettingsResponseDto.prototype, "x", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PositionSettingsResponseDto.prototype, "y", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']
    }),
    __metadata("design:type", String)
], PositionSettingsResponseDto.prototype, "anchor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PositionSettingsResponseDto.prototype, "zIndex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], PositionSettingsResponseDto.prototype, "responsive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PositionSettingsResponseDto.prototype, "mobileScale", void 0);
class DisplaySettingsResponseDto {
}
exports.DisplaySettingsResponseDto = DisplaySettingsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DisplaySettingsResponseDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DisplaySettingsResponseDto.prototype, "fadeInDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DisplaySettingsResponseDto.prototype, "fadeOutDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], DisplaySettingsResponseDto.prototype, "autoHide", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], DisplaySettingsResponseDto.prototype, "showProgress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DisplaySettingsResponseDto.prototype, "progressColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DisplaySettingsResponseDto.prototype, "progressHeight", void 0);
class GeneralSettingsResponseDto {
}
exports.GeneralSettingsResponseDto = GeneralSettingsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], GeneralSettingsResponseDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GeneralSettingsResponseDto.prototype, "maxAlerts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GeneralSettingsResponseDto.prototype, "alertSpacing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GeneralSettingsResponseDto.prototype, "cooldown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['low', 'medium', 'high', 'urgent'] }),
    __metadata("design:type", String)
], GeneralSettingsResponseDto.prototype, "priority", void 0);
class OBSSettingsResponseDto {
}
exports.OBSSettingsResponseDto = OBSSettingsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OBSSettingsResponseDto.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OBSSettingsResponseDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OBSSettingsResponseDto.prototype, "alertToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", ImageSettingsResponseDto)
], OBSSettingsResponseDto.prototype, "imageSettings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", SoundSettingsResponseDto)
], OBSSettingsResponseDto.prototype, "soundSettings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", AnimationSettingsResponseDto)
], OBSSettingsResponseDto.prototype, "animationSettings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", StyleSettingsResponseDto)
], OBSSettingsResponseDto.prototype, "styleSettings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", PositionSettingsResponseDto)
], OBSSettingsResponseDto.prototype, "positionSettings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", DisplaySettingsResponseDto)
], OBSSettingsResponseDto.prototype, "displaySettings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", GeneralSettingsResponseDto)
], OBSSettingsResponseDto.prototype, "generalSettings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], OBSSettingsResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], OBSSettingsResponseDto.prototype, "lastUsedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], OBSSettingsResponseDto.prototype, "totalAlerts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], OBSSettingsResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], OBSSettingsResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=obs-settings-response.dto.js.map