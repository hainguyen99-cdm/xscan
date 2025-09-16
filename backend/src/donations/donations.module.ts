import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DonationsController } from './donations.controller';
import { DonationLinksController } from './donation-links.controller';
import { DonationsService } from './donations.service';
import { AnalyticsService } from './analytics.service';
import { DonationProcessingService } from './donation-processing.service';
import { DonationWebhookService } from './donation-webhook.service';
import { WebhookManagementService } from './webhook-management.service';
import { DonationsGateway } from './donations.gateway';
import {
  DonationLink,
  DonationLinkSchema,
} from './schemas/donation-link.schema';
import { Donation, DonationSchema } from './schemas/donation.schema';
import {
  AnalyticsEvent,
  AnalyticsEventSchema,
} from './schemas/analytics-event.schema';
import {
  WebhookEvent,
  WebhookEventSchema,
} from './schemas/webhook-event.schema';
import { CommonModule } from '../common/common.module';
import { WalletsModule } from '../wallets/wallets.module';
import { PaymentsModule } from '../payments/payments.module';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '../config/config.module';
import { AuthModule } from '../auth/auth.module';
import { OBSSettingsModule } from '../obs-settings/obs-settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DonationLink.name, schema: DonationLinkSchema },
      { name: Donation.name, schema: DonationSchema },
      { name: AnalyticsEvent.name, schema: AnalyticsEventSchema },
      { name: WebhookEvent.name, schema: WebhookEventSchema },
    ]),
    CommonModule,
    WalletsModule,
    PaymentsModule,
    UsersModule,
    ConfigModule,
    AuthModule,
    OBSSettingsModule,
  ],
  controllers: [DonationsController, DonationLinksController],
  providers: [
    DonationsService,
    AnalyticsService,
    DonationProcessingService,
    DonationWebhookService,
    WebhookManagementService,
    DonationsGateway,
  ],
  exports: [
    DonationsService,
    AnalyticsService,
    DonationProcessingService,
    DonationWebhookService,
    WebhookManagementService,
    DonationsGateway,
  ],
})
export class DonationsModule {}
