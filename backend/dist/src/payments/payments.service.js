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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = exports.PaymentProvider = void 0;
const common_1 = require("@nestjs/common");
const stripe_service_1 = require("./stripe.service");
const paypal_service_1 = require("./paypal.service");
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["STRIPE"] = "stripe";
    PaymentProvider["PAYPAL"] = "paypal";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(stripeService, paypalService) {
        this.stripeService = stripeService;
        this.paypalService = paypalService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    getPaymentGateway(provider) {
        switch (provider) {
            case PaymentProvider.STRIPE:
                if (!this.stripeService.isStripeEnabled()) {
                    throw new common_1.BadRequestException('Stripe service is not configured or disabled. Please configure STRIPE_SECRET_KEY in your environment variables.');
                }
                return this.stripeService;
            case PaymentProvider.PAYPAL:
                if (!this.paypalService.isPayPalEnabled()) {
                    throw new common_1.BadRequestException('PayPal service is not configured or disabled. Please configure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your environment variables.');
                }
                return this.paypalService;
            default:
                throw new common_1.BadRequestException(`Unsupported payment provider: ${provider}`);
        }
    }
    async createPaymentIntent(provider, createPaymentIntentDto) {
        this.logger.log(`Creating payment intent with ${provider} for amount: ${createPaymentIntentDto.amount}`);
        const gateway = this.getPaymentGateway(provider);
        return await gateway.createPaymentIntent(createPaymentIntentDto.amount, createPaymentIntentDto.currency, createPaymentIntentDto.metadata);
    }
    async confirmPayment(provider, confirmPaymentDto) {
        this.logger.log(`Confirming payment with ${provider}: ${confirmPaymentDto.paymentIntentId}`);
        const gateway = this.getPaymentGateway(provider);
        return await gateway.confirmPayment(confirmPaymentDto.paymentIntentId, confirmPaymentDto.paymentMethodId);
    }
    async refundPayment(provider, paymentIntentId, amount) {
        this.logger.log(`Refunding payment with ${provider}: ${paymentIntentId}`);
        const gateway = this.getPaymentGateway(provider);
        return await gateway.refundPayment(paymentIntentId, amount);
    }
    async getPaymentIntent(provider, paymentIntentId) {
        this.logger.log(`Getting payment intent with ${provider}: ${paymentIntentId}`);
        const gateway = this.getPaymentGateway(provider);
        return await gateway.getPaymentIntent(paymentIntentId);
    }
    async createPayout(provider, createPayoutDto) {
        this.logger.log(`Creating payout with ${provider} for amount: ${createPayoutDto.amount}`);
        const gateway = this.getPaymentGateway(provider);
        return await gateway.createPayout(createPayoutDto.amount, createPayoutDto.currency, createPayoutDto.destination, createPayoutDto.metadata);
    }
    async handleWebhook(provider, event) {
        this.logger.log(`Handling webhook from ${provider}: ${event.type}`);
        switch (provider) {
            case PaymentProvider.STRIPE:
                await this.stripeService.handleWebhook(event);
                break;
            case PaymentProvider.PAYPAL:
                await this.paypalService.handleWebhook(event);
                break;
            default:
                throw new common_1.BadRequestException(`Unsupported payment provider: ${provider}`);
        }
    }
    async createStripePaymentMethod(paymentMethodData) {
        if (!this.stripeService.isStripeEnabled()) {
            throw new common_1.BadRequestException('Stripe service is not configured or disabled. Please configure STRIPE_SECRET_KEY in your environment variables.');
        }
        return await this.stripeService.createPaymentMethod(paymentMethodData);
    }
    async attachStripePaymentMethod(paymentMethodId, customerId) {
        if (!this.stripeService.isStripeEnabled()) {
            throw new common_1.BadRequestException('Stripe service is not configured or disabled. Please configure STRIPE_SECRET_KEY in your environment variables.');
        }
        await this.stripeService.attachPaymentMethod(paymentMethodId, customerId);
    }
    async createStripeCustomer(email, name) {
        if (!this.stripeService.isStripeEnabled()) {
            throw new common_1.BadRequestException('Stripe service is not configured or disabled. Please configure STRIPE_SECRET_KEY in your environment variables.');
        }
        return await this.stripeService.createCustomer(email, name);
    }
    async verifyPayPalWebhookSignature(body, headers, webhookId) {
        return await this.paypalService.verifyWebhookSignature(body, headers, webhookId);
    }
    async getPayPalAccessToken() {
        return await this.paypalService.getAccessToken();
    }
    async getRecommendedProvider(amount, currency) {
        const supportedCurrencies = {
            [PaymentProvider.STRIPE]: ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy'],
            [PaymentProvider.PAYPAL]: [
                'usd',
                'eur',
                'gbp',
                'cad',
                'aud',
                'jpy',
                'mxn',
                'brl',
            ],
        };
        const currencyLower = currency.toLowerCase();
        const isStripeEnabled = this.stripeService.isStripeEnabled();
        const isPayPalEnabled = this.paypalService.isPayPalEnabled();
        if (supportedCurrencies[PaymentProvider.PAYPAL].includes(currencyLower) &&
            isPayPalEnabled) {
            return PaymentProvider.PAYPAL;
        }
        else if (supportedCurrencies[PaymentProvider.STRIPE].includes(currencyLower) &&
            isStripeEnabled) {
            return PaymentProvider.STRIPE;
        }
        throw new common_1.BadRequestException(`No payment provider available for currency: ${currency}. Both Stripe and PayPal are either disabled or don't support this currency.`);
    }
    getSupportedCurrencies(provider) {
        switch (provider) {
            case PaymentProvider.STRIPE:
                return this.stripeService.isStripeEnabled()
                    ? ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy']
                    : [];
            case PaymentProvider.PAYPAL:
                return this.paypalService.isPayPalEnabled()
                    ? ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'mxn', 'brl']
                    : [];
            default:
                return [];
        }
    }
    async getFeeEstimate(provider, amount, currency) {
        let fee = 0;
        switch (provider) {
            case PaymentProvider.STRIPE:
                fee = Math.round(amount * 0.029 + 30);
                break;
            case PaymentProvider.PAYPAL:
                const fixedFee = currency.toLowerCase() === 'usd' ? 30 : 35;
                fee = Math.round(amount * 0.029 + fixedFee);
                break;
        }
        return {
            provider,
            amount,
            currency,
            fee,
            totalAmount: amount + fee,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stripe_service_1.StripeService,
        paypal_service_1.PaypalService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map