"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const common_service_1 = require("./services/common.service");
const content_scanner_service_1 = require("./services/content-scanner.service");
const tokenization_service_1 = require("./services/tokenization.service");
const pci_compliance_service_1 = require("./services/pci-compliance.service");
const exchange_rate_service_1 = require("./services/exchange-rate.service");
const fee_calculation_service_1 = require("./services/fee-calculation.service");
const media_upload_service_1 = require("./services/media-upload.service");
const aws_s3_service_1 = require("./services/aws-s3.service");
const media_processing_service_1 = require("./services/media-processing.service");
const rbac_service_1 = require("./services/rbac.service");
const security_controller_1 = require("./controllers/security.controller");
const redis_module_1 = require("../redis/redis.module");
const redis_service_1 = require("../redis/redis.service");
const config_module_1 = require("../config/config.module");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        imports: [redis_module_1.RedisModule, config_module_1.ConfigModule],
        controllers: [security_controller_1.SecurityController],
        providers: [
            common_service_1.CommonService,
            content_scanner_service_1.ContentScannerService,
            tokenization_service_1.TokenizationService,
            pci_compliance_service_1.PCIComplianceService,
            exchange_rate_service_1.ExchangeRateService,
            fee_calculation_service_1.FeeCalculationService,
            media_upload_service_1.MediaUploadService,
            aws_s3_service_1.AwsS3Service,
            media_processing_service_1.MediaProcessingService,
            rbac_service_1.RbacService,
            redis_service_1.RedisService,
        ],
        exports: [
            common_service_1.CommonService,
            content_scanner_service_1.ContentScannerService,
            tokenization_service_1.TokenizationService,
            pci_compliance_service_1.PCIComplianceService,
            exchange_rate_service_1.ExchangeRateService,
            fee_calculation_service_1.FeeCalculationService,
            media_upload_service_1.MediaUploadService,
            aws_s3_service_1.AwsS3Service,
            media_processing_service_1.MediaProcessingService,
            rbac_service_1.RbacService,
            redis_service_1.RedisService,
        ],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map