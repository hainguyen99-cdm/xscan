"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthJwtModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_module_1 = require("../config/config.module");
const users_module_1 = require("../users/users.module");
const common_module_1 = require("../common/common.module");
const jwt_strategy_1 = require("./jwt.strategy");
const local_strategy_1 = require("./local.strategy");
const local_auth_guard_1 = require("./guards/local-auth.guard");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
let AuthJwtModule = class AuthJwtModule {
};
exports.AuthJwtModule = AuthJwtModule;
exports.AuthJwtModule = AuthJwtModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            users_module_1.UsersModule,
            common_module_1.CommonModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: 'your-super-secret-jwt-key-change-in-production',
                signOptions: {
                    expiresIn: '24h',
                },
            }),
        ],
        providers: [
            jwt_strategy_1.JwtStrategy,
            local_strategy_1.LocalStrategy,
            local_auth_guard_1.LocalAuthGuard,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
        ],
        exports: [jwt_1.JwtModule, local_auth_guard_1.LocalAuthGuard, jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard],
    })
], AuthJwtModule);
//# sourceMappingURL=jwt.module.js.map