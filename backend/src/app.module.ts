import { Module, MiddlewareConsumer, RequestMethod, Controller, Get } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ScansModule } from './scans/scans.module';
import { DonationsModule } from './donations/donations.module';
import { PaymentsModule } from './payments/payments.module';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { ConfigService as AppConfigService } from './config/config.service';
import { OBSSettingsModule } from './obs-settings/obs-settings.module';
import { ReportingModule } from './reporting/reporting.module';
import { StreamerApplicationsModule } from './streamer-applications/streamer-applications.module';
import { AdminModule } from './admin/admin.module';
import { CommonModule } from './common/common.module';
import { NotificationModule } from './notifications/notification.module';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';
import { GDPRComplianceMiddleware } from './common/middleware/gdpr-compliance.middleware';
import { WidgetModule } from './widget/widget.module';
import { BankSyncModule } from './bank-sync/bank-sync.module';

@Controller('test-widget')
export class TestWidgetController {
  @Get('test')
  testRoute() {
    return { message: 'Test widget controller is working!', timestamp: new Date().toISOString() };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AppConfigModule,
    CommonModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        uri: configService.mongodbUri,
      }),
      inject: [AppConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
      serveStaticOptions: {
        index: false,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        fallthrough: false,
        setHeaders: (res, path) => {
          console.log('Static file request:', path);
          console.log('Static file root path:', join(process.cwd(), 'uploads'));
          res.setHeader('Cache-Control', 'public, max-age=31536000');
        },
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ScansModule,
    DonationsModule,
    PaymentsModule,
    OBSSettingsModule,
    ReportingModule,
    AdminModule,
    NotificationModule,
    StreamerApplicationsModule,
    WidgetModule,
    BankSyncModule,
  ],
  controllers: [TestWidgetController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security headers middleware to all routes except static files
    consumer
      .apply(SecurityHeadersMiddleware)
      .exclude('/uploads/(.*)', '/public/(.*)')
      .forRoutes('*');

    // Apply GDPR compliance middleware to sensitive routes
    consumer
      .apply(GDPRComplianceMiddleware)
      .forRoutes(
        { path: 'api/users/*', method: RequestMethod.ALL },
        { path: 'api/donations/*', method: RequestMethod.ALL },
        { path: 'api/payments/*', method: RequestMethod.ALL },
        { path: 'api/wallets/*', method: RequestMethod.ALL },
        { path: 'api/analytics/*', method: RequestMethod.ALL },
        { path: 'api/upload/*', method: RequestMethod.ALL },
        { path: 'api/notifications/*', method: RequestMethod.ALL }
      );

    // Apply rate limiting middleware to all API routes
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes('api/*');
  }
}
