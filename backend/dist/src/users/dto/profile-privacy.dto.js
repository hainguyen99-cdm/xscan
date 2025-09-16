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
exports.ProfilePrivacyDto = exports.ProfileVisibility = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var ProfileVisibility;
(function (ProfileVisibility) {
    ProfileVisibility["PUBLIC"] = "public";
    ProfileVisibility["PRIVATE"] = "private";
    ProfileVisibility["FRIENDS_ONLY"] = "friends_only";
})(ProfileVisibility || (exports.ProfileVisibility = ProfileVisibility = {}));
class ProfilePrivacyDto {
}
exports.ProfilePrivacyDto = ProfilePrivacyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Profile visibility setting',
        enum: ProfileVisibility,
        example: ProfileVisibility.PUBLIC,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ProfileVisibility),
    __metadata("design:type", String)
], ProfilePrivacyDto.prototype, "profileVisibility", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether to show email in profile',
        example: false,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProfilePrivacyDto.prototype, "showEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether to show phone in profile',
        example: false,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProfilePrivacyDto.prototype, "showPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether to show address in profile',
        example: false,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProfilePrivacyDto.prototype, "showAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether to show last login time',
        example: false,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProfilePrivacyDto.prototype, "showLastLogin", void 0);
//# sourceMappingURL=profile-privacy.dto.js.map