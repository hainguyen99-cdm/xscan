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
exports.DonationLevelFormDto = exports.DonationLevelResponseDto = exports.UpdateDonationLevelDto = exports.CreateDonationLevelDto = void 0;
const class_validator_1 = require("class-validator");
class CreateDonationLevelDto {
    constructor() {
        this.currency = 'VND';
        this.isEnabled = true;
    }
}
exports.CreateDonationLevelDto = CreateDonationLevelDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDonationLevelDto.prototype, "levelName", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDonationLevelDto.prototype, "minAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDonationLevelDto.prototype, "maxAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDonationLevelDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateDonationLevelDto.prototype, "isEnabled", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateDonationLevelDto.prototype, "configuration", void 0);
class UpdateDonationLevelDto {
}
exports.UpdateDonationLevelDto = UpdateDonationLevelDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDonationLevelDto.prototype, "levelName", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDonationLevelDto.prototype, "minAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDonationLevelDto.prototype, "maxAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDonationLevelDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateDonationLevelDto.prototype, "isEnabled", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateDonationLevelDto.prototype, "configuration", void 0);
class DonationLevelResponseDto {
}
exports.DonationLevelResponseDto = DonationLevelResponseDto;
class DonationLevelFormDto {
    constructor() {
        this.currency = 'VND';
        this.isEnabled = true;
    }
}
exports.DonationLevelFormDto = DonationLevelFormDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonationLevelFormDto.prototype, "levelName", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DonationLevelFormDto.prototype, "minAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DonationLevelFormDto.prototype, "maxAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DonationLevelFormDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], DonationLevelFormDto.prototype, "isEnabled", void 0);
//# sourceMappingURL=donation-level.dto.js.map