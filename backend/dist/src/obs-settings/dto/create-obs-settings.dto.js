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
exports.CreateOBSSettingsDto = exports.GeneralSettingsDto = exports.DisplaySettingsDto = exports.PositionSettingsDto = exports.StyleSettingsDto = exports.AnimationSettingsDto = exports.SoundSettingsDto = exports.ImageSettingsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ImageSettingsDto {
}
exports.ImageSettingsDto = ImageSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ImageSettingsDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], ImageSettingsDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['image', 'gif', 'video'], default: 'image' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['image', 'gif', 'video']),
    __metadata("design:type", String)
], ImageSettingsDto.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 50, maximum: 1920, default: 300 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(1920),
    __metadata("design:type", Number)
], ImageSettingsDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 50, maximum: 1080, default: 200 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(1080),
    __metadata("design:type", Number)
], ImageSettingsDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 50, default: 8 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], ImageSettingsDto.prototype, "borderRadius", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ImageSettingsDto.prototype, "shadow", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: '#000000' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImageSettingsDto.prototype, "shadowColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 50, default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], ImageSettingsDto.prototype, "shadowBlur", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: -20, maximum: 20, default: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-20),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], ImageSettingsDto.prototype, "shadowOffsetX", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: -20, maximum: 20, default: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-20),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], ImageSettingsDto.prototype, "shadowOffsetY", void 0);
class SoundSettingsDto {
}
exports.SoundSettingsDto = SoundSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SoundSettingsDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], SoundSettingsDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 100, default: 80 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], SoundSettingsDto.prototype, "volume", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 5000, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5000),
    __metadata("design:type", Number)
], SoundSettingsDto.prototype, "fadeIn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 5000, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5000),
    __metadata("design:type", Number)
], SoundSettingsDto.prototype, "fadeOut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SoundSettingsDto.prototype, "loop", void 0);
class AnimationSettingsDto {
}
exports.AnimationSettingsDto = AnimationSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AnimationSettingsDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['fade', 'slide', 'bounce', 'zoom', 'none'], default: 'fade' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['fade', 'slide', 'bounce', 'zoom', 'none']),
    __metadata("design:type", String)
], AnimationSettingsDto.prototype, "animationType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 200, maximum: 5000, default: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(200),
    (0, class_validator_1.Max)(5000),
    __metadata("design:type", Number)
], AnimationSettingsDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'], default: 'ease-out' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear']),
    __metadata("design:type", String)
], AnimationSettingsDto.prototype, "easing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['left', 'right', 'top', 'bottom'], default: 'right' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['left', 'right', 'top', 'bottom']),
    __metadata("design:type", String)
], AnimationSettingsDto.prototype, "direction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 100, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], AnimationSettingsDto.prototype, "bounceIntensity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0.1, maximum: 3, default: 1.2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.1),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], AnimationSettingsDto.prototype, "zoomScale", void 0);
class StyleSettingsDto {
}
exports.StyleSettingsDto = StyleSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: '#1a1a1a' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StyleSettingsDto.prototype, "backgroundColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: '#ffffff' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StyleSettingsDto.prototype, "textColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: '#00ff00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StyleSettingsDto.prototype, "accentColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: '#333333' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StyleSettingsDto.prototype, "borderColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 10, default: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], StyleSettingsDto.prototype, "borderWidth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['solid', 'dashed', 'dotted', 'none'], default: 'solid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['solid', 'dashed', 'dotted', 'none']),
    __metadata("design:type", String)
], StyleSettingsDto.prototype, "borderStyle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'Arial, sans-serif' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StyleSettingsDto.prototype, "fontFamily", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 12, maximum: 72, default: 16 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(12),
    (0, class_validator_1.Max)(72),
    __metadata("design:type", Number)
], StyleSettingsDto.prototype, "fontSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'], default: 'normal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']),
    __metadata("design:type", String)
], StyleSettingsDto.prototype, "fontWeight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['normal', 'italic'], default: 'normal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['normal', 'italic']),
    __metadata("design:type", String)
], StyleSettingsDto.prototype, "fontStyle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StyleSettingsDto.prototype, "textShadow", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: '#000000' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StyleSettingsDto.prototype, "textShadowColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 20, default: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], StyleSettingsDto.prototype, "textShadowBlur", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: -10, maximum: 10, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-10),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], StyleSettingsDto.prototype, "textShadowOffsetX", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: -10, maximum: 10, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-10),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], StyleSettingsDto.prototype, "textShadowOffsetY", void 0);
class PositionSettingsDto {
}
exports.PositionSettingsDto = PositionSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 1920, default: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1920),
    __metadata("design:type", Number)
], PositionSettingsDto.prototype, "x", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 1080, default: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1080),
    __metadata("design:type", Number)
], PositionSettingsDto.prototype, "y", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'],
        default: 'top-left'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']),
    __metadata("design:type", String)
], PositionSettingsDto.prototype, "anchor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 9999, default: 1000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(9999),
    __metadata("design:type", Number)
], PositionSettingsDto.prototype, "zIndex", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PositionSettingsDto.prototype, "responsive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0.1, maximum: 2, default: 0.8 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.1),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Number)
], PositionSettingsDto.prototype, "mobileScale", void 0);
class DisplaySettingsDto {
}
exports.DisplaySettingsDto = DisplaySettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1000, maximum: 30000, default: 5000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1000),
    (0, class_validator_1.Max)(30000),
    __metadata("design:type", Number)
], DisplaySettingsDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 5000, default: 300 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5000),
    __metadata("design:type", Number)
], DisplaySettingsDto.prototype, "fadeInDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 5000, default: 300 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5000),
    __metadata("design:type", Number)
], DisplaySettingsDto.prototype, "fadeOutDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DisplaySettingsDto.prototype, "autoHide", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DisplaySettingsDto.prototype, "showProgress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: '#00ff00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DisplaySettingsDto.prototype, "progressColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, maximum: 20, default: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], DisplaySettingsDto.prototype, "progressHeight", void 0);
class GeneralSettingsDto {
}
exports.GeneralSettingsDto = GeneralSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GeneralSettingsDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, maximum: 10, default: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], GeneralSettingsDto.prototype, "maxAlerts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 100, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GeneralSettingsDto.prototype, "alertSpacing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 60000, default: 1000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(60000),
    __metadata("design:type", Number)
], GeneralSettingsDto.prototype, "cooldown", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['low', 'medium', 'high', 'urgent']),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "priority", void 0);
class CreateOBSSettingsDto {
}
exports.CreateOBSSettingsDto = CreateOBSSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the streamer/KOL user' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateOBSSettingsDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ImageSettingsDto)
], CreateOBSSettingsDto.prototype, "imageSettings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", SoundSettingsDto)
], CreateOBSSettingsDto.prototype, "soundSettings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", AnimationSettingsDto)
], CreateOBSSettingsDto.prototype, "animationSettings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", StyleSettingsDto)
], CreateOBSSettingsDto.prototype, "styleSettings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", PositionSettingsDto)
], CreateOBSSettingsDto.prototype, "positionSettings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", DisplaySettingsDto)
], CreateOBSSettingsDto.prototype, "displaySettings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", GeneralSettingsDto)
], CreateOBSSettingsDto.prototype, "generalSettings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateOBSSettingsDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-obs-settings.dto.js.map