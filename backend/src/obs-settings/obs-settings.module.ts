import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OBSSettingsController } from './obs-settings.controller';
import { WidgetController } from './widget.controller';
import { WidgetPublicController } from './widget-public.controller';
import { BankDonationTotalController } from './bank-donation-total.controller';
import { OBSSettingsService } from './obs-settings.service';
import { BankDonationTotalService } from './bank-donation-total.service';
import { OBSSettings, OBSSettingsSchema } from './obs-settings.schema';
import { BankTransaction, BankTransactionSchema } from '../bank-sync/schemas/bank-transaction.schema';
import { OBSWidgetGateway } from './obs-widget.gateway';
import { OBSSecurityService } from './obs-security.service';
import { CommonModule } from '../common/common.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OBSSettings.name, schema: OBSSettingsSchema },
      { name: BankTransaction.name, schema: BankTransactionSchema },
    ]),
    CommonModule,
    UsersModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [
    OBSSettingsController,
    WidgetController,
    WidgetPublicController,
    BankDonationTotalController,
  ],
  providers: [
    OBSSettingsService,
    BankDonationTotalService,
    OBSWidgetGateway,
    OBSSecurityService,
  ],
  exports: [
    OBSSettingsService,
    BankDonationTotalService,
    OBSWidgetGateway,
    OBSSecurityService,
  ],
})
export class OBSSettingsModule {} 