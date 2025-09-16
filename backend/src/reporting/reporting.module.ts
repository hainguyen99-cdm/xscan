import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { Donation, DonationSchema } from '../donations/schemas/donation.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { DonationLink, DonationLinkSchema } from '../donations/schemas/donation-link.schema';
import { AnalyticsEvent, AnalyticsEventSchema } from '../donations/schemas/analytics-event.schema';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Donation.name, schema: DonationSchema },
      { name: User.name, schema: UserSchema },
      { name: DonationLink.name, schema: DonationLinkSchema },
      { name: AnalyticsEvent.name, schema: AnalyticsEventSchema },
    ]),
    CommonModule,
  ],
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {} 