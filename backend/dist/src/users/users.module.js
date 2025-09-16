"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const platform_express_1 = require("@nestjs/platform-express");
const user_schema_1 = require("./schemas/user.schema");
const follow_schema_1 = require("./schemas/follow.schema");
const bank_account_schema_1 = require("./schemas/bank-account.schema");
const bank_transaction_schema_1 = require("../bank-sync/schemas/bank-transaction.schema");
const streamer_application_schema_1 = require("../streamer-applications/streamer-application.schema");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const file_upload_service_1 = require("./services/file-upload.service");
const profile_service_1 = require("./services/profile.service");
const bank_account_service_1 = require("./services/bank-account.service");
const common_module_1 = require("../common/common.module");
const config_module_1 = require("../config/config.module");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: follow_schema_1.Follow.name, schema: follow_schema_1.FollowSchema },
                { name: bank_account_schema_1.BankAccount.name, schema: bank_account_schema_1.BankAccountSchema },
                { name: bank_transaction_schema_1.BankTransaction.name, schema: bank_transaction_schema_1.BankTransactionSchema },
                { name: streamer_application_schema_1.StreamerApplication.name, schema: streamer_application_schema_1.StreamerApplicationSchema },
                { name: 'DonationLink', schema: require('../donations/schemas/donation-link.schema').DonationLinkSchema },
                { name: 'Donation', schema: require('../donations/schemas/donation.schema').DonationSchema },
            ]),
            platform_express_1.MulterModule.register({
                dest: './uploads',
            }),
            config_module_1.ConfigModule,
            common_module_1.CommonModule,
        ],
        providers: [users_service_1.UsersService, file_upload_service_1.FileUploadService, profile_service_1.ProfileService, bank_account_service_1.BankAccountService],
        controllers: [users_controller_1.UsersController],
        exports: [users_service_1.UsersService, file_upload_service_1.FileUploadService, profile_service_1.ProfileService, bank_account_service_1.BankAccountService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map