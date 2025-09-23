"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const notification_service_1 = require("./notification.service");
const notification_controller_1 = require("./notification.controller");
const notification_schema_1 = require("./schemas/notification.schema");
const notification_preferences_schema_1 = require("./schemas/notification-preferences.schema");
const email_module_1 = require("../email/email.module");
const redis_module_1 = require("../redis/redis.module");
const config_module_1 = require("../config/config.module");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: notification_schema_1.Notification.name, schema: notification_schema_1.NotificationSchema },
                { name: notification_preferences_schema_1.NotificationPreferences.name, schema: notification_preferences_schema_1.NotificationPreferencesSchema },
            ]),
            email_module_1.EmailModule,
            redis_module_1.RedisModule,
            config_module_1.ConfigModule,
        ],
        providers: [notification_service_1.NotificationService],
        controllers: [notification_controller_1.NotificationController],
        exports: [notification_service_1.NotificationService],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map