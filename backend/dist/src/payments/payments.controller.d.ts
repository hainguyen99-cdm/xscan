import { RawBodyRequest } from '@nestjs/common';
import { PaymentsService, PaymentProvider } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { Request } from 'express';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createStripePaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<import("./interfaces/payment-gateway.interface").PaymentIntent>;
    createPayPalPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<import("./interfaces/payment-gateway.interface").PaymentIntent>;
    confirmStripePayment(confirmPaymentDto: ConfirmPaymentDto): Promise<import("./interfaces/payment-gateway.interface").PaymentIntent>;
    confirmPayPalPayment(confirmPaymentDto: ConfirmPaymentDto): Promise<import("./interfaces/payment-gateway.interface").PaymentIntent>;
    refundStripePayment(paymentIntentId: string, body: {
        amount?: number;
    }): Promise<import("./interfaces/payment-gateway.interface").PaymentIntent>;
    refundPayPalPayment(paymentIntentId: string, body: {
        amount?: number;
    }): Promise<import("./interfaces/payment-gateway.interface").PaymentIntent>;
    getStripePaymentIntent(paymentIntentId: string): Promise<import("./interfaces/payment-gateway.interface").PaymentIntent>;
    getPayPalPaymentIntent(paymentIntentId: string): Promise<import("./interfaces/payment-gateway.interface").PaymentIntent>;
    createStripePayout(createPayoutDto: CreatePayoutDto): Promise<any>;
    createPayPalPayout(createPayoutDto: CreatePayoutDto): Promise<any>;
    handleStripeWebhook(request: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
    handlePayPalWebhook(request: Request, headers: Record<string, string>): Promise<{
        received: boolean;
    }>;
    getSupportedCurrencies(provider: string): Promise<{
        provider: PaymentProvider;
        currencies: string[];
    }>;
    getFeeEstimate(provider: string, body: {
        amount: number;
        currency: string;
    }): Promise<{
        provider: PaymentProvider;
        amount: number;
        currency: string;
        fee: number;
        totalAmount: number;
    }>;
    getRecommendedProvider(body: {
        amount: number;
        currency: string;
    }): Promise<PaymentProvider>;
    createStripePaymentMethod(paymentMethodData: any): Promise<import("./interfaces/payment-gateway.interface").PaymentMethod>;
    createStripeCustomer(body: {
        email: string;
        name?: string;
    }): Promise<{
        customerId: string;
    }>;
    attachStripePaymentMethod(body: {
        paymentMethodId: string;
        customerId: string;
    }): Promise<{
        success: boolean;
    }>;
}
