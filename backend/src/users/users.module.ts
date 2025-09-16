import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { User, UserSchema } from './schemas/user.schema';
import { Follow, FollowSchema } from './schemas/follow.schema';
import { BankAccount, BankAccountSchema } from './schemas/bank-account.schema';
import { BankTransaction, BankTransactionSchema } from '../bank-sync/schemas/bank-transaction.schema';
import { StreamerApplication, StreamerApplicationSchema } from '../streamer-applications/streamer-application.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { FileUploadService } from './services/file-upload.service';
import { ProfileService } from './services/profile.service';
import { BankAccountService } from './services/bank-account.service';
import { CommonModule } from '../common/common.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Follow.name, schema: FollowSchema },
      { name: BankAccount.name, schema: BankAccountSchema },
      { name: BankTransaction.name, schema: BankTransactionSchema },
      { name: StreamerApplication.name, schema: StreamerApplicationSchema },
      { name: 'DonationLink', schema: require('../donations/schemas/donation-link.schema').DonationLinkSchema },
      { name: 'Donation', schema: require('../donations/schemas/donation.schema').DonationSchema },
    ]),
    MulterModule.register({
      dest: './uploads',
    }),
    ConfigModule,
    CommonModule,
  ],
  providers: [UsersService, FileUploadService, ProfileService, BankAccountService],
  controllers: [UsersController],
  exports: [UsersService, FileUploadService, ProfileService, BankAccountService],
})
export class UsersModule {}
