"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const donations_controller_1 = require("./donations.controller");
const donation_links_controller_1 = require("./donation-links.controller");
const donations_service_1 = require("./donations.service");
const analytics_service_1 = require("./analytics.service");
const donation_processing_service_1 = require("./donation-processing.service");
const donation_webhook_service_1 = require("./donation-webhook.service");
const webhook_management_service_1 = require("./webhook-management.service");
const donations_gateway_1 = require("./donations.gateway");
const donation_link_schema_1 = require("./schemas/donation-link.schema");
const donation_schema_1 = require("./schemas/donation.schema");
const analytics_event_schema_1 = require("./schemas/analytics-event.schema");
const webhook_event_schema_1 = require("./schemas/webhook-event.schema");
const common_module_1 = require("../common/common.module");
const wallets_module_1 = require("../wallets/wallets.module");
const payments_module_1 = require("../payments/payments.module");
const users_module_1 = require("../users/users.module");
const config_module_1 = require("../config/config.module");
const auth_module_1 = require("../auth/auth.module");
const obs_settings_module_1 = require("../obs-settings/obs-settings.module");
let DonationsModule = class DonationsModule {
};
exports.DonationsModule = DonationsModule;
exports.DonationsModule = DonationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: donation_link_schema_1.DonationLink.name, schema: donation_link_schema_1.DonationLinkSchema },
                { name: donation_schema_1.Donation.name, schema: donation_schema_1.DonationSchema },
                { name: analytics_event_schema_1.AnalyticsEvent.name, schema: analytics_event_schema_1.AnalyticsEventSchema },
                { name: webhook_event_schema_1.WebhookEvent.name, schema: webhook_event_schema_1.WebhookEventSchema },
            ]),
            common_module_1.CommonModule,
            wallets_module_1.WalletsModule,
            payments_module_1.PaymentsModule,
            users_module_1.UsersModule,
            config_module_1.ConfigModule,
            auth_module_1.AuthModule,
            obs_settings_module_1.OBSSettingsModule,
        ],
        controllers: [donations_controller_1.DonationsController, donation_links_controller_1.DonationLinksController],
        providers: [
            donations_service_1.DonationsService,
            analytics_service_1.AnalyticsService,
            donation_processing_service_1.DonationProcessingService,
            donation_webhook_service_1.DonationWebhookService,
            webhook_management_service_1.WebhookManagementService,
            donations_gateway_1.DonationsGateway,
        ],
        exports: [
            donations_service_1.DonationsService,
            analytics_service_1.AnalyticsService,
            donation_processing_service_1.DonationProcessingService,
            donation_webhook_service_1.DonationWebhookService,
            webhook_management_service_1.WebhookManagementService,
            donations_gateway_1.DonationsGateway,
        ],
    })
], DonationsModule);
//# sourceMappingURL=donations.module.js.map