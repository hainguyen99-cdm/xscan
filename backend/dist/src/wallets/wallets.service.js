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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const wallet_schema_1 = require("./schemas/wallet.schema");
const transaction_schema_1 = require("./schemas/transaction.schema");
const payments_service_1 = require("../payments/payments.service");
const fee_calculation_service_1 = require("../common/services/fee-calculation.service");
const exchange_rate_service_1 = require("../common/services/exchange-rate.service");
let WalletsService = class WalletsService {
    constructor(walletModel, transactionModel, paymentsService, feeCalculationService, exchangeRateService) {
        this.walletModel = walletModel;
        this.transactionModel = transactionModel;
        this.paymentsService = paymentsService;
        this.feeCalculationService = feeCalculationService;
        this.exchangeRateService = exchangeRateService;
    }
    async createWallet(userId, createWalletDto) {
        const enforcedCurrency = 'VND';
        const existingWallet = await this.walletModel.findOne({
            userId: new mongoose_2.Types.ObjectId(userId),
            currency: enforcedCurrency,
        });
        if (existingWallet) {
            throw new common_1.ConflictException('User already has a wallet for this currency');
        }
        const wallet = new this.walletModel({
            userId: new mongoose_2.Types.ObjectId(userId),
            currency: enforcedCurrency,
            balance: 0,
            transactionHistory: [],
            isActive: true,
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalFees: 0,
        });
        return await wallet.save();
    }
    async getWallet(walletId) {
        const wallet = await this.walletModel.findById(walletId);
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        return wallet;
    }
    async getWalletByUserId(userId, currency) {
        const query = { userId: new mongoose_2.Types.ObjectId(userId) };
        if (currency) {
            query.currency = currency;
        }
        const wallet = await this.walletModel.findOne(query);
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        return wallet;
    }
    async getWalletByUserIdForUser(userId, requestingUserId, currency) {
        if (userId !== requestingUserId) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        return this.getWalletByUserId(userId, currency);
    }
    async validateWalletOwnership(walletId, userId) {
        const wallet = await this.getWallet(walletId);
        if (wallet.userId.toString() !== userId) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        return wallet;
    }
    async getWalletBalance(walletId, userId) {
        const wallet = userId
            ? await this.validateWalletOwnership(walletId, userId)
            : await this.getWallet(walletId);
        return {
            balance: wallet.balance,
            currency: wallet.currency,
        };
    }
    async addFunds(walletId, addFundsDto, userId) {
        const wallet = userId
            ? await this.validateWalletOwnership(walletId, userId)
            : await this.getWallet(walletId);
        if (!wallet.isActive) {
            throw new common_1.BadRequestException('Wallet is deactivated');
        }
        const amount = addFundsDto.amount;
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be greater than 0');
        }
        const feeResult = await this.feeCalculationService.calculateFee(amount, fee_calculation_service_1.FeeType.DEPOSIT, wallet.currency);
        const netAmount = amount - feeResult.feeAmount;
        const transaction = new this.transactionModel({
            walletId: wallet._id,
            userId: wallet.userId,
            type: transaction_schema_1.TransactionType.DEPOSIT,
            amount: netAmount,
            feeAmount: feeResult.feeAmount,
            totalAmount: amount,
            currency: wallet.currency,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            description: addFundsDto.description || 'Deposit',
            metadata: {
                feeType: fee_calculation_service_1.FeeType.DEPOSIT,
                feeDescription: feeResult.description,
            },
        });
        await transaction.save();
        wallet.balance += netAmount;
        wallet.lastTransactionAt = new Date();
        await wallet.save();
        return wallet;
    }
    async withdrawFunds(walletId, withdrawFundsDto, userId) {
        const wallet = userId
            ? await this.validateWalletOwnership(walletId, userId)
            : await this.getWallet(walletId);
        if (!wallet.isActive) {
            throw new common_1.BadRequestException('Wallet is deactivated');
        }
        const amount = withdrawFundsDto.amount;
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be greater than 0');
        }
        if (wallet.balance < amount) {
            throw new common_1.BadRequestException('Insufficient funds');
        }
        const feeResult = await this.feeCalculationService.calculateFee(amount, fee_calculation_service_1.FeeType.WITHDRAWAL, wallet.currency);
        const totalAmount = amount + feeResult.feeAmount;
        if (wallet.balance < totalAmount) {
            throw new common_1.BadRequestException('Insufficient funds to cover withdrawal amount and fees');
        }
        const transaction = new this.transactionModel({
            walletId: wallet._id,
            userId: wallet.userId,
            type: transaction_schema_1.TransactionType.WITHDRAWAL,
            amount: -amount,
            feeAmount: feeResult.feeAmount,
            totalAmount: totalAmount,
            currency: wallet.currency,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            description: withdrawFundsDto.description || 'Withdrawal',
            metadata: {
                feeType: fee_calculation_service_1.FeeType.WITHDRAWAL,
                feeDescription: feeResult.description,
            },
        });
        await transaction.save();
        wallet.balance -= totalAmount;
        wallet.lastTransactionAt = new Date();
        await wallet.save();
        return wallet;
    }
    async transferFunds(fromWalletId, transferFundsDto) {
        const fromWallet = await this.getWallet(fromWalletId);
        if (!fromWallet.isActive) {
            throw new common_1.BadRequestException('Source wallet is deactivated');
        }
        const toWallet = await this.getWallet(transferFundsDto.toWalletId);
        if (!toWallet.isActive) {
            throw new common_1.BadRequestException('Destination wallet is deactivated');
        }
        if (fromWallet._id.toString() === toWallet._id.toString()) {
            throw new common_1.BadRequestException('Cannot transfer to the same wallet');
        }
        const amount = transferFundsDto.amount;
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be greater than 0');
        }
        if (fromWallet.balance < amount) {
            throw new common_1.BadRequestException('Insufficient funds');
        }
        const feeResult = await this.feeCalculationService.calculateFee(amount, fee_calculation_service_1.FeeType.TRANSFER, fromWallet.currency);
        const totalAmount = amount + feeResult.feeAmount;
        if (fromWallet.balance < totalAmount) {
            throw new common_1.BadRequestException('Insufficient funds to cover transfer amount and fees');
        }
        const fromTransaction = new this.transactionModel({
            walletId: fromWallet._id,
            userId: fromWallet.userId,
            type: transaction_schema_1.TransactionType.TRANSFER,
            amount: -amount,
            feeAmount: feeResult.feeAmount,
            totalAmount: -totalAmount,
            currency: fromWallet.currency,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            description: transferFundsDto.description || 'Transfer out',
            metadata: {
                toWalletId: toWallet._id,
                feeType: fee_calculation_service_1.FeeType.TRANSFER,
                feeDescription: feeResult.description,
            },
        });
        const toTransaction = new this.transactionModel({
            walletId: toWallet._id,
            userId: toWallet.userId,
            type: transaction_schema_1.TransactionType.TRANSFER,
            amount: amount,
            feeAmount: 0,
            totalAmount: amount,
            currency: toWallet.currency,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            description: transferFundsDto.description || 'Transfer in',
            metadata: {
                fromWalletId: fromWallet._id,
                feeType: fee_calculation_service_1.FeeType.TRANSFER,
                feeDescription: 'Transfer received',
            },
        });
        await fromTransaction.save();
        await toTransaction.save();
        fromWallet.balance -= totalAmount;
        fromWallet.totalTransfers += amount;
        fromWallet.transactionHistory.push(fromTransaction._id);
        fromWallet.lastTransactionAt = new Date();
        toWallet.balance += amount;
        toWallet.totalTransfers += amount;
        toWallet.transactionHistory.push(toTransaction._id);
        toWallet.lastTransactionAt = new Date();
        await fromWallet.save();
        await toWallet.save();
        return { fromWallet, toWallet };
    }
    async getTransactionHistory(walletId, limit = 50, offset = 0, userId) {
        if (userId) {
            await this.validateWalletOwnership(walletId, userId);
        }
        else {
            await this.getWallet(walletId);
        }
        return await this.transactionModel
            .find({ walletId })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .exec();
    }
    async deactivateWallet(walletId) {
        const wallet = await this.getWallet(walletId);
        wallet.isActive = false;
        return await wallet.save();
    }
    async reactivateWallet(walletId) {
        const wallet = await this.getWallet(walletId);
        wallet.isActive = true;
        return await wallet.save();
    }
    async processDonation(fromWalletId, toUserId, amount, description) {
        const fromWallet = await this.getWallet(fromWalletId);
        if (!fromWallet.isActive) {
            throw new common_1.BadRequestException('Source wallet is deactivated');
        }
        const toWallet = await this.getWalletByUserId(toUserId, fromWallet.currency);
        if (!toWallet.isActive) {
            throw new common_1.BadRequestException('Destination wallet is deactivated');
        }
        if (fromWallet._id.toString() === toWallet._id.toString()) {
            throw new common_1.BadRequestException('Cannot donate to yourself');
        }
        if (amount <= 0) {
            throw new common_1.BadRequestException('Donation amount must be greater than 0');
        }
        if (fromWallet.balance < amount) {
            throw new common_1.BadRequestException('Insufficient funds');
        }
        const feeResult = await this.feeCalculationService.calculateFee(amount, fee_calculation_service_1.FeeType.DONATION, fromWallet.currency);
        const feeAmount = feeResult.feeAmount;
        const netDonationAmount = amount - feeAmount;
        if (fromWallet.balance < amount) {
            throw new common_1.BadRequestException('Insufficient funds to cover donation amount and fees');
        }
        const fromTransaction = new this.transactionModel({
            walletId: fromWallet._id,
            userId: fromWallet.userId,
            type: transaction_schema_1.TransactionType.DONATION,
            amount: -amount,
            feeAmount: feeAmount,
            totalAmount: -amount,
            currency: fromWallet.currency,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            description: description || 'Donation sent',
            metadata: {
                toUserId,
                toWalletId: toWallet._id,
                feeType: fee_calculation_service_1.FeeType.DONATION,
                feeDescription: feeResult.description,
            },
        });
        const toTransaction = new this.transactionModel({
            walletId: toWallet._id,
            userId: toWallet.userId,
            type: transaction_schema_1.TransactionType.DONATION,
            amount: netDonationAmount,
            feeAmount: 0,
            totalAmount: netDonationAmount,
            currency: toWallet.currency,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            description: description || 'Donation received',
            metadata: {
                fromUserId: fromWallet.userId,
                fromWalletId: fromWallet._id,
                feeType: fee_calculation_service_1.FeeType.DONATION,
                feeDescription: 'Donation received',
            },
        });
        await fromTransaction.save();
        await toTransaction.save();
        fromWallet.balance -= amount;
        fromWallet.totalDonations += amount;
        fromWallet.transactionHistory.push(fromTransaction._id);
        fromWallet.lastTransactionAt = new Date();
        toWallet.balance += netDonationAmount;
        toWallet.totalDonations += netDonationAmount;
        toWallet.transactionHistory.push(toTransaction._id);
        toWallet.lastTransactionAt = new Date();
        await fromWallet.save();
        await toWallet.save();
        return { fromWallet, toWallet, transaction: fromTransaction };
    }
    async processFee(walletId, amount, description, feeType) {
        const wallet = await this.getWallet(walletId);
        if (!wallet.isActive) {
            throw new common_1.BadRequestException('Wallet is deactivated');
        }
        if (amount <= 0) {
            throw new common_1.BadRequestException('Fee amount must be greater than 0');
        }
        const feeResult = await this.feeCalculationService.calculateFee(amount, feeType || fee_calculation_service_1.FeeType.TRANSACTION, wallet.currency);
        const calculatedFeeAmount = feeResult.feeAmount;
        if (wallet.balance < calculatedFeeAmount) {
            throw new common_1.BadRequestException('Insufficient funds to cover fee');
        }
        const transaction = new this.transactionModel({
            walletId: wallet._id,
            userId: wallet.userId,
            type: transaction_schema_1.TransactionType.FEE,
            amount: -calculatedFeeAmount,
            feeAmount: 0,
            totalAmount: -calculatedFeeAmount,
            currency: wallet.currency,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            description: description || `Fee: ${feeResult.description}`,
            metadata: {
                feeType: feeType || fee_calculation_service_1.FeeType.TRANSACTION,
                feeDescription: feeResult.description,
            },
        });
        await transaction.save();
        wallet.balance -= calculatedFeeAmount;
        wallet.totalFees += calculatedFeeAmount;
        wallet.transactionHistory.push(transaction._id);
        wallet.lastTransactionAt = new Date();
        await wallet.save();
        return { wallet, transaction };
    }
    async getTransactionById(transactionId) {
        const transaction = await this.transactionModel.findById(transactionId);
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async getTransactionsByType(walletId, type, limit = 50, offset = 0) {
        await this.getWallet(walletId);
        return await this.transactionModel
            .find({ walletId, type })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .exec();
    }
    async getTransactionStats(walletId) {
        await this.getWallet(walletId);
        const stats = await this.transactionModel.aggregate([
            { $match: { walletId: walletId } },
            {
                $group: {
                    _id: null,
                    totalDeposits: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$type', transaction_schema_1.TransactionType.DEPOSIT] },
                                        { $gte: ['$amount', 0] },
                                    ],
                                },
                                '$amount',
                                0,
                            ],
                        },
                    },
                    totalWithdrawals: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$type', transaction_schema_1.TransactionType.WITHDRAWAL] },
                                        { $gte: ['$amount', 0] },
                                    ],
                                },
                                '$amount',
                                0,
                            ],
                        },
                    },
                    totalFees: {
                        $sum: {
                            $cond: [
                                { $eq: ['$type', transaction_schema_1.TransactionType.FEE] },
                                { $abs: '$amount' },
                                0,
                            ],
                        },
                    },
                    totalDonations: {
                        $sum: {
                            $cond: [
                                { $eq: ['$type', transaction_schema_1.TransactionType.DONATION] },
                                { $abs: '$amount' },
                                0,
                            ],
                        },
                    },
                    totalTransfers: {
                        $sum: {
                            $cond: [
                                { $eq: ['$type', transaction_schema_1.TransactionType.TRANSFER] },
                                { $abs: '$amount' },
                                0,
                            ],
                        },
                    },
                    transactionCount: { $sum: 1 },
                },
            },
        ]);
        return (stats[0] || {
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalFees: 0,
            totalDonations: 0,
            totalTransfers: 0,
            transactionCount: 0,
        });
    }
    async processPayment(walletId, processPaymentDto) {
        const wallet = await this.getWallet(walletId);
        if (!wallet.isActive) {
            throw new common_1.BadRequestException('Wallet is deactivated');
        }
        switch (processPaymentDto.type) {
            case 'deposit':
                return await this.addFunds(walletId, {
                    amount: processPaymentDto.amount,
                    description: processPaymentDto.description,
                });
            case 'withdrawal':
                return await this.withdrawFunds(walletId, {
                    amount: processPaymentDto.amount,
                    description: processPaymentDto.description,
                });
            case 'transfer':
                if (!processPaymentDto.destinationWalletId) {
                    throw new common_1.BadRequestException('Destination wallet ID is required for transfers');
                }
                return await this.transferFunds(walletId, {
                    toWalletId: processPaymentDto.destinationWalletId,
                    amount: processPaymentDto.amount,
                    description: processPaymentDto.description,
                });
            default:
                throw new common_1.BadRequestException('Invalid payment type');
        }
    }
    async refundPayment(walletId, refundPaymentDto) {
        const wallet = await this.getWallet(walletId);
        if (!wallet.isActive) {
            throw new common_1.BadRequestException('Wallet is deactivated');
        }
        const originalTransaction = await this.transactionModel.findOne({
            paymentIntentId: refundPaymentDto.paymentIntentId,
        });
        if (!originalTransaction) {
            throw new common_1.NotFoundException('Original transaction not found');
        }
        const refundTransaction = new this.transactionModel({
            walletId: wallet._id,
            type: transaction_schema_1.TransactionType.REFUND,
            amount: refundPaymentDto.amount || originalTransaction.amount,
            currency: wallet.currency,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            description: `Refund: ${refundPaymentDto.reason || 'Payment refund'}`,
            reference: `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            paymentProvider: originalTransaction.paymentProvider,
            paymentIntentId: originalTransaction.paymentIntentId,
            processedAt: new Date(),
        });
        await refundTransaction.save();
        wallet.balance += refundTransaction.amount;
        wallet.transactionHistory.push(refundTransaction._id);
        await wallet.save();
        return { wallet, refundTransaction };
    }
    async createPaymentIntent(walletId, provider, amount, metadata) {
        const wallet = await this.getWallet(walletId);
        if (!wallet.isActive) {
            throw new common_1.BadRequestException('Wallet is deactivated');
        }
        const createPaymentIntentDto = {
            amount,
            currency: wallet.currency,
            description: metadata?.description || 'Wallet payment',
            metadata: {
                ...metadata,
                walletId: walletId,
                userId: wallet.userId,
            },
        };
        return await this.paymentsService.createPaymentIntent(provider, createPaymentIntentDto);
    }
    async confirmPayment(walletId, provider, paymentIntentId) {
        const wallet = await this.getWallet(walletId);
        if (!wallet.isActive) {
            throw new common_1.BadRequestException('Wallet is deactivated');
        }
        const paymentResult = await this.paymentsService.confirmPayment(provider, {
            paymentIntentId,
        });
        const transaction = await this.transactionModel.findOne({
            paymentIntentId,
        });
        if (transaction) {
            transaction.status = transaction_schema_1.TransactionStatus.COMPLETED;
            transaction.processedAt = new Date();
            await transaction.save();
            if (transaction.type === transaction_schema_1.TransactionType.DEPOSIT) {
                wallet.balance += transaction.amount;
                wallet.totalDeposits += transaction.amount;
                await wallet.save();
            }
        }
        return { paymentResult, wallet, transaction };
    }
    async withdrawViaPaymentProvider(walletId, provider, amount, destination, description) {
        const wallet = await this.getWallet(walletId);
        if (!wallet.isActive) {
            throw new common_1.BadRequestException('Wallet is deactivated');
        }
        if (wallet.balance < amount) {
            throw new common_1.BadRequestException('Insufficient funds');
        }
        const createPayoutDto = {
            amount,
            currency: wallet.currency,
            destination,
            description: description || 'Wallet withdrawal',
            metadata: {
                walletId: walletId,
                userId: wallet.userId,
            },
        };
        const payoutResult = await this.paymentsService.createPayout(provider, createPayoutDto);
        const transaction = new this.transactionModel({
            walletId: wallet._id,
            type: transaction_schema_1.TransactionType.WITHDRAWAL,
            amount: -amount,
            currency: wallet.currency,
            status: transaction_schema_1.TransactionStatus.PENDING,
            description: description || 'Withdrawal via payment provider',
            reference: `WTH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            paymentProvider: provider,
            payoutId: payoutResult.id,
            destination,
        });
        await transaction.save();
        wallet.balance -= amount;
        wallet.totalWithdrawals += amount;
        wallet.transactionHistory.push(transaction._id);
        await wallet.save();
        return { payoutResult, wallet, transaction };
    }
    async getFeeEstimate(provider, amount, currency) {
        const paymentProvider = provider.toLowerCase();
        return await this.paymentsService.getFeeEstimate(paymentProvider, amount, currency);
    }
    async getInternalFeeEstimate(amount, feeType, currency = 'VND', customFeeStructure) {
        return await this.feeCalculationService.getFeeEstimate(amount, feeType, currency, customFeeStructure);
    }
    async getRecommendedPaymentProvider(amount, currency) {
        return await this.paymentsService.getRecommendedProvider(amount, currency);
    }
    async getSupportedCurrencies(provider) {
        const paymentProvider = provider.toLowerCase();
        return await this.paymentsService.getSupportedCurrencies(paymentProvider);
    }
    async handlePaymentWebhook(provider, event) {
        const { type, data } = event;
        switch (type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentSuccess(data.object);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentFailure(data.object);
                break;
            case 'payout.paid':
                await this.handlePayoutSuccess(data.object);
                break;
            case 'payout.failed':
                await this.handlePayoutFailure(data.object);
                break;
            default:
                break;
        }
    }
    async handlePaymentSuccess(paymentIntent) {
        const transaction = await this.transactionModel.findOne({
            paymentIntentId: paymentIntent.id,
        });
        if (transaction) {
            transaction.status = transaction_schema_1.TransactionStatus.COMPLETED;
            transaction.processedAt = new Date();
            await transaction.save();
            const wallet = await this.walletModel.findById(transaction.walletId);
            if (wallet && transaction.type === transaction_schema_1.TransactionType.DEPOSIT) {
                wallet.balance += transaction.amount;
                wallet.totalDeposits += transaction.amount;
                await wallet.save();
            }
        }
    }
    async handlePaymentFailure(paymentIntent) {
        const transaction = await this.transactionModel.findOne({
            paymentIntentId: paymentIntent.id,
        });
        if (transaction) {
            transaction.status = transaction_schema_1.TransactionStatus.FAILED;
            transaction.failureReason =
                paymentIntent.last_payment_error?.message || 'Payment failed';
            await transaction.save();
        }
    }
    async handlePayoutSuccess(payout) {
        const transaction = await this.transactionModel.findOne({
            payoutId: payout.id,
        });
        if (transaction) {
            transaction.status = transaction_schema_1.TransactionStatus.COMPLETED;
            transaction.processedAt = new Date();
            await transaction.save();
        }
    }
    async handlePayoutFailure(payout) {
        const transaction = await this.transactionModel.findOne({
            payoutId: payout.id,
        });
        if (transaction) {
            transaction.status = transaction_schema_1.TransactionStatus.FAILED;
            transaction.failureReason = payout.failure_reason || 'Payout failed';
            await transaction.save();
            const wallet = await this.walletModel.findById(transaction.walletId);
            if (wallet) {
                wallet.balance += Math.abs(transaction.amount);
                wallet.totalWithdrawals -= Math.abs(transaction.amount);
                await wallet.save();
            }
        }
    }
    async convertCurrency(convertCurrencyDto) {
        const { amount, fromCurrency, toCurrency, description } = convertCurrencyDto;
        if (!this.exchangeRateService.isCurrencySupported(fromCurrency)) {
            throw new common_1.BadRequestException(`Unsupported source currency: ${fromCurrency}`);
        }
        if (!this.exchangeRateService.isCurrencySupported(toCurrency)) {
            throw new common_1.BadRequestException(`Unsupported target currency: ${toCurrency}`);
        }
        const conversion = await this.exchangeRateService.convertCurrency(amount, fromCurrency, toCurrency);
        return {
            ...conversion,
            description: description ||
                `Currency conversion from ${fromCurrency} to ${toCurrency}`,
            timestamp: new Date(),
        };
    }
    async getExchangeRates(getExchangeRateDto) {
        const { baseCurrency, targetCurrencies } = getExchangeRateDto;
        if (!this.exchangeRateService.isCurrencySupported(baseCurrency)) {
            throw new common_1.BadRequestException(`Unsupported base currency: ${baseCurrency}`);
        }
        const currencies = targetCurrencies ||
            this.exchangeRateService.getSupportedCurrencies().map((c) => c.code);
        for (const currency of currencies) {
            if (!this.exchangeRateService.isCurrencySupported(currency)) {
                throw new common_1.BadRequestException(`Unsupported target currency: ${currency}`);
            }
        }
        return await this.exchangeRateService.getExchangeRates(baseCurrency, currencies);
    }
    getSupportedCurrenciesList() {
        return this.exchangeRateService.getSupportedCurrencies();
    }
    async transferFundsCrossCurrency(fromWalletId, toWalletId, amount, description) {
        const fromWallet = await this.getWallet(fromWalletId);
        const toWallet = await this.getWallet(toWalletId);
        if (!fromWallet.isActive || !toWallet.isActive) {
            throw new common_1.BadRequestException('One or both wallets are deactivated');
        }
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be greater than 0');
        }
        if (fromWallet.balance < amount) {
            throw new common_1.BadRequestException('Insufficient funds in source wallet');
        }
        let convertedAmount = amount;
        let conversion = null;
        if (fromWallet.currency !== toWallet.currency) {
            conversion = await this.exchangeRateService.convertCurrency(amount, fromWallet.currency, toWallet.currency);
            convertedAmount = conversion.amount;
        }
        const feeResult = await this.feeCalculationService.calculateFee(amount, fee_calculation_service_1.FeeType.TRANSFER, fromWallet.currency);
        const totalDeduction = amount + feeResult.feeAmount;
        if (fromWallet.balance < totalDeduction) {
            throw new common_1.BadRequestException('Insufficient funds to cover transfer and fees');
        }
        const fromTransaction = new this.transactionModel({
            walletId: fromWallet._id,
            type: transaction_schema_1.TransactionType.TRANSFER,
            amount: -totalDeduction,
            currency: fromWallet.currency,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            description: description || `Transfer to ${toWallet.currency} wallet`,
            relatedWalletId: toWallet._id,
            fee: feeResult.feeAmount,
            metadata: conversion ? { conversion } : undefined,
            processedAt: new Date(),
        });
        const toTransaction = new this.transactionModel({
            walletId: toWallet._id,
            type: transaction_schema_1.TransactionType.TRANSFER,
            amount: convertedAmount,
            currency: toWallet.currency,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            description: description || `Transfer from ${fromWallet.currency} wallet`,
            relatedWalletId: fromWallet._id,
            metadata: conversion ? { conversion } : undefined,
            processedAt: new Date(),
        });
        fromWallet.balance -= totalDeduction;
        fromWallet.totalTransfers += amount;
        fromWallet.totalFees += feeResult.feeAmount;
        fromWallet.lastTransactionAt = new Date();
        fromWallet.transactionHistory.push(fromTransaction._id);
        toWallet.balance += convertedAmount;
        toWallet.totalTransfers += convertedAmount;
        toWallet.lastTransactionAt = new Date();
        toWallet.transactionHistory.push(toTransaction._id);
        await Promise.all([
            fromTransaction.save(),
            toTransaction.save(),
            fromWallet.save(),
            toWallet.save(),
        ]);
        return {
            fromWallet,
            toWallet,
            conversion,
        };
    }
    async getWalletBalanceInCurrency(walletId, targetCurrency) {
        const wallet = await this.getWallet(walletId);
        if (!this.exchangeRateService.isCurrencySupported(targetCurrency)) {
            throw new common_1.BadRequestException(`Unsupported target currency: ${targetCurrency}`);
        }
        if (wallet.currency === targetCurrency) {
            return {
                balance: wallet.balance,
                currency: wallet.currency,
                convertedBalance: wallet.balance,
                targetCurrency,
                rate: 1,
            };
        }
        const conversion = await this.exchangeRateService.convertCurrency(wallet.balance, wallet.currency, targetCurrency);
        return {
            balance: wallet.balance,
            currency: wallet.currency,
            convertedBalance: conversion.amount,
            targetCurrency,
            rate: conversion.rate,
        };
    }
    getExchangeRateCacheStats() {
        return this.exchangeRateService.getCacheStats();
    }
    clearExchangeRateCache() {
        return this.exchangeRateService.clearCache();
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(wallet_schema_1.Wallet.name)),
    __param(1, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        payments_service_1.PaymentsService,
        fee_calculation_service_1.FeeCalculationService,
        exchange_rate_service_1.ExchangeRateService])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map