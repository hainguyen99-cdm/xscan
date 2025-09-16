"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScansModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const scan_schema_1 = require("./schemas/scan.schema");
const scans_service_1 = require("./scans.service");
const scans_controller_1 = require("./scans.controller");
const common_module_1 = require("../common/common.module");
let ScansModule = class ScansModule {
};
exports.ScansModule = ScansModule;
exports.ScansModule = ScansModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: scan_schema_1.Scan.name, schema: scan_schema_1.ScanSchema }]),
            common_module_1.CommonModule,
        ],
        providers: [scans_service_1.ScansService],
        controllers: [scans_controller_1.ScansController],
        exports: [scans_service_1.ScansService],
    })
], ScansModule);
//# sourceMappingURL=scans.module.js.map