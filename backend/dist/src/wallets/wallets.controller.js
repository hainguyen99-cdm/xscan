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
exports.WalletsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const wallets_service_1 = require("./wallets.service");
const dto_1 = require("./dto");
const payments_service_1 = require("../payments/payments.service");
const dto_2 = require("../payments/dto");
const swagger_1 = require("@nestjs/swagger");
let WalletsController = class WalletsController {
    constructor(walletsService) {
        this.walletsService = walletsService;
    }
    async createWallet(req, createWalletDto) {
        const wallet = await this.walletsService.createWallet(req.user.id, createWalletDto);
        return {
            success: true,
            data: wallet,
            message: 'Wallet created successfully',
        };
    }
    async getWallet(id) {
        const wallet = await this.walletsService.getWallet(id);
        return {
            success: true,
            data: wallet,
            message: 'Wallet retrieved successfully',
        };
    }
    async getWalletByUserId(req, userId, currency) {
        const wallet = await this.walletsService.getWalletByUserIdForUser(userId, req.user.id, currency);
        return {
            success: true,
            data: wallet,
            message: 'Wallet retrieved successfully',
        };
    }
    async getWalletBalance(req, id) {
        const balance = await this.walletsService.getWalletBalance(id, req.user.id);
        return {
            success: true,
            data: balance,
            message: 'Balance retrieved successfully',
        };
    }
    async addFunds(req, id, addFundsDto) {
        const wallet = await this.walletsService.addFunds(id, addFundsDto, req.user.id);
        return {
            success: true,
            data: wallet,
            message: 'Funds added successfully',
        };
    }
    async withdrawFunds(req, id, withdrawFundsDto) {
        const wallet = await this.walletsService.withdrawFunds(id, withdrawFundsDto, req.user.id);
        return {
            success: true,
            data: wallet,
            message: 'Funds withdrawn successfully',
        };
    }
    async transferFunds(id, transferFundsDto) {
        const result = await this.walletsService.transferFunds(id, transferFundsDto);
        return {
            success: true,
            data: result,
            message: 'Funds transferred successfully',
        };
    }
    async getTransactionHistory(req, id, limit, offset) {
        const transactions = await this.walletsService.getTransactionHistory(id, limit || 50, offset || 0, req.user.id);
        return {
            success: true,
            data: transactions,
            message: 'Transaction history retrieved successfully',
        };
    }
    async processDonation(id, processDonationDto) {
        const result = await this.walletsService.processDonation(id, processDonationDto.toUserId, processDonationDto.amount, processDonationDto.description);
        return {
            success: true,
            data: result,
            message: 'Donation processed successfully',
        };
    }
    async processFee(id, processFeeDto) {
        const result = await this.walletsService.processFee(id, processFeeDto.amount, processFeeDto.description, processFeeDto.feeType);
        return {
            success: true,
            data: result,
            message: 'Fee processed successfully',
        };
    }
    async getTransactionById(transactionId) {
        const transaction = await this.walletsService.getTransactionById(transactionId);
        return {
            success: true,
            data: transaction,
            message: 'Transaction retrieved successfully',
        };
    }
    async getTransactionsByType(id, type, limit, offset) {
        const transactions = await this.walletsService.getTransactionsByType(id, type, limit || 50, offset || 0);
        return {
            success: true,
            data: transactions,
            message: 'Transactions retrieved successfully',
        };
    }
    async getTransactionStats(id) {
        const stats = await this.walletsService.getTransactionStats(id);
        return {
            success: true,
            data: stats,
            message: 'Transaction statistics retrieved successfully',
        };
    }
    async deactivateWallet(id) {
        const wallet = await this.walletsService.deactivateWallet(id);
        return {
            success: true,
            data: wallet,
            message: 'Wallet deactivated successfully',
        };
    }
    async reactivateWallet(id) {
        const wallet = await this.walletsService.reactivateWallet(id);
        return {
            success: true,
            data: wallet,
            message: 'Wallet reactivated successfully',
        };
    }
    async processPayment(id, processPaymentDto) {
        const result = await this.walletsService.processPayment(id, processPaymentDto);
        return {
            success: true,
            data: result,
            message: 'Payment processed successfully',
        };
    }
    async refundPayment(id, refundPaymentDto) {
        const result = await this.walletsService.refundPayment(id, refundPaymentDto);
        return {
            success: true,
            data: result,
            message: 'Payment refunded successfully',
        };
    }
    async createStripePaymentIntent(id, body) {
        const paymentIntent = await this.walletsService.createPaymentIntent(id, payments_service_1.PaymentProvider.STRIPE, body.amount, body.metadata);
        return {
            success: true,
            data: paymentIntent,
            message: 'Stripe payment intent created successfully',
        };
    }
    async createPayPalPaymentIntent(id, body) {
        const paymentIntent = await this.walletsService.createPaymentIntent(id, payments_service_1.PaymentProvider.PAYPAL, body.amount, body.metadata);
        return {
            success: true,
            data: paymentIntent,
            message: 'PayPal payment intent created successfully',
        };
    }
    async confirmStripePayment(id, body) {
        const result = await this.walletsService.confirmPayment(id, payments_service_1.PaymentProvider.STRIPE, body.paymentIntentId);
        return {
            success: true,
            data: result,
            message: 'Stripe payment confirmed successfully',
        };
    }
    async confirmPayPalPayment(id, body) {
        const result = await this.walletsService.confirmPayment(id, payments_service_1.PaymentProvider.PAYPAL, body.paymentIntentId);
        return {
            success: true,
            data: result,
            message: 'PayPal payment confirmed successfully',
        };
    }
    async withdrawViaStripe(id, body) {
        const result = await this.walletsService.withdrawViaPaymentProvider(id, payments_service_1.PaymentProvider.STRIPE, body.amount, body.destination, body.description);
        return {
            success: true,
            data: result,
            message: 'Stripe withdrawal initiated successfully',
        };
    }
    async withdrawViaPayPal(id, body) {
        const result = await this.walletsService.withdrawViaPaymentProvider(id, payments_service_1.PaymentProvider.PAYPAL, body.amount, body.destination, body.description);
        return {
            success: true,
            data: result,
            message: 'PayPal withdrawal initiated successfully',
        };
    }
    async getSupportedCurrencies(provider) {
        const currencies = await this.walletsService.getSupportedCurrencies(provider);
        return {
            success: true,
            data: currencies,
            message: 'Supported currencies retrieved successfully',
        };
    }
    async getFeeEstimate(provider, amount, currency) {
        const feeEstimate = await this.walletsService.getFeeEstimate(provider, amount, currency);
        return {
            success: true,
            data: feeEstimate,
            message: 'Fee estimate retrieved successfully',
        };
    }
    async getRecommendedPaymentProvider(amount, currency) {
        const provider = await this.walletsService.getRecommendedPaymentProvider(amount, currency);
        return {
            success: true,
            data: provider,
            message: 'Recommended payment provider retrieved successfully',
        };
    }
    async convertCurrency(convertCurrencyDto) {
        const result = await this.walletsService.convertCurrency(convertCurrencyDto);
        return {
            success: true,
            data: result,
            message: 'Currency converted successfully',
        };
    }
    async getExchangeRates(getExchangeRateDto) {
        const rates = await this.walletsService.getExchangeRates(getExchangeRateDto);
        return {
            success: true,
            data: rates,
            message: 'Exchange rates retrieved successfully',
        };
    }
    async getSupportedCurrenciesList() {
        const currencies = this.walletsService.getSupportedCurrenciesList();
        return {
            success: true,
            data: currencies,
            message: 'Supported currencies retrieved successfully',
        };
    }
    async transferFundsCrossCurrency(fromWalletId, toWalletId, body) {
        const result = await this.walletsService.transferFundsCrossCurrency(fromWalletId, toWalletId, body.amount, body.description);
        return {
            success: true,
            data: result,
            message: 'Cross-currency transfer completed successfully',
        };
    }
    async getWalletBalanceInCurrency(walletId, targetCurrency) {
        const balance = await this.walletsService.getWalletBalanceInCurrency(walletId, targetCurrency);
        return {
            success: true,
            data: balance,
            message: 'Balance in target currency retrieved successfully',
        };
    }
    async getExchangeRateCacheStats() {
        const stats = this.walletsService.getExchangeRateCacheStats();
        return {
            success: true,
            data: stats,
            message: 'Cache statistics retrieved successfully',
        };
    }
    async clearExchangeRateCache() {
        this.walletsService.clearExchangeRateCache();
        return {
            success: true,
            message: 'Exchange rate cache cleared successfully',
        };
    }
};
exports.WalletsController = WalletsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new wallet' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Wallet created successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateWalletDto]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "createWallet", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet by user ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Query)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getWalletByUserId", null);
__decorate([
    (0, common_1.Get)(':id/balance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Balance retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getWalletBalance", null);
__decorate([
    (0, common_1.Post)(':id/add-funds'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Add funds to wallet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Funds added successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.AddFundsDto]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "addFunds", null);
__decorate([
    (0, common_1.Post)(':id/withdraw-funds'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Withdraw funds from wallet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Funds withdrawn successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.WithdrawFundsDto]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "withdrawFunds", null);
__decorate([
    (0, common_1.Post)(':id/transfer-funds'),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer funds between wallets' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Funds transferred successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.TransferFundsDto]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "transferFunds", null);
__decorate([
    (0, common_1.Get)(':id/transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction history' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction history retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getTransactionHistory", null);
__decorate([
    (0, common_1.Post)(':id/donate'),
    (0, swagger_1.ApiOperation)({ summary: 'Process donation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Donation processed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ProcessDonationDto]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "processDonation", null);
__decorate([
    (0, common_1.Post)(':id/process-fee'),
    (0, swagger_1.ApiOperation)({ summary: 'Process fee' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fee processed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ProcessFeeDto]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "processFee", null);
__decorate([
    (0, common_1.Get)('transactions/:transactionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getTransactionById", null);
__decorate([
    (0, common_1.Get)(':id/transactions/type/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transactions by type' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transactions retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getTransactionsByType", null);
__decorate([
    (0, common_1.Get)(':id/transaction-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction statistics retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getTransactionStats", null);
__decorate([
    (0, common_1.Put)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate wallet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet deactivated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "deactivateWallet", null);
__decorate([
    (0, common_1.Put)(':id/reactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Reactivate wallet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet reactivated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "reactivateWallet", null);
__decorate([
    (0, common_1.Post)(':id/payment/process'),
    (0, swagger_1.ApiOperation)({ summary: 'Process payment with wallet integration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment processed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_2.ProcessPaymentDto]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "processPayment", null);
__decorate([
    (0, common_1.Post)(':id/payment/refund'),
    (0, swagger_1.ApiOperation)({ summary: 'Refund payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment refunded successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_2.RefundPaymentDto]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "refundPayment", null);
__decorate([
    (0, common_1.Post)(':id/stripe/payment-intent'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Stripe payment intent for wallet' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Payment intent created successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "createStripePaymentIntent", null);
__decorate([
    (0, common_1.Post)(':id/paypal/payment-intent'),
    (0, swagger_1.ApiOperation)({ summary: 'Create PayPal payment intent for wallet' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Payment intent created successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "createPayPalPaymentIntent", null);
__decorate([
    (0, common_1.Post)(':id/stripe/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm Stripe payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment confirmed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "confirmStripePayment", null);
__decorate([
    (0, common_1.Post)(':id/paypal/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm PayPal payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment confirmed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "confirmPayPalPayment", null);
__decorate([
    (0, common_1.Post)(':id/stripe/withdraw'),
    (0, swagger_1.ApiOperation)({ summary: 'Withdraw funds via Stripe' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Withdrawal initiated successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "withdrawViaStripe", null);
__decorate([
    (0, common_1.Post)(':id/paypal/withdraw'),
    (0, swagger_1.ApiOperation)({ summary: 'Withdraw funds via PayPal' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Withdrawal initiated successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "withdrawViaPayPal", null);
__decorate([
    (0, common_1.Get)('currencies/:provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supported currencies for payment provider' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Supported currencies retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getSupportedCurrencies", null);
__decorate([
    (0, common_1.Get)('fees/:provider/estimate'),
    (0, swagger_1.ApiOperation)({ summary: 'Get fee estimate for payment provider' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Fee estimate retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Query)('amount')),
    __param(2, (0, common_1.Query)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getFeeEstimate", null);
__decorate([
    (0, common_1.Get)('payment-provider/recommended'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recommended payment provider' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recommended provider retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('amount')),
    __param(1, (0, common_1.Query)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getRecommendedPaymentProvider", null);
__decorate([
    (0, common_1.Post)('convert-currency'),
    (0, swagger_1.ApiOperation)({ summary: 'Convert currency between different currencies' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Currency converted successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ConvertCurrencyDto]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "convertCurrency", null);
__decorate([
    (0, common_1.Post)('exchange-rates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get exchange rates for specified currencies' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Exchange rates retrieved successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetExchangeRateDto]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getExchangeRates", null);
__decorate([
    (0, common_1.Get)('currencies/supported'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all supported currencies' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Supported currencies retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getSupportedCurrenciesList", null);
__decorate([
    (0, common_1.Post)(':id/transfer-cross-currency/:toWalletId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Transfer funds between wallets with different currencies',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cross-currency transfer completed successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('toWalletId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "transferFundsCrossCurrency", null);
__decorate([
    (0, common_1.Get)(':id/balance/:currency'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet balance in different currency' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Balance in target currency retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getWalletBalanceInCurrency", null);
__decorate([
    (0, common_1.Get)('exchange-rates/cache/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get exchange rate cache statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cache statistics retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getExchangeRateCacheStats", null);
__decorate([
    (0, common_1.Delete)('exchange-rates/cache'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear exchange rate cache' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cache cleared successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "clearExchangeRateCache", null);
exports.WalletsController = WalletsController = __decorate([
    (0, swagger_1.ApiTags)('wallets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('wallets'),
    __metadata("design:paramtypes", [wallets_service_1.WalletsService])
], WalletsController);
//# sourceMappingURL=wallets.controller.js.map