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
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = require("stripe");
const config_service_1 = require("../config/config.service");
let StripeService = StripeService_1 = class StripeService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StripeService_1.name);
        this.stripe = null;
        this.isEnabled = false;
        this.initializeStripe();
    }
    initializeStripe() {
        const secretKey = this.configService.stripeSecretKey;
        if (secretKey && secretKey.trim() !== '') {
            try {
                this.stripe = new stripe_1.default(secretKey, {
                    apiVersion: '2025-07-30.basil',
                });
                this.isEnabled = true;
                this.logger.log('Stripe service initialized successfully');
            }
            catch (error) {
                this.logger.warn('Failed to initialize Stripe service:', error.message);
                this.isEnabled = false;
            }
        }
        else {
            this.logger.warn('Stripe secret key not provided, Stripe service will be disabled');
            this.isEnabled = false;
        }
    }
    checkStripeEnabled() {
        if (!this.isEnabled || !this.stripe) {
            throw new common_1.BadRequestException('Stripe service is not configured or disabled');
        }
    }
    async createPaymentIntent(amount, currency, metadata) {
        this.checkStripeEnabled();
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount,
                currency: currency.toLowerCase(),
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                clientSecret: paymentIntent.client_secret,
                metadata: paymentIntent.metadata,
            };
        }
        catch (error) {
            this.logger.error('Error creating Stripe payment intent:', error);
            throw new common_1.BadRequestException('Failed to create payment intent');
        }
    }
    async confirmPayment(paymentIntentId, paymentMethodId) {
        this.checkStripeEnabled();
        try {
            let paymentIntent;
            if (paymentMethodId) {
                paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
                    payment_method: paymentMethodId,
                });
            }
            else {
                paymentIntent =
                    await this.stripe.paymentIntents.retrieve(paymentIntentId);
            }
            return {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                clientSecret: paymentIntent.client_secret,
                metadata: paymentIntent.metadata,
            };
        }
        catch (error) {
            this.logger.error('Error confirming Stripe payment:', error);
            throw new common_1.BadRequestException('Failed to confirm payment');
        }
    }
    async refundPayment(paymentIntentId, amount) {
        this.checkStripeEnabled();
        try {
            const refundParams = {
                payment_intent: paymentIntentId,
            };
            if (amount) {
                refundParams.amount = amount;
            }
            const refund = await this.stripe.refunds.create(refundParams);
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            return {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                metadata: paymentIntent.metadata,
            };
        }
        catch (error) {
            this.logger.error('Error refunding Stripe payment:', error);
            throw new common_1.BadRequestException('Failed to refund payment');
        }
    }
    async getPaymentIntent(paymentIntentId) {
        this.checkStripeEnabled();
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            return {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                clientSecret: paymentIntent.client_secret,
                metadata: paymentIntent.metadata,
            };
        }
        catch (error) {
            this.logger.error('Error retrieving Stripe payment intent:', error);
            throw new common_1.BadRequestException('Failed to retrieve payment intent');
        }
    }
    async createPayout(amount, currency, destination, metadata) {
        this.checkStripeEnabled();
        try {
            const payout = await this.stripe.transfers.create({
                amount,
                currency: currency.toLowerCase(),
                destination,
                metadata,
            });
            return {
                id: payout.id,
                amount: payout.amount,
                currency: payout.currency,
                status: 'pending',
                destination: payout.destination,
                metadata: payout.metadata,
            };
        }
        catch (error) {
            this.logger.error('Error creating Stripe payout:', error);
            throw new common_1.BadRequestException('Failed to create payout');
        }
    }
    async handleWebhook(event) {
        this.checkStripeEnabled();
        try {
            const stripeEvent = event;
            switch (stripeEvent.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSucceeded(stripeEvent.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailed(stripeEvent.data.object);
                    break;
                case 'transfer.created':
                    await this.handleTransferCreated(stripeEvent.data.object);
                    break;
                default:
                    this.logger.log(`Unhandled Stripe event type: ${stripeEvent.type}`);
            }
        }
        catch (error) {
            this.logger.error('Error handling Stripe webhook:', error);
            throw new common_1.BadRequestException('Failed to handle webhook');
        }
    }
    async handlePaymentSucceeded(paymentIntent) {
        this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
    }
    async handlePaymentFailed(paymentIntent) {
        this.logger.log(`Payment failed: ${paymentIntent.id}`);
    }
    async handleTransferCreated(transfer) {
        this.logger.log(`Transfer created: ${transfer.id}`);
    }
    async handleTransferFailed(transfer) {
        this.logger.log(`Transfer failed: ${transfer.id}`);
    }
    async createPaymentMethod(paymentMethodData) {
        this.checkStripeEnabled();
        try {
            const paymentMethod = await this.stripe.paymentMethods.create(paymentMethodData);
            return {
                id: paymentMethod.id,
                type: paymentMethod.type,
                last4: paymentMethod.card?.last4,
                brand: paymentMethod.card?.brand,
                expMonth: paymentMethod.card?.exp_month,
                expYear: paymentMethod.card?.exp_year,
                country: paymentMethod.card?.country,
            };
        }
        catch (error) {
            this.logger.error('Error creating Stripe payment method:', error);
            throw new common_1.BadRequestException('Failed to create payment method');
        }
    }
    async attachPaymentMethod(paymentMethodId, customerId) {
        this.checkStripeEnabled();
        try {
            await this.stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });
        }
        catch (error) {
            this.logger.error('Error attaching Stripe payment method:', error);
            throw new common_1.BadRequestException('Failed to attach payment method');
        }
    }
    async createCustomer(email, name) {
        this.checkStripeEnabled();
        try {
            const customer = await this.stripe.customers.create({
                email,
                name,
            });
            return customer.id;
        }
        catch (error) {
            this.logger.error('Error creating Stripe customer:', error);
            throw new common_1.BadRequestException('Failed to create customer');
        }
    }
    isStripeEnabled() {
        return this.isEnabled;
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map