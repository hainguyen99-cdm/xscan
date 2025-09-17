import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { NotificationPreferences, NotificationPreferencesSchema } from './schemas/notification-preferences.schema';
import { EmailModule } from '../email/email.module';
import { RedisModule } from '../redis/redis.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationPreferences.name, schema: NotificationPreferencesSchema },
    ]),
    EmailModule,
    RedisModule,
    ConfigModule,
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {} 