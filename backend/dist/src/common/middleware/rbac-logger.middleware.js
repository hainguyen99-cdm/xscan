"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RbacLoggerMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
let RbacLoggerMiddleware = RbacLoggerMiddleware_1 = class RbacLoggerMiddleware {
    constructor() {
        this.logger = new common_1.Logger(RbacLoggerMiddleware_1.name);
    }
    use(req, res, next) {
        const { method, originalUrl, user } = req;
        const timestamp = new Date().toISOString();
        if (user) {
            this.logger.log(`Access attempt - Method: ${method}, URL: ${originalUrl}, User: ${user.sub}, Role: ${user.role}, Timestamp: ${timestamp}`);
        }
        else {
            this.logger.warn(`Unauthenticated access attempt - Method: ${method}, URL: ${originalUrl}, Timestamp: ${timestamp}`);
        }
        next();
    }
};
exports.RbacLoggerMiddleware = RbacLoggerMiddleware;
exports.RbacLoggerMiddleware = RbacLoggerMiddleware = RbacLoggerMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], RbacLoggerMiddleware);
//# sourceMappingURL=rbac-logger.middleware.js.map