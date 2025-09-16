"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankSyncModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bank_sync_service_1 = require("./bank-sync.service");
const bank_transaction_schema_1 = require("./schemas/bank-transaction.schema");
const users_module_1 = require("../users/users.module");
const obs_settings_module_1 = require("../obs-settings/obs-settings.module");
const config_module_1 = require("../config/config.module");
let BankSyncModule = class BankSyncModule {
};
exports.BankSyncModule = BankSyncModule;
exports.BankSyncModule = BankSyncModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: bank_transaction_schema_1.BankTransaction.name, schema: bank_transaction_schema_1.BankTransactionSchema },
            ]),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => obs_settings_module_1.OBSSettingsModule),
            config_module_1.ConfigModule,
        ],
        providers: [bank_sync_service_1.BankSyncService],
        exports: [bank_sync_service_1.BankSyncService],
    })
], BankSyncModule);
//# sourceMappingURL=bank-sync.module.js.map