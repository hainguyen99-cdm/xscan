import { WalletsService } from './wallets.service';
import { CreateWalletDto, AddFundsDto, WithdrawFundsDto, TransferFundsDto, ProcessDonationDto, ProcessFeeDto, ConvertCurrencyDto, GetExchangeRateDto } from './dto';
import { PaymentProvider } from '../payments/payments.service';
import { ProcessPaymentDto, RefundPaymentDto } from '../payments/dto';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    createWallet(req: any, createWalletDto: CreateWalletDto): Promise<{
        success: boolean;
        data: import(".").WalletDocument;
        message: string;
    }>;
    getWallet(id: string): Promise<{
        success: boolean;
        data: import(".").WalletDocument;
        message: string;
    }>;
    getWalletByUserId(req: any, userId: string, currency?: string): Promise<{
        success: boolean;
        data: import(".").WalletDocument;
        message: string;
    }>;
    getWalletBalance(req: any, id: string): Promise<{
        success: boolean;
        data: {
            balance: number;
            currency: string;
        };
        message: string;
    }>;
    addFunds(req: any, id: string, addFundsDto: AddFundsDto): Promise<{
        success: boolean;
        data: import(".").WalletDocument;
        message: string;
    }>;
    withdrawFunds(req: any, id: string, withdrawFundsDto: WithdrawFundsDto): Promise<{
        success: boolean;
        data: import(".").WalletDocument;
        message: string;
    }>;
    transferFunds(id: string, transferFundsDto: TransferFundsDto): Promise<{
        success: boolean;
        data: {
            fromWallet: import(".").WalletDocument;
            toWallet: import(".").WalletDocument;
        };
        message: string;
    }>;
    getTransactionHistory(req: any, id: string, limit?: number, offset?: number): Promise<{
        success: boolean;
        data: import(".").TransactionDocument[];
        message: string;
    }>;
    processDonation(id: string, processDonationDto: ProcessDonationDto): Promise<{
        success: boolean;
        data: {
            fromWallet: import(".").WalletDocument;
            toWallet: import(".").WalletDocument;
            transaction: import(".").TransactionDocument;
        };
        message: string;
    }>;
    processFee(id: string, processFeeDto: ProcessFeeDto): Promise<{
        success: boolean;
        data: {
            wallet: import(".").WalletDocument;
            transaction: import(".").TransactionDocument;
        };
        message: string;
    }>;
    getTransactionById(transactionId: string): Promise<{
        success: boolean;
        data: import(".").TransactionDocument;
        message: string;
    }>;
    getTransactionsByType(id: string, type: string, limit?: number, offset?: number): Promise<{
        success: boolean;
        data: import(".").TransactionDocument[];
        message: string;
    }>;
    getTransactionStats(id: string): Promise<{
        success: boolean;
        data: {
            totalDeposits: number;
            totalWithdrawals: number;
            totalFees: number;
            totalDonations: number;
            totalTransfers: number;
            transactionCount: number;
        };
        message: string;
    }>;
    deactivateWallet(id: string): Promise<{
        success: boolean;
        data: import(".").WalletDocument;
        message: string;
    }>;
    reactivateWallet(id: string): Promise<{
        success: boolean;
        data: import(".").WalletDocument;
        message: string;
    }>;
    processPayment(id: string, processPaymentDto: ProcessPaymentDto): Promise<{
        success: boolean;
        data: import(".").WalletDocument | {
            fromWallet: import(".").WalletDocument;
            toWallet: import(".").WalletDocument;
        };
        message: string;
    }>;
    refundPayment(id: string, refundPaymentDto: RefundPaymentDto): Promise<{
        success: boolean;
        data: {
            wallet: import(".").WalletDocument;
            refundTransaction: import("mongoose").Document<unknown, {}, import(".").TransactionDocument, {}, {}> & import(".").Transaction & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            };
        };
        message: string;
    }>;
    createStripePaymentIntent(id: string, body: {
        amount: number;
        metadata?: Record<string, any>;
    }): Promise<{
        success: boolean;
        data: import("../payments/interfaces/payment-gateway.interface").PaymentIntent;
        message: string;
    }>;
    createPayPalPaymentIntent(id: string, body: {
        amount: number;
        metadata?: Record<string, any>;
    }): Promise<{
        success: boolean;
        data: import("../payments/interfaces/payment-gateway.interface").PaymentIntent;
        message: string;
    }>;
    confirmStripePayment(id: string, body: {
        paymentIntentId: string;
    }): Promise<{
        success: boolean;
        data: {
            paymentResult: import("../payments/interfaces/payment-gateway.interface").PaymentIntent;
            wallet: import(".").WalletDocument;
            transaction: import("mongoose").Document<unknown, {}, import(".").TransactionDocument, {}, {}> & import(".").Transaction & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            };
        };
        message: string;
    }>;
    confirmPayPalPayment(id: string, body: {
        paymentIntentId: string;
    }): Promise<{
        success: boolean;
        data: {
            paymentResult: import("../payments/interfaces/payment-gateway.interface").PaymentIntent;
            wallet: import(".").WalletDocument;
            transaction: import("mongoose").Document<unknown, {}, import(".").TransactionDocument, {}, {}> & import(".").Transaction & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            };
        };
        message: string;
    }>;
    withdrawViaStripe(id: string, body: {
        amount: number;
        destination: string;
        description?: string;
    }): Promise<{
        success: boolean;
        data: {
            payoutResult: any;
            wallet: import(".").WalletDocument;
            transaction: import("mongoose").Document<unknown, {}, import(".").TransactionDocument, {}, {}> & import(".").Transaction & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            };
        };
        message: string;
    }>;
    withdrawViaPayPal(id: string, body: {
        amount: number;
        destination: string;
        description?: string;
    }): Promise<{
        success: boolean;
        data: {
            payoutResult: any;
            wallet: import(".").WalletDocument;
            transaction: import("mongoose").Document<unknown, {}, import(".").TransactionDocument, {}, {}> & import(".").Transaction & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            };
        };
        message: string;
    }>;
    getSupportedCurrencies(provider: string): Promise<{
        success: boolean;
        data: string[];
        message: string;
    }>;
    getFeeEstimate(provider: string, amount: number, currency: string): Promise<{
        success: boolean;
        data: {
            provider: PaymentProvider;
            amount: number;
            currency: string;
            fee: number;
            totalAmount: number;
        };
        message: string;
    }>;
    getRecommendedPaymentProvider(amount: number, currency: string): Promise<{
        success: boolean;
        data: PaymentProvider;
        message: string;
    }>;
    convertCurrency(convertCurrencyDto: ConvertCurrencyDto): Promise<{
        success: boolean;
        data: {
            description: string;
            timestamp: Date;
            amount: number;
            rate: number;
            fromCurrency: string;
            toCurrency: string;
        };
        message: string;
    }>;
    getExchangeRates(getExchangeRateDto: GetExchangeRateDto): Promise<{
        success: boolean;
        data: import("../common/services/exchange-rate.service").ExchangeRate[];
        message: string;
    }>;
    getSupportedCurrenciesList(): Promise<{
        success: boolean;
        data: import("../common/services/exchange-rate.service").CurrencyInfo[];
        message: string;
    }>;
    transferFundsCrossCurrency(fromWalletId: string, toWalletId: string, body: {
        amount: number;
        description?: string;
    }): Promise<{
        success: boolean;
        data: {
            fromWallet: import(".").WalletDocument;
            toWallet: import(".").WalletDocument;
            conversion: any;
        };
        message: string;
    }>;
    getWalletBalanceInCurrency(walletId: string, targetCurrency: string): Promise<{
        success: boolean;
        data: {
            balance: number;
            currency: string;
            convertedBalance: number;
            targetCurrency: string;
            rate: number;
        };
        message: string;
    }>;
    getExchangeRateCacheStats(): Promise<{
        success: boolean;
        data: {
            size: number;
            entries: string[];
        };
        message: string;
    }>;
    clearExchangeRateCache(): Promise<{
        success: boolean;
        message: string;
    }>;
}
