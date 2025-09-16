"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanSchema = exports.Scan = exports.ScanType = exports.ScanStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ScanStatus;
(function (ScanStatus) {
    ScanStatus["PENDING"] = "pending";
    ScanStatus["IN_PROGRESS"] = "in_progress";
    ScanStatus["COMPLETED"] = "completed";
    ScanStatus["FAILED"] = "failed";
})(ScanStatus || (exports.ScanStatus = ScanStatus = {}));
var ScanType;
(function (ScanType) {
    ScanType["PORT_SCAN"] = "port_scan";
    ScanType["VULNERABILITY_SCAN"] = "vulnerability_scan";
    ScanType["WEB_APPLICATION_SCAN"] = "web_application_scan";
})(ScanType || (exports.ScanType = ScanType = {}));
let Scan = class Scan {
};
exports.Scan = Scan;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Scan.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Scan.prototype, "target", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ScanType }),
    __metadata("design:type", String)
], Scan.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ScanStatus, default: ScanStatus.PENDING }),
    __metadata("design:type", String)
], Scan.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Scan.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Scan.prototype, "results", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Scan.prototype, "startedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Scan.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Scan.prototype, "errorMessage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Scan.prototype, "configuration", void 0);
exports.Scan = Scan = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Scan);
exports.ScanSchema = mongoose_1.SchemaFactory.createForClass(Scan);
//# sourceMappingURL=scan.schema.js.map