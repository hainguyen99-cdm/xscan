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
exports.ProfileExportDto = exports.ExportFormat = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var ExportFormat;
(function (ExportFormat) {
    ExportFormat["JSON"] = "json";
    ExportFormat["CSV"] = "csv";
    ExportFormat["PDF"] = "pdf";
})(ExportFormat || (exports.ExportFormat = ExportFormat = {}));
class ProfileExportDto {
}
exports.ProfileExportDto = ProfileExportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Export format',
        enum: ExportFormat,
        example: ExportFormat.JSON,
        required: false,
        default: ExportFormat.JSON,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ExportFormat),
    __metadata("design:type", String)
], ProfileExportDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fields to include in export',
        example: ['username', 'email', 'firstName', 'lastName'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ProfileExportDto.prototype, "fields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Include sensitive data in export',
        example: false,
        required: false,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ProfileExportDto.prototype, "includeSensitiveData", void 0);
//# sourceMappingURL=profile-export.dto.js.map