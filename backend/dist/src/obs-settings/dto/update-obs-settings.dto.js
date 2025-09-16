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
exports.UpdateOBSSettingsDto = exports.CustomizationDto = exports.TextCustomizationDto = exports.SoundCustomizationDto = exports.ImageCustomizationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ImageCustomizationDto {
}
exports.ImageCustomizationDto = ImageCustomizationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImageCustomizationDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['image', 'gif', 'video'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['image', 'gif', 'video']),
    __metadata("design:type", String)
], ImageCustomizationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, maximum: 30000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(30000),
    __metadata("design:type", Number)
], ImageCustomizationDto.prototype, "duration", void 0);
class SoundCustomizationDto {
}
exports.SoundCustomizationDto = SoundCustomizationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SoundCustomizationDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], SoundCustomizationDto.prototype, "volume", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, maximum: 30000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(30000),
    __metadata("design:type", Number)
], SoundCustomizationDto.prototype, "duration", void 0);
class TextCustomizationDto {
}
exports.TextCustomizationDto = TextCustomizationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TextCustomizationDto.prototype, "font", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 8, maximum: 72 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(8),
    (0, class_validator_1.Max)(72),
    __metadata("design:type", Number)
], TextCustomizationDto.prototype, "fontSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TextCustomizationDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TextCustomizationDto.prototype, "backgroundColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['fade', 'slide', 'bounce', 'none'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['fade', 'slide', 'bounce', 'none']),
    __metadata("design:type", String)
], TextCustomizationDto.prototype, "animation", void 0);
class CustomizationDto {
}
exports.CustomizationDto = CustomizationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ImageCustomizationDto)
], CustomizationDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", SoundCustomizationDto)
], CustomizationDto.prototype, "sound", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", TextCustomizationDto)
], CustomizationDto.prototype, "text", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']),
    __metadata("design:type", String)
], CustomizationDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, maximum: 30000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(30000),
    __metadata("design:type", Number)
], CustomizationDto.prototype, "duration", void 0);
class UpdateOBSSettingsDto {
}
exports.UpdateOBSSettingsDto = UpdateOBSSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Alert token for OBS widget (optional, read-only)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOBSSettingsDto.prototype, "alertToken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customization settings for OBS widget' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CustomizationDto)
], UpdateOBSSettingsDto.prototype, "customization", void 0);
//# sourceMappingURL=update-obs-settings.dto.js.map