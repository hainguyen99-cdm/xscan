"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = exports.TestWidgetController = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const throttler_2 = require("@nestjs/throttler");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const scans_module_1 = require("./scans/scans.module");
const donations_module_1 = require("./donations/donations.module");
const payments_module_1 = require("./payments/payments.module");
const config_module_1 = require("./config/config.module");
const config_service_1 = require("./config/config.service");
const obs_settings_module_1 = require("./obs-settings/obs-settings.module");
const reporting_module_1 = require("./reporting/reporting.module");
const streamer_applications_module_1 = require("./streamer-applications/streamer-applications.module");
const admin_module_1 = require("./admin/admin.module");
const common_module_1 = require("./common/common.module");
const notification_module_1 = require("./notifications/notification.module");
const rate_limit_middleware_1 = require("./common/middleware/rate-limit.middleware");
const security_headers_middleware_1 = require("./common/middleware/security-headers.middleware");
const gdpr_compliance_middleware_1 = require("./common/middleware/gdpr-compliance.middleware");
const widget_module_1 = require("./widget/widget.module");
const bank_sync_module_1 = require("./bank-sync/bank-sync.module");
let TestWidgetController = class TestWidgetController {
    testRoute() {
        return { message: 'Test widget controller is working!', timestamp: new Date().toISOString() };
    }
};
exports.TestWidgetController = TestWidgetController;
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TestWidgetController.prototype, "testRoute", null);
exports.TestWidgetController = TestWidgetController = __decorate([
    (0, common_1.Controller)('test-widget')
], TestWidgetController);
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(security_headers_middleware_1.SecurityHeadersMiddleware)
            .exclude('/uploads/(.*)', '/public/(.*)')
            .forRoutes('*');
        consumer
            .apply(gdpr_compliance_middleware_1.GDPRComplianceMiddleware)
            .forRoutes({ path: 'api/users/*', method: common_1.RequestMethod.ALL }, { path: 'api/donations/*', method: common_1.RequestMethod.ALL }, { path: 'api/payments/*', method: common_1.RequestMethod.ALL }, { path: 'api/wallets/*', method: common_1.RequestMethod.ALL }, { path: 'api/analytics/*', method: common_1.RequestMethod.ALL }, { path: 'api/upload/*', method: common_1.RequestMethod.ALL }, { path: 'api/notifications/*', method: common_1.RequestMethod.ALL });
        consumer
            .apply(rate_limit_middleware_1.RateLimitMiddleware)
            .forRoutes('api/*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            config_module_1.ConfigModule,
            common_module_1.CommonModule,
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_module_1.ConfigModule],
                useFactory: async (configService) => ({
                    uri: configService.mongodbUri,
                }),
                inject: [config_service_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'public'),
                serveRoot: '/',
                serveStaticOptions: {
                    index: false,
                },
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
                serveStaticOptions: {
                    index: false,
                    fallthrough: false,
                    setHeaders: (res, path) => {
                        console.log('Static file request:', path);
                        console.log('Static file root path:', (0, path_1.join)(process.cwd(), 'uploads'));
                        res.setHeader('Cache-Control', 'public, max-age=31536000');
                    },
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            scans_module_1.ScansModule,
            donations_module_1.DonationsModule,
            payments_module_1.PaymentsModule,
            obs_settings_module_1.OBSSettingsModule,
            reporting_module_1.ReportingModule,
            admin_module_1.AdminModule,
            notification_module_1.NotificationModule,
            streamer_applications_module_1.StreamerApplicationsModule,
            widget_module_1.WidgetModule,
            bank_sync_module_1.BankSyncModule,
        ],
        controllers: [TestWidgetController],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_2.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map