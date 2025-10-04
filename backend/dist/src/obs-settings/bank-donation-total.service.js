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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BankDonationTotalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankDonationTotalService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bank_transaction_schema_1 = require("../bank-sync/schemas/bank-transaction.schema");
let BankDonationTotalService = BankDonationTotalService_1 = class BankDonationTotalService {
    constructor(bankTransactionModel) {
        this.bankTransactionModel = bankTransactionModel;
        this.logger = new common_1.Logger(BankDonationTotalService_1.name);
    }
    async getTotalBankDonations(streamerId) {
        try {
            if (!mongoose_2.Types.ObjectId.isValid(streamerId)) {
                this.logger.warn(`Invalid streamerId format: ${streamerId}`);
                return {
                    totalAmount: 0,
                    currency: 'VND',
                    transactionCount: 0,
                };
            }
            const streamerObjectId = new mongoose_2.Types.ObjectId(streamerId);
            const result = await this.bankTransactionModel.aggregate([
                {
                    $match: {
                        streamerId: streamerObjectId,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                        transactionCount: { $sum: 1 },
                        lastDonationDate: { $max: '$transactionDate' },
                        currency: { $first: '$currency' },
                    },
                },
            ]);
            if (result.length === 0) {
                return {
                    totalAmount: 0,
                    currency: 'VND',
                    transactionCount: 0,
                };
            }
            const data = result[0];
            return {
                totalAmount: data.totalAmount || 0,
                currency: data.currency || 'VND',
                transactionCount: data.transactionCount || 0,
                lastDonationDate: data.lastDonationDate,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get total bank donations for streamer ${streamerId}:`, error);
            throw error;
        }
    }
    async getBankDonationStats(streamerId) {
        try {
            if (!mongoose_2.Types.ObjectId.isValid(streamerId)) {
                this.logger.warn(`Invalid streamerId format: ${streamerId}`);
                return {
                    totalAmount: 0,
                    currency: 'VND',
                    transactionCount: 0,
                    averageDonation: 0,
                    todayDonations: 0,
                    thisWeekDonations: 0,
                    thisMonthDonations: 0,
                };
            }
            const streamerObjectId = new mongoose_2.Types.ObjectId(streamerId);
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const [totalStats, todayStats, weekStats, monthStats] = await Promise.all([
                this.bankTransactionModel.aggregate([
                    {
                        $match: {
                            streamerId: streamerObjectId,
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: '$amount' },
                            transactionCount: { $sum: 1 },
                            lastDonationDate: { $max: '$transactionDate' },
                            currency: { $first: '$currency' },
                        },
                    },
                ]),
                this.bankTransactionModel.aggregate([
                    {
                        $match: {
                            streamerId: streamerObjectId,
                            transactionDate: { $gte: startOfDay },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: '$amount' },
                            transactionCount: { $sum: 1 },
                        },
                    },
                ]),
                this.bankTransactionModel.aggregate([
                    {
                        $match: {
                            streamerId: streamerObjectId,
                            transactionDate: { $gte: startOfWeek },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: '$amount' },
                            transactionCount: { $sum: 1 },
                        },
                    },
                ]),
                this.bankTransactionModel.aggregate([
                    {
                        $match: {
                            streamerId: streamerObjectId,
                            transactionDate: { $gte: startOfMonth },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: '$amount' },
                            transactionCount: { $sum: 1 },
                        },
                    },
                ]),
            ]);
            const totalData = totalStats[0] || { totalAmount: 0, transactionCount: 0, currency: 'VND' };
            const todayData = todayStats[0] || { totalAmount: 0, transactionCount: 0 };
            const weekData = weekStats[0] || { totalAmount: 0, transactionCount: 0 };
            const monthData = monthStats[0] || { totalAmount: 0, transactionCount: 0 };
            return {
                totalAmount: totalData.totalAmount || 0,
                currency: totalData.currency || 'VND',
                transactionCount: totalData.transactionCount || 0,
                lastDonationDate: totalData.lastDonationDate,
                averageDonation: totalData.transactionCount > 0 ? totalData.totalAmount / totalData.transactionCount : 0,
                todayDonations: todayData.totalAmount || 0,
                thisWeekDonations: weekData.totalAmount || 0,
                thisMonthDonations: monthData.totalAmount || 0,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get bank donation stats for streamer ${streamerId}:`, error);
            throw error;
        }
    }
    formatCurrency(amount, currency = 'VND') {
        if (currency === 'VND') {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount);
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }
};
exports.BankDonationTotalService = BankDonationTotalService;
exports.BankDonationTotalService = BankDonationTotalService = BankDonationTotalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(bank_transaction_schema_1.BankTransaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BankDonationTotalService);
//# sourceMappingURL=bank-donation-total.service.js.map