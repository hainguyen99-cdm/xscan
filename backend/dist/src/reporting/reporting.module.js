"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const reporting_controller_1 = require("./reporting.controller");
const reporting_service_1 = require("./reporting.service");
const donation_schema_1 = require("../donations/schemas/donation.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const donation_link_schema_1 = require("../donations/schemas/donation-link.schema");
const analytics_event_schema_1 = require("../donations/schemas/analytics-event.schema");
const common_module_1 = require("../common/common.module");
let ReportingModule = class ReportingModule {
};
exports.ReportingModule = ReportingModule;
exports.ReportingModule = ReportingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: donation_schema_1.Donation.name, schema: donation_schema_1.DonationSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: donation_link_schema_1.DonationLink.name, schema: donation_link_schema_1.DonationLinkSchema },
                { name: analytics_event_schema_1.AnalyticsEvent.name, schema: analytics_event_schema_1.AnalyticsEventSchema },
            ]),
            common_module_1.CommonModule,
        ],
        controllers: [reporting_controller_1.ReportingController],
        providers: [reporting_service_1.ReportingService],
        exports: [reporting_service_1.ReportingService],
    })
], ReportingModule);
//# sourceMappingURL=reporting.module.js.map