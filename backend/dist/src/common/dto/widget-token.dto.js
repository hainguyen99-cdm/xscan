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
exports.WidgetTokenDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class WidgetTokenDto {
}
exports.WidgetTokenDto = WidgetTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The generated widget token' }),
    __metadata("design:type", String)
], WidgetTokenDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the streamer this token is for' }),
    __metadata("design:type", String)
], WidgetTokenDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of permissions granted to this token', type: [String] }),
    __metadata("design:type", Array)
], WidgetTokenDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional metadata for the token' }),
    __metadata("design:type", Object)
], WidgetTokenDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the token expires' }),
    __metadata("design:type", Date)
], WidgetTokenDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the token was created' }),
    __metadata("design:type", Date)
], WidgetTokenDto.prototype, "createdAt", void 0);
//# sourceMappingURL=widget-token.dto.js.map