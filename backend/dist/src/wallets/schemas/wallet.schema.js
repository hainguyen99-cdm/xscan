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
exports.WalletSchema = exports.Wallet = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Wallet = class Wallet {
};
exports.Wallet = Wallet;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Wallet.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        required: true,
        default: 0,
        min: 0,
    }),
    __metadata("design:type", Number)
], Wallet.prototype, "balance", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
        enum: ['VND'],
        default: 'VND',
    }),
    __metadata("design:type", String)
], Wallet.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [mongoose_2.Types.ObjectId],
        ref: 'Transaction',
        default: [],
    }),
    __metadata("design:type", Array)
], Wallet.prototype, "transactionHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Boolean,
        required: true,
        default: true,
    }),
    __metadata("design:type", Boolean)
], Wallet.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        default: Date.now,
    }),
    __metadata("design:type", Date)
], Wallet.prototype, "lastTransactionAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
        min: 0,
    }),
    __metadata("design:type", Number)
], Wallet.prototype, "totalDeposits", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
        min: 0,
    }),
    __metadata("design:type", Number)
], Wallet.prototype, "totalWithdrawals", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
        min: 0,
    }),
    __metadata("design:type", Number)
], Wallet.prototype, "totalFees", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
        min: 0,
    }),
    __metadata("design:type", Number)
], Wallet.prototype, "totalTransfers", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
        min: 0,
    }),
    __metadata("design:type", Number)
], Wallet.prototype, "totalDonations", void 0);
exports.Wallet = Wallet = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Wallet);
exports.WalletSchema = mongoose_1.SchemaFactory.createForClass(Wallet);
exports.WalletSchema.index({ currency: 1 });
exports.WalletSchema.index({ isActive: 1 });
//# sourceMappingURL=wallet.schema.js.map