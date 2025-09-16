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
exports.TokenizedCardDataDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class TokenizedCardDataDto {
}
exports.TokenizedCardDataDto = TokenizedCardDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The tokenized card identifier' }),
    __metadata("design:type", String)
], TokenizedCardDataDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last 4 digits of the card for display purposes' }),
    __metadata("design:type", String)
], TokenizedCardDataDto.prototype, "last4", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Card brand (Visa, MasterCard, etc.)' }),
    __metadata("design:type", String)
], TokenizedCardDataDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Card type (credit, debit, etc.)' }),
    __metadata("design:type", String)
], TokenizedCardDataDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the token expires' }),
    __metadata("design:type", Date)
], TokenizedCardDataDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the token was created' }),
    __metadata("design:type", Date)
], TokenizedCardDataDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the token is still valid' }),
    __metadata("design:type", Boolean)
], TokenizedCardDataDto.prototype, "isValid", void 0);
//# sourceMappingURL=tokenized-card-data.dto.js.map