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
exports.BankTransactionSchema = exports.BankTransaction = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let BankTransaction = class BankTransaction {
};
exports.BankTransaction = BankTransaction;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], BankTransaction.prototype, "streamerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], BankTransaction.prototype, "reference", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], BankTransaction.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 1 }),
    __metadata("design:type", Number)
], BankTransaction.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['VND'], default: 'VND' }),
    __metadata("design:type", String)
], BankTransaction.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], BankTransaction.prototype, "transactionDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], BankTransaction.prototype, "raw", void 0);
exports.BankTransaction = BankTransaction = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], BankTransaction);
exports.BankTransactionSchema = mongoose_1.SchemaFactory.createForClass(BankTransaction);
exports.BankTransactionSchema.index({ streamerId: 1, reference: 1 }, { unique: true });
exports.BankTransactionSchema.index({ streamerId: 1, createdAt: -1 });
//# sourceMappingURL=bank-transaction.schema.js.map