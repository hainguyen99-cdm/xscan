import { Module } from '@nestjs/common';
import { CommonService } from './services/common.service';
import { ContentScannerService } from './services/content-scanner.service';
import { TokenizationService } from './services/tokenization.service';
import { PCIComplianceService } from './services/pci-compliance.service';
import { ExchangeRateService } from './services/exchange-rate.service';
import { FeeCalculationService } from './services/fee-calculation.service';
import { MediaUploadService } from './services/media-upload.service';
import { RbacService } from './services/rbac.service';
import { SecurityController } from './controllers/security.controller';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [RedisModule, ConfigModule],
  controllers: [SecurityController],
  providers: [
    CommonService,
    ContentScannerService,
    TokenizationService,
    PCIComplianceService,
    ExchangeRateService,
    FeeCalculationService,
    MediaUploadService,
    RbacService,
    RedisService,
  ],
  exports: [
    CommonService,
    ContentScannerService,
    TokenizationService,
    PCIComplianceService,
    ExchangeRateService,
    FeeCalculationService,
    MediaUploadService,
    RbacService,
    RedisService,
  ],
})
export class CommonModule {}
