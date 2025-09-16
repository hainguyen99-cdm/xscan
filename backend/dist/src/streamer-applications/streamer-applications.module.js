"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamerApplicationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const streamer_application_schema_1 = require("./streamer-application.schema");
const streamer_applications_service_1 = require("./streamer-applications.service");
const streamer_applications_controller_1 = require("./streamer-applications.controller");
const users_module_1 = require("../users/users.module");
const notification_module_1 = require("../notifications/notification.module");
let StreamerApplicationsModule = class StreamerApplicationsModule {
};
exports.StreamerApplicationsModule = StreamerApplicationsModule;
exports.StreamerApplicationsModule = StreamerApplicationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: streamer_application_schema_1.StreamerApplication.name, schema: streamer_application_schema_1.StreamerApplicationSchema },
            ]),
            users_module_1.UsersModule,
            notification_module_1.NotificationModule,
        ],
        controllers: [streamer_applications_controller_1.StreamerApplicationsController],
        providers: [streamer_applications_service_1.StreamerApplicationsService],
        exports: [streamer_applications_service_1.StreamerApplicationsService],
    })
], StreamerApplicationsModule);
//# sourceMappingURL=streamer-applications.module.js.map