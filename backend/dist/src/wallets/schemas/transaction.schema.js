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
exports.TransactionSchema = exports.Transaction = exports.TransactionStatus = exports.TransactionType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "deposit";
    TransactionType["WITHDRAWAL"] = "withdrawal";
    TransactionType["TRANSFER"] = "transfer";
    TransactionType["FEE"] = "fee";
    TransactionType["REFUND"] = "refund";
    TransactionType["DONATION"] = "donation";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["CANCELLED"] = "cancelled";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
let Transaction = class Transaction {
};
exports.Transaction = Transaction;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Wallet',
        required: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Transaction.prototype, "walletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
        enum: TransactionType,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        required: true,
    }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
        enum: ['VND'],
    }),
    __metadata("design:type", String)
], Transaction.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: false,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: false,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "reference", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
        min: 0,
    }),
    __metadata("design:type", Number)
], Transaction.prototype, "fee", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Wallet',
        required: false,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Transaction.prototype, "relatedWalletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        required: false,
    }),
    __metadata("design:type", Object)
], Transaction.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        required: false,
    }),
    __metadata("design:type", Date)
], Transaction.prototype, "processedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: false,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "failureReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: false,
        enum: ['stripe', 'paypal'],
    }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentProvider", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: false,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentIntentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: false,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "payoutId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: false,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "destination", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: false,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "feeType", void 0);
exports.Transaction = Transaction = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Transaction);
exports.TransactionSchema = mongoose_1.SchemaFactory.createForClass(Transaction);
exports.TransactionSchema.index({ walletId: 1 });
exports.TransactionSchema.index({ type: 1 });
exports.TransactionSchema.index({ status: 1 });
exports.TransactionSchema.index({ createdAt: 1 });
exports.TransactionSchema.index({ reference: 1 }, { unique: true, sparse: true });
exports.TransactionSchema.index({ paymentIntentId: 1 });
exports.TransactionSchema.index({ payoutId: 1 });
exports.TransactionSchema.index({ paymentProvider: 1 });
//# sourceMappingURL=transaction.schema.js.map