"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBSSettingsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const obs_settings_controller_1 = require("./obs-settings.controller");
const widget_controller_1 = require("./widget.controller");
const widget_public_controller_1 = require("./widget-public.controller");
const obs_settings_service_1 = require("./obs-settings.service");
const obs_settings_schema_1 = require("./obs-settings.schema");
const obs_widget_gateway_1 = require("./obs-widget.gateway");
const obs_security_service_1 = require("./obs-security.service");
const common_module_1 = require("../common/common.module");
const users_module_1 = require("../users/users.module");
const auth_module_1 = require("../auth/auth.module");
let OBSSettingsModule = class OBSSettingsModule {
};
exports.OBSSettingsModule = OBSSettingsModule;
exports.OBSSettingsModule = OBSSettingsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: obs_settings_schema_1.OBSSettings.name, schema: obs_settings_schema_1.OBSSettingsSchema },
            ]),
            common_module_1.CommonModule,
            users_module_1.UsersModule,
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
        ],
        controllers: [
            obs_settings_controller_1.OBSSettingsController,
            widget_controller_1.WidgetController,
            widget_public_controller_1.WidgetPublicController,
        ],
        providers: [
            obs_settings_service_1.OBSSettingsService,
            obs_widget_gateway_1.OBSWidgetGateway,
            obs_security_service_1.OBSSecurityService,
        ],
        exports: [
            obs_settings_service_1.OBSSettingsService,
            obs_widget_gateway_1.OBSWidgetGateway,
            obs_security_service_1.OBSSecurityService,
        ],
    })
], OBSSettingsModule);
//# sourceMappingURL=obs-settings.module.js.map