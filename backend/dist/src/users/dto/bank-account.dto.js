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
exports.SetDefaultBankAccountDto = exports.BankAccountResponseDto = exports.UpdateBankAccountDto = exports.CreateBankAccountDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateBankAccountDto {
}
exports.CreateBankAccountDto = CreateBankAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBankAccountDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account holder name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBankAccountDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBankAccountDto.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBankAccountDto.prototype, "bankCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank short name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBankAccountDto.prototype, "bankShortName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank Identification Number (BIN)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBankAccountDto.prototype, "bin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank logo URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBankAccountDto.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Set as default account' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBankAccountDto.prototype, "isDefault", void 0);
class UpdateBankAccountDto {
}
exports.UpdateBankAccountDto = UpdateBankAccountDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBankAccountDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Account holder name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBankAccountDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Account number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBankAccountDto.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBankAccountDto.prototype, "bankCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank short name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBankAccountDto.prototype, "bankShortName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank Identification Number (BIN)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBankAccountDto.prototype, "bin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank logo URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBankAccountDto.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Account active status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBankAccountDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Set as default account' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBankAccountDto.prototype, "isDefault", void 0);
class BankAccountResponseDto {
}
exports.BankAccountResponseDto = BankAccountResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank account ID' }),
    __metadata("design:type", String)
], BankAccountResponseDto.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID' }),
    __metadata("design:type", String)
], BankAccountResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank name' }),
    __metadata("design:type", String)
], BankAccountResponseDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account holder name' }),
    __metadata("design:type", String)
], BankAccountResponseDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account number' }),
    __metadata("design:type", String)
], BankAccountResponseDto.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank code' }),
    __metadata("design:type", String)
], BankAccountResponseDto.prototype, "bankCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank short name' }),
    __metadata("design:type", String)
], BankAccountResponseDto.prototype, "bankShortName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank Identification Number (BIN)' }),
    __metadata("design:type", String)
], BankAccountResponseDto.prototype, "bin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank logo URL' }),
    __metadata("design:type", String)
], BankAccountResponseDto.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account active status' }),
    __metadata("design:type", Boolean)
], BankAccountResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is default account' }),
    __metadata("design:type", Boolean)
], BankAccountResponseDto.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Last used timestamp' }),
    __metadata("design:type", Date)
], BankAccountResponseDto.prototype, "lastUsedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", Date)
], BankAccountResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", Date)
], BankAccountResponseDto.prototype, "updatedAt", void 0);
class SetDefaultBankAccountDto {
}
exports.SetDefaultBankAccountDto = SetDefaultBankAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank account ID to set as default' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetDefaultBankAccountDto.prototype, "bankAccountId", void 0);
//# sourceMappingURL=bank-account.dto.js.map