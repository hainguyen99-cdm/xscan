"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const payments_service_1 = require("./payments.service");
const stripe_service_1 = require("./stripe.service");
const paypal_service_1 = require("./paypal.service");
const payments_controller_1 = require("./payments.controller");
const transaction_management_service_1 = require("./transaction-management.service");
const admin_transaction_management_controller_1 = require("./admin-transaction-management.controller");
const transaction_schema_1 = require("./schemas/transaction.schema");
const config_module_1 = require("../config/config.module");
const common_module_1 = require("../common/common.module");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            common_module_1.CommonModule,
            mongoose_1.MongooseModule.forFeature([
                { name: transaction_schema_1.Transaction.name, schema: transaction_schema_1.TransactionSchema },
            ]),
        ],
        providers: [
            payments_service_1.PaymentsService,
            stripe_service_1.StripeService,
            paypal_service_1.PaypalService,
            transaction_management_service_1.TransactionManagementService,
        ],
        controllers: [
            payments_controller_1.PaymentsController,
            admin_transaction_management_controller_1.AdminTransactionManagementController,
        ],
        exports: [
            payments_service_1.PaymentsService,
            stripe_service_1.StripeService,
            paypal_service_1.PaypalService,
            transaction_management_service_1.TransactionManagementService,
        ],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map