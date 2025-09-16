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
exports.ScanResultDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ScanResultDto {
}
exports.ScanResultDto = ScanResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the file is safe to process' }),
    __metadata("design:type", Boolean)
], ScanResultDto.prototype, "isSafe", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of detected threats', type: [String] }),
    __metadata("design:type", Array)
], ScanResultDto.prototype, "threats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MIME type of the file' }),
    __metadata("design:type", String)
], ScanResultDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Size of the file in bytes' }),
    __metadata("design:type", Number)
], ScanResultDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'SHA-256 hash of the file' }),
    __metadata("design:type", String)
], ScanResultDto.prototype, "hash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when the scan was performed' }),
    __metadata("design:type", Date)
], ScanResultDto.prototype, "scanTimestamp", void 0);
//# sourceMappingURL=scan-result.dto.js.map