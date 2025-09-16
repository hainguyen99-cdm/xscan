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
exports.TokenRenderResponseDto = exports.TokenVerificationResponseDto = exports.FullWidgetUrlResponseDto = exports.WidgetConnectionStatusDto = exports.WidgetUrlResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class WidgetUrlResponseDto {
}
exports.WidgetUrlResponseDto = WidgetUrlResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Widget URL for OBS Browser Source',
        example: 'https://xscan.com/widget/alert/streamer-123'
    }),
    __metadata("design:type", String)
], WidgetUrlResponseDto.prototype, "widgetUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Streamer ID',
        example: 'streamer-123'
    }),
    __metadata("design:type", String)
], WidgetUrlResponseDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Alert token (masked for security)',
        example: 'abc123de...'
    }),
    __metadata("design:type", String)
], WidgetUrlResponseDto.prototype, "alertToken", void 0);
class WidgetConnectionStatusDto {
}
exports.WidgetConnectionStatusDto = WidgetConnectionStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of connected OBS widgets',
        example: 2
    }),
    __metadata("design:type", Number)
], WidgetConnectionStatusDto.prototype, "connectedWidgets", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the widget is currently connected',
        example: true
    }),
    __metadata("design:type", Boolean)
], WidgetConnectionStatusDto.prototype, "isConnected", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last connection timestamp',
        example: '2024-01-15T10:30:00.000Z'
    }),
    __metadata("design:type", String)
], WidgetConnectionStatusDto.prototype, "lastConnected", void 0);
class FullWidgetUrlResponseDto {
}
exports.FullWidgetUrlResponseDto = FullWidgetUrlResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Widget URL without token',
        example: 'https://xscan.com/widget/alert/streamer-123'
    }),
    __metadata("design:type", String)
], FullWidgetUrlResponseDto.prototype, "widgetUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Streamer ID',
        example: 'streamer-123'
    }),
    __metadata("design:type", String)
], FullWidgetUrlResponseDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Full alert token for verification',
        example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
    }),
    __metadata("design:type", String)
], FullWidgetUrlResponseDto.prototype, "alertToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Complete widget URL with format: {domain}/widget/alert/{streamerId}/{alertToken}',
        example: 'https://xscan.com/widget/alert/streamer-123/abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
    }),
    __metadata("design:type", String)
], FullWidgetUrlResponseDto.prototype, "fullUrl", void 0);
class TokenVerificationResponseDto {
}
exports.TokenVerificationResponseDto = TokenVerificationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the alert token is valid',
        example: true
    }),
    __metadata("design:type", Boolean)
], TokenVerificationResponseDto.prototype, "isValid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Streamer user ID',
        example: 'streamer-123'
    }),
    __metadata("design:type", String)
], TokenVerificationResponseDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The alert token being verified',
        example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
    }),
    __metadata("design:type", String)
], TokenVerificationResponseDto.prototype, "alertToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Widget URL format: {domain}/widget/alert/{streamerId}/{alertToken}',
        example: 'https://xscan.com/widget/alert/streamer-123/abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
    }),
    __metadata("design:type", String)
], TokenVerificationResponseDto.prototype, "widgetUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Verification message',
        example: 'Alert token verified successfully'
    }),
    __metadata("design:type", String)
], TokenVerificationResponseDto.prototype, "message", void 0);
class TokenRenderResponseDto {
}
exports.TokenRenderResponseDto = TokenRenderResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Streamer user ID',
        example: 'streamer-123'
    }),
    __metadata("design:type", String)
], TokenRenderResponseDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The alert token for the streamer',
        example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
    }),
    __metadata("design:type", String)
], TokenRenderResponseDto.prototype, "alertToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Widget URL format: {domain}/widget/alert/{streamerId}/{alertToken}',
        example: 'https://xscan.com/widget/alert/streamer-123/abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
    }),
    __metadata("design:type", String)
], TokenRenderResponseDto.prototype, "widgetUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'Alert token rendered successfully for Widget URL'
    }),
    __metadata("design:type", String)
], TokenRenderResponseDto.prototype, "message", void 0);
//# sourceMappingURL=widget.dto.js.map