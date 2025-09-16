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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const create_payment_intent_dto_1 = require("./dto/create-payment-intent.dto");
const confirm_payment_dto_1 = require("./dto/confirm-payment.dto");
const create_payout_dto_1 = require("./dto/create-payout.dto");
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async createStripePaymentIntent(createPaymentIntentDto) {
        return await this.paymentsService.createPaymentIntent(payments_service_1.PaymentProvider.STRIPE, createPaymentIntentDto);
    }
    async createPayPalPaymentIntent(createPaymentIntentDto) {
        return await this.paymentsService.createPaymentIntent(payments_service_1.PaymentProvider.PAYPAL, createPaymentIntentDto);
    }
    async confirmStripePayment(confirmPaymentDto) {
        return await this.paymentsService.confirmPayment(payments_service_1.PaymentProvider.STRIPE, confirmPaymentDto);
    }
    async confirmPayPalPayment(confirmPaymentDto) {
        return await this.paymentsService.confirmPayment(payments_service_1.PaymentProvider.PAYPAL, confirmPaymentDto);
    }
    async refundStripePayment(paymentIntentId, body) {
        return await this.paymentsService.refundPayment(payments_service_1.PaymentProvider.STRIPE, paymentIntentId, body.amount);
    }
    async refundPayPalPayment(paymentIntentId, body) {
        return await this.paymentsService.refundPayment(payments_service_1.PaymentProvider.PAYPAL, paymentIntentId, body.amount);
    }
    async getStripePaymentIntent(paymentIntentId) {
        return await this.paymentsService.getPaymentIntent(payments_service_1.PaymentProvider.STRIPE, paymentIntentId);
    }
    async getPayPalPaymentIntent(paymentIntentId) {
        return await this.paymentsService.getPaymentIntent(payments_service_1.PaymentProvider.PAYPAL, paymentIntentId);
    }
    async createStripePayout(createPayoutDto) {
        return await this.paymentsService.createPayout(payments_service_1.PaymentProvider.STRIPE, createPayoutDto);
    }
    async createPayPalPayout(createPayoutDto) {
        return await this.paymentsService.createPayout(payments_service_1.PaymentProvider.PAYPAL, createPayoutDto);
    }
    async handleStripeWebhook(request, signature) {
        const event = request.body;
        await this.paymentsService.handleWebhook(payments_service_1.PaymentProvider.STRIPE, event);
        return { received: true };
    }
    async handlePayPalWebhook(request, headers) {
        const event = request.body;
        await this.paymentsService.handleWebhook(payments_service_1.PaymentProvider.PAYPAL, event);
        return { received: true };
    }
    async getSupportedCurrencies(provider) {
        const paymentProvider = provider.toLowerCase();
        if (!Object.values(payments_service_1.PaymentProvider).includes(paymentProvider)) {
            throw new common_1.BadRequestException(`Unsupported payment provider: ${provider}`);
        }
        return {
            provider: paymentProvider,
            currencies: this.paymentsService.getSupportedCurrencies(paymentProvider),
        };
    }
    async getFeeEstimate(provider, body) {
        const paymentProvider = provider.toLowerCase();
        if (!Object.values(payments_service_1.PaymentProvider).includes(paymentProvider)) {
            throw new common_1.BadRequestException(`Unsupported payment provider: ${provider}`);
        }
        return await this.paymentsService.getFeeEstimate(paymentProvider, body.amount, body.currency);
    }
    async getRecommendedProvider(body) {
        return await this.paymentsService.getRecommendedProvider(body.amount, body.currency);
    }
    async createStripePaymentMethod(paymentMethodData) {
        return await this.paymentsService.createStripePaymentMethod(paymentMethodData);
    }
    async createStripeCustomer(body) {
        const customerId = await this.paymentsService.createStripeCustomer(body.email, body.name);
        return { customerId };
    }
    async attachStripePaymentMethod(body) {
        await this.paymentsService.attachStripePaymentMethod(body.paymentMethodId, body.customerId);
        return { success: true };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('stripe/payment-intent'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a Stripe payment intent' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Payment intent created successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_intent_dto_1.CreatePaymentIntentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createStripePaymentIntent", null);
__decorate([
    (0, common_1.Post)('paypal/payment-intent'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a PayPal payment intent' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Payment intent created successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_intent_dto_1.CreatePaymentIntentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPayPalPaymentIntent", null);
__decorate([
    (0, common_1.Post)('stripe/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm a Stripe payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment confirmed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirm_payment_dto_1.ConfirmPaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmStripePayment", null);
__decorate([
    (0, common_1.Post)('paypal/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm a PayPal payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment confirmed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirm_payment_dto_1.ConfirmPaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmPayPalPayment", null);
__decorate([
    (0, common_1.Post)('stripe/refund/:paymentIntentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Refund a Stripe payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment refunded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Param)('paymentIntentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "refundStripePayment", null);
__decorate([
    (0, common_1.Post)('paypal/refund/:paymentIntentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Refund a PayPal payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment refunded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Param)('paymentIntentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "refundPayPalPayment", null);
__decorate([
    (0, common_1.Get)('stripe/payment-intent/:paymentIntentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a Stripe payment intent' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment intent retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment intent not found' }),
    __param(0, (0, common_1.Param)('paymentIntentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getStripePaymentIntent", null);
__decorate([
    (0, common_1.Get)('paypal/payment-intent/:paymentIntentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a PayPal payment intent' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment intent retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment intent not found' }),
    __param(0, (0, common_1.Param)('paymentIntentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPayPalPaymentIntent", null);
__decorate([
    (0, common_1.Post)('stripe/payout'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a Stripe payout' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payout created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payout_dto_1.CreatePayoutDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createStripePayout", null);
__decorate([
    (0, common_1.Post)('paypal/payout'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a PayPal payout' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payout created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payout_dto_1.CreatePayoutDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPayPalPayout", null);
__decorate([
    (0, common_1.Post)('stripe/webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Stripe webhook events' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleStripeWebhook", null);
__decorate([
    (0, common_1.Post)('paypal/webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle PayPal webhook events' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handlePayPalWebhook", null);
__decorate([
    (0, common_1.Get)('providers/:provider/currencies'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supported currencies for a payment provider' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Supported currencies retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getSupportedCurrencies", null);
__decorate([
    (0, common_1.Get)('providers/:provider/fee-estimate'),
    (0, swagger_1.ApiOperation)({ summary: 'Get fee estimate for a payment provider' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Fee estimate retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getFeeEstimate", null);
__decorate([
    (0, common_1.Get)('recommended-provider'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get recommended payment provider for amount and currency',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recommended provider retrieved successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getRecommendedProvider", null);
__decorate([
    (0, common_1.Post)('stripe/payment-method'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a Stripe payment method' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Payment method created successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createStripePaymentMethod", null);
__decorate([
    (0, common_1.Post)('stripe/customer'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a Stripe customer' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Customer created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createStripeCustomer", null);
__decorate([
    (0, common_1.Post)('stripe/attach-payment-method'),
    (0, swagger_1.ApiOperation)({ summary: 'Attach a payment method to a Stripe customer' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment method attached successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "attachStripePaymentMethod", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map