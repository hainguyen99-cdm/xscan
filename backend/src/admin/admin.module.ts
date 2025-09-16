import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminUserManagementService } from './admin-user-management.service';
import { AdminFeeManagementService } from './admin-fee-management.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Transaction, TransactionSchema } from '../payments/schemas/transaction.schema';
import { Donation, DonationSchema } from '../donations/schemas/donation.schema';
import { OBSSettings, OBSSettingsSchema } from '../obs-settings/obs-settings.schema';
import { BankAccount, BankAccountSchema } from '../users/schemas/bank-account.schema';
import { ConfigModule } from '../config/config.module';
import { StreamerApplicationsModule } from '../streamer-applications/streamer-applications.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    ConfigModule,
    CommonModule,
    StreamerApplicationsModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Donation.name, schema: DonationSchema },
      { name: OBSSettings.name, schema: OBSSettingsSchema },
      { name: BankAccount.name, schema: BankAccountSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminDashboardService,
    AdminUserManagementService,
    AdminFeeManagementService,
  ],
  exports: [
    AdminService,
    AdminDashboardService,
    AdminUserManagementService,
    AdminFeeManagementService,
  ],
})
export class AdminModule {} 