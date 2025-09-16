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
exports.CreateDonationLinkDto = exports.ThemeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class ThemeDto {
}
exports.ThemeDto = ThemeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Primary color in hex format',
        example: '#3B82F6',
    }),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeDto.prototype, "primaryColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Secondary color in hex format',
        example: '#1E40AF',
    }),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeDto.prototype, "secondaryColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Background color in hex format',
        example: '#FFFFFF',
    }),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeDto.prototype, "backgroundColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Text color in hex format', example: '#1F2937' }),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeDto.prototype, "textColor", void 0);
class CreateDonationLinkDto {
}
exports.CreateDonationLinkDto = CreateDonationLinkDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique slug for the donation link',
        minLength: 3,
        maxLength: 50,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateDonationLinkDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Title of the donation link',
        minLength: 1,
        maxLength: 100,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateDonationLinkDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description of the donation link',
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateDonationLinkDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom URL slug for the donation page (alphanumeric and hyphens only)',
        example: 'my-donation-page'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(50),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9-]+$/, {
        message: 'Custom URL can only contain letters, numbers, and hyphens'
    }),
    __metadata("design:type", String)
], CreateDonationLinkDto.prototype, "customUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether to allow anonymous donations',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDonationLinkDto.prototype, "allowAnonymous", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Theme customization for the donation page' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ThemeDto),
    __metadata("design:type", ThemeDto)
], CreateDonationLinkDto.prototype, "theme", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Social media links for sharing' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    __metadata("design:type", Array)
], CreateDonationLinkDto.prototype, "socialMediaLinks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the link is featured',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDonationLinkDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Expiration date for the donation link' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDonationLinkDto.prototype, "expiresAt", void 0);
//# sourceMappingURL=create-donation-link.dto.js.map