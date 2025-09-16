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
exports.MediaUploadProgressDto = exports.AudioSettingsDto = exports.MediaSettingsDto = exports.MediaValidationDto = exports.MediaDeleteRequestDto = exports.MediaUploadRequestDto = exports.MediaUploadResponseDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class MediaUploadResponseDto {
}
exports.MediaUploadResponseDto = MediaUploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique filename of the uploaded media' }),
    __metadata("design:type", String)
], MediaUploadResponseDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Original filename of the uploaded media' }),
    __metadata("design:type", String)
], MediaUploadResponseDto.prototype, "originalName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'CDN URL where the media can be accessed' }),
    __metadata("design:type", String)
], MediaUploadResponseDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of media (image, gif, video, audio)' }),
    __metadata("design:type", String)
], MediaUploadResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Size of the media file in bytes' }),
    __metadata("design:type", Number)
], MediaUploadResponseDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Dimensions of the media (width x height)' }),
    __metadata("design:type", Object)
], MediaUploadResponseDto.prototype, "dimensions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Duration of the media in seconds' }),
    __metadata("design:type", Number)
], MediaUploadResponseDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MIME type of the media file' }),
    __metadata("design:type", String)
], MediaUploadResponseDto.prototype, "mimeType", void 0);
class MediaUploadRequestDto {
}
exports.MediaUploadRequestDto = MediaUploadRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Streamer ID for whom the media is being uploaded' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MediaUploadRequestDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of media being uploaded' }),
    (0, class_validator_1.IsEnum)(['image', 'gif', 'video', 'audio']),
    __metadata("design:type", String)
], MediaUploadRequestDto.prototype, "mediaType", void 0);
class MediaDeleteRequestDto {
}
exports.MediaDeleteRequestDto = MediaDeleteRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filename of the media to delete' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MediaDeleteRequestDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of media to delete' }),
    (0, class_validator_1.IsEnum)(['image', 'gif', 'video', 'audio']),
    __metadata("design:type", String)
], MediaDeleteRequestDto.prototype, "mediaType", void 0);
class MediaValidationDto {
}
exports.MediaValidationDto = MediaValidationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum file size in bytes' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MediaValidationDto.prototype, "maxSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Allowed MIME types' }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], MediaValidationDto.prototype, "allowedTypes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum duration in seconds (for video/audio)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], MediaValidationDto.prototype, "maxDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum dimensions (width x height)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], MediaValidationDto.prototype, "maxDimensions", void 0);
class MediaSettingsDto {
}
exports.MediaSettingsDto = MediaSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether media is enabled' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MediaSettingsDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL of the media file' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MediaSettingsDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Type of media' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['image', 'gif', 'video']),
    __metadata("design:type", String)
], MediaSettingsDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Width of the media' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(1920),
    __metadata("design:type", Number)
], MediaSettingsDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Height of the media' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(1080),
    __metadata("design:type", Number)
], MediaSettingsDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Border radius of the media' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], MediaSettingsDto.prototype, "borderRadius", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether shadow is enabled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MediaSettingsDto.prototype, "shadow", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Shadow color' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MediaSettingsDto.prototype, "shadowColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Shadow blur amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], MediaSettingsDto.prototype, "shadowBlur", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Shadow X offset' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-20),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], MediaSettingsDto.prototype, "shadowOffsetX", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Shadow Y offset' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-20),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], MediaSettingsDto.prototype, "shadowOffsetY", void 0);
class AudioSettingsDto {
}
exports.AudioSettingsDto = AudioSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether audio is enabled' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AudioSettingsDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL of the audio file' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AudioSettingsDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Volume level (0-100)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], AudioSettingsDto.prototype, "volume", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fade in duration in milliseconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5000),
    __metadata("design:type", Number)
], AudioSettingsDto.prototype, "fadeIn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fade out duration in milliseconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5000),
    __metadata("design:type", Number)
], AudioSettingsDto.prototype, "fadeOut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether audio should loop' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AudioSettingsDto.prototype, "loop", void 0);
class MediaUploadProgressDto {
}
exports.MediaUploadProgressDto = MediaUploadProgressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload progress percentage' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], MediaUploadProgressDto.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current upload status' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MediaUploadProgressDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Error message if upload failed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MediaUploadProgressDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Uploaded media info when completed' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", MediaUploadResponseDto)
], MediaUploadProgressDto.prototype, "media", void 0);
//# sourceMappingURL=media-upload.dto.js.map