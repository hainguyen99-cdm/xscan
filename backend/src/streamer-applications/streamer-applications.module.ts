import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StreamerApplication, StreamerApplicationSchema } from './streamer-application.schema';
import { StreamerApplicationsService } from './streamer-applications.service';
import { StreamerApplicationsController } from './streamer-applications.controller';
import { UsersModule } from '../users/users.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StreamerApplication.name, schema: StreamerApplicationSchema },
    ]),
    UsersModule,
    NotificationModule,
  ],
  controllers: [StreamerApplicationsController],
  providers: [StreamerApplicationsService],
  exports: [StreamerApplicationsService],
})
export class StreamerApplicationsModule {}



