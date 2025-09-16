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
exports.SecurityStatusDto = exports.RequestSignatureDto = exports.SecurityAuditResponseDto = exports.RevokeTokenDto = exports.UpdateSecuritySettingsDto = exports.SecuritySettingsDto = exports.SecurityViolationDto = exports.SecurityViolationType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var SecurityViolationType;
(function (SecurityViolationType) {
    SecurityViolationType["INVALID_TOKEN"] = "invalid_token";
    SecurityViolationType["IP_BLOCKED"] = "ip_blocked";
    SecurityViolationType["RATE_LIMIT_EXCEEDED"] = "rate_limit_exceeded";
    SecurityViolationType["REPLAY_ATTACK"] = "replay_attack";
    SecurityViolationType["SIGNATURE_MISMATCH"] = "signature_mismatch";
})(SecurityViolationType || (exports.SecurityViolationType = SecurityViolationType = {}));
class SecurityViolationDto {
}
exports.SecurityViolationDto = SecurityViolationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SecurityViolationType }),
    (0, class_validator_1.IsEnum)(SecurityViolationType),
    __metadata("design:type", String)
], SecurityViolationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SecurityViolationDto.prototype, "ip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SecurityViolationDto.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SecurityViolationDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SecurityViolationDto.prototype, "timestamp", void 0);
class SecuritySettingsDto {
}
exports.SecuritySettingsDto = SecuritySettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SecuritySettingsDto.prototype, "tokenExpiresAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsIP)(4, { each: true }),
    __metadata("design:type", Array)
], SecuritySettingsDto.prototype, "allowedIPs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, maximum: 100, default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SecuritySettingsDto.prototype, "maxConnections", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SecuritySettingsDto.prototype, "requireIPValidation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SecuritySettingsDto.prototype, "requireRequestSigning", void 0);
class UpdateSecuritySettingsDto {
}
exports.UpdateSecuritySettingsDto = UpdateSecuritySettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SecuritySettingsDto),
    __metadata("design:type", SecuritySettingsDto)
], UpdateSecuritySettingsDto.prototype, "securitySettings", void 0);
class RevokeTokenDto {
}
exports.RevokeTokenDto = RevokeTokenDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'Manual revocation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RevokeTokenDto.prototype, "reason", void 0);
class SecurityAuditResponseDto {
}
exports.SecurityAuditResponseDto = SecurityAuditResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SecurityAuditResponseDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SecurityViolationDto] }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SecurityViolationDto),
    __metadata("design:type", Array)
], SecurityAuditResponseDto.prototype, "violations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SecurityAuditResponseDto.prototype, "totalViolations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SecurityAuditResponseDto.prototype, "lastSecurityAudit", void 0);
class RequestSignatureDto {
}
exports.RequestSignatureDto = RequestSignatureDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RequestSignatureDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestSignatureDto.prototype, "nonce", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestSignatureDto.prototype, "signature", void 0);
class SecurityStatusDto {
}
exports.SecurityStatusDto = SecurityStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SecurityStatusDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SecurityStatusDto.prototype, "isTokenActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SecurityStatusDto.prototype, "isTokenRevoked", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SecurityStatusDto.prototype, "revocationReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SecurityStatusDto.prototype, "revokedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SecurityStatusDto.prototype, "tokenExpiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SecurityStatusDto.prototype, "requireIPValidation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SecurityStatusDto.prototype, "requireRequestSigning", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SecurityStatusDto.prototype, "maxConnections", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SecurityStatusDto.prototype, "allowedIPs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SecurityStatusDto.prototype, "totalViolations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SecurityStatusDto.prototype, "lastSecurityAudit", void 0);
//# sourceMappingURL=security.dto.js.map