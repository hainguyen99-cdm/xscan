"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const admin_dashboard_service_1 = require("./admin-dashboard.service");
const admin_user_management_service_1 = require("./admin-user-management.service");
const admin_fee_management_service_1 = require("./admin-fee-management.service");
const user_schema_1 = require("../users/schemas/user.schema");
const transaction_schema_1 = require("../payments/schemas/transaction.schema");
const donation_schema_1 = require("../donations/schemas/donation.schema");
const obs_settings_schema_1 = require("../obs-settings/obs-settings.schema");
const bank_account_schema_1 = require("../users/schemas/bank-account.schema");
const config_module_1 = require("../config/config.module");
const streamer_applications_module_1 = require("../streamer-applications/streamer-applications.module");
const common_module_1 = require("../common/common.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            common_module_1.CommonModule,
            streamer_applications_module_1.StreamerApplicationsModule,
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: transaction_schema_1.Transaction.name, schema: transaction_schema_1.TransactionSchema },
                { name: donation_schema_1.Donation.name, schema: donation_schema_1.DonationSchema },
                { name: obs_settings_schema_1.OBSSettings.name, schema: obs_settings_schema_1.OBSSettingsSchema },
                { name: bank_account_schema_1.BankAccount.name, schema: bank_account_schema_1.BankAccountSchema },
            ]),
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [
            admin_service_1.AdminService,
            admin_dashboard_service_1.AdminDashboardService,
            admin_user_management_service_1.AdminUserManagementService,
            admin_fee_management_service_1.AdminFeeManagementService,
        ],
        exports: [
            admin_service_1.AdminService,
            admin_dashboard_service_1.AdminDashboardService,
            admin_user_management_service_1.AdminUserManagementService,
            admin_fee_management_service_1.AdminFeeManagementService,
        ],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map