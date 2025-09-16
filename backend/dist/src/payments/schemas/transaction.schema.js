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
exports.TransactionSchema = exports.Transaction = exports.DisputeResolution = exports.DisputeStatus = exports.PaymentMethod = exports.TransactionStatus = exports.TransactionType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var TransactionType;
(function (TransactionType) {
    TransactionType["DONATION"] = "donation";
    TransactionType["WITHDRAWAL"] = "withdrawal";
    TransactionType["REFUND"] = "refund";
    TransactionType["FEE"] = "fee";
    TransactionType["TRANSFER"] = "transfer";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["DISPUTED"] = "disputed";
    TransactionStatus["CANCELLED"] = "cancelled";
    TransactionStatus["PROCESSING"] = "processing";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["STRIPE"] = "stripe";
    PaymentMethod["PAYPAL"] = "paypal";
    PaymentMethod["WALLET"] = "wallet";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var DisputeStatus;
(function (DisputeStatus) {
    DisputeStatus["OPEN"] = "open";
    DisputeStatus["UNDER_INVESTIGATION"] = "under_investigation";
    DisputeStatus["RESOLVED"] = "resolved";
    DisputeStatus["CLOSED"] = "closed";
})(DisputeStatus || (exports.DisputeStatus = DisputeStatus = {}));
var DisputeResolution;
(function (DisputeResolution) {
    DisputeResolution["REFUND"] = "refund";
    DisputeResolution["APPROVE"] = "approve";
    DisputeResolution["PARTIAL_REFUND"] = "partial_refund";
    DisputeResolution["INVESTIGATION"] = "investigation";
})(DisputeResolution || (exports.DisputeResolution = DisputeResolution = {}));
let Transaction = class Transaction {
};
exports.Transaction = Transaction;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Transaction.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Transaction.prototype, "userName", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: TransactionType,
        required: true
    }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0.01 }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
        default: 'USD',
    }),
    __metadata("design:type", String)
], Transaction.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: TransactionStatus,
        required: true,
        default: TransactionStatus.PENDING
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: PaymentMethod,
        required: true
    }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 500 }),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Transaction.prototype, "transactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentIntentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "processingFee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "feeAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "netAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Transaction.prototype, "failureReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Transaction.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Transaction.prototype, "failedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Transaction.prototype, "cancelledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Transaction.prototype, "disputedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Transaction.prototype, "resolvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Transaction.prototype, "disputeReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: DisputeStatus
    }),
    __metadata("design:type", String)
], Transaction.prototype, "disputeStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: DisputeResolution
    }),
    __metadata("design:type", String)
], Transaction.prototype, "disputeResolution", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Transaction.prototype, "adminNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Transaction.prototype, "adminId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Transaction.prototype, "adminActionAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "manualAdjustment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Transaction.prototype, "adjustmentReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Transaction.prototype, "adjustmentAdminId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Transaction.prototype, "adjustmentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Transaction.prototype, "bankAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['verified', 'pending', 'failed', 'not_required'],
        default: 'not_required'
    }),
    __metadata("design:type", String)
], Transaction.prototype, "verificationStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['approved', 'pending', 'rejected', 'not_required'],
        default: 'not_required'
    }),
    __metadata("design:type", String)
], Transaction.prototype, "kycStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "refundAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Transaction.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Transaction' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Transaction.prototype, "relatedTransactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Donation' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Transaction.prototype, "donationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Transaction.prototype, "recipientId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Transaction.prototype, "recipientName", void 0);
exports.Transaction = Transaction = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Transaction);
exports.TransactionSchema = mongoose_1.SchemaFactory.createForClass(Transaction);
exports.TransactionSchema.index({ userId: 1 });
exports.TransactionSchema.index({ status: 1 });
exports.TransactionSchema.index({ type: 1 });
exports.TransactionSchema.index({ createdAt: -1 });
exports.TransactionSchema.index({ paymentMethod: 1 });
exports.TransactionSchema.index({ disputeStatus: 1 });
exports.TransactionSchema.index({ adminId: 1 });
exports.TransactionSchema.index({ relatedTransactionId: 1 });
exports.TransactionSchema.index({ donationId: 1 });
exports.TransactionSchema.index({ recipientId: 1 });
exports.TransactionSchema.index({ status: 1, type: 1 });
exports.TransactionSchema.index({ userId: 1, status: 1 });
exports.TransactionSchema.index({ createdAt: -1, status: 1 });
exports.TransactionSchema.index({ disputeStatus: 1, status: 1 });
//# sourceMappingURL=transaction.schema.js.map