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
exports.DonationAlertResponseDto = exports.DonationAlertDto = exports.TestAlertResponseDto = exports.TestAlertDto = exports.TemplateDto = exports.ResetSectionDto = exports.TestResultDto = exports.ImportConfigurationDto = exports.ExportConfigurationDto = exports.ConfigurationValidationDto = exports.ValidationWarningDto = exports.ValidationErrorDto = exports.SavePresetDto = exports.PresetDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class PresetDto {
}
exports.PresetDto = PresetDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier for the preset' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PresetDto.prototype, "presetId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the preset' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PresetDto.prototype, "presetName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description of the preset' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PresetDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Configuration data for the preset' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PresetDto.prototype, "configuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the preset was created' }),
    __metadata("design:type", Date)
], PresetDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the preset was last updated' }),
    __metadata("design:type", Date)
], PresetDto.prototype, "updatedAt", void 0);
class SavePresetDto {
}
exports.SavePresetDto = SavePresetDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name for the preset' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SavePresetDto.prototype, "presetName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional description for the preset' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SavePresetDto.prototype, "description", void 0);
class ValidationErrorDto {
}
exports.ValidationErrorDto = ValidationErrorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Field that has the error' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidationErrorDto.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidationErrorDto.prototype, "message", void 0);
class ValidationWarningDto {
}
exports.ValidationWarningDto = ValidationWarningDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Field that has the warning' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidationWarningDto.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Warning message' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidationWarningDto.prototype, "message", void 0);
class ConfigurationValidationDto {
}
exports.ConfigurationValidationDto = ConfigurationValidationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the configuration is valid' }),
    __metadata("design:type", Boolean)
], ConfigurationValidationDto.prototype, "isValid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of validation errors', type: [ValidationErrorDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ValidationErrorDto),
    __metadata("design:type", Array)
], ConfigurationValidationDto.prototype, "errors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of validation warnings', type: [ValidationWarningDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ValidationWarningDto),
    __metadata("design:type", Array)
], ConfigurationValidationDto.prototype, "warnings", void 0);
class ExportConfigurationDto {
}
exports.ExportConfigurationDto = ExportConfigurationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Exported configuration data' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ExportConfigurationDto.prototype, "exportData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Export date' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExportConfigurationDto.prototype, "exportDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Export version' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExportConfigurationDto.prototype, "version", void 0);
class ImportConfigurationDto {
}
exports.ImportConfigurationDto = ImportConfigurationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Configuration data to import' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ImportConfigurationDto.prototype, "importData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether to overwrite existing settings', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ImportConfigurationDto.prototype, "overwrite", void 0);
class TestResultDto {
}
exports.TestResultDto = TestResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the test was successful' }),
    __metadata("design:type", Boolean)
], TestResultDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Detailed test results' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TestResultDto.prototype, "testResults", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Test result message' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "message", void 0);
class ResetSectionDto {
}
exports.ResetSectionDto = ResetSectionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Section to reset',
        enum: ['image', 'sound', 'animation', 'style', 'position', 'display', 'general']
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResetSectionDto.prototype, "section", void 0);
class TemplateDto {
}
exports.TemplateDto = TemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier for the template' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TemplateDto.prototype, "templateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the template' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description of the template' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TemplateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category of the template' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TemplateDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Preview image for the template' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TemplateDto.prototype, "preview", void 0);
class TestAlertDto {
}
exports.TestAlertDto = TestAlertDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Custom donor name for test alert', default: 'Test Donor' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestAlertDto.prototype, "donorName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Custom donation amount for test alert', default: 25.00 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestAlertDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Custom message for test alert', default: 'This is a test alert!' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestAlertDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether to use current OBS settings or test with provided configuration' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TestAlertDto.prototype, "useCurrentSettings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Test configuration to use instead of current settings' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TestAlertDto.prototype, "testConfiguration", void 0);
class TestAlertResponseDto {
}
exports.TestAlertResponseDto = TestAlertResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the test alert was triggered successfully' }),
    __metadata("design:type", Boolean)
], TestAlertResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Test alert ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestAlertResponseDto.prototype, "alertId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Streamer ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestAlertResponseDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alert data that was sent' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TestAlertResponseDto.prototype, "alertData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Widget URL for the test alert' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestAlertResponseDto.prototype, "widgetUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response message' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestAlertResponseDto.prototype, "message", void 0);
class DonationAlertDto {
}
exports.DonationAlertDto = DonationAlertDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Donor name (or "Anonymous" for anonymous donations)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationAlertDto.prototype, "donorName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Donation amount in the specified currency' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationAlertDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency code, only VND is supported' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationAlertDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Donor message (optional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationAlertDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Donation ID for tracking purposes' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationAlertDto.prototype, "donationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method used (wallet, stripe, paypal)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationAlertDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transaction ID from payment provider' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationAlertDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether this is an anonymous donation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DonationAlertDto.prototype, "isAnonymous", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata for the donation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DonationAlertDto.prototype, "metadata", void 0);
class DonationAlertResponseDto {
}
exports.DonationAlertResponseDto = DonationAlertResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the donation alert was triggered successfully' }),
    __metadata("design:type", Boolean)
], DonationAlertResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alert ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationAlertResponseDto.prototype, "alertId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Streamer ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationAlertResponseDto.prototype, "streamerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Donation data that was sent' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DonationAlertResponseDto.prototype, "alertData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Widget URL for the alert' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationAlertResponseDto.prototype, "widgetUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response message' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationAlertResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of connected OBS widgets that received the alert' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Number)
], DonationAlertResponseDto.prototype, "connectedWidgets", void 0);
//# sourceMappingURL=configuration.dto.js.map