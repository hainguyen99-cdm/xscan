import { Model, Types } from 'mongoose';
import { WalletDocument } from './schemas/wallet.schema';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { AddFundsDto } from './dto/add-funds.dto';
import { WithdrawFundsDto } from './dto/withdraw-funds.dto';
import { TransferFundsDto } from './dto/transfer-funds.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { GetExchangeRateDto } from './dto/exchange-rate.dto';
import { PaymentsService, PaymentProvider } from '../payments/payments.service';
import { ProcessPaymentDto } from '../payments/dto/process-payment.dto';
import { RefundPaymentDto } from '../payments/dto/refund-payment.dto';
import { FeeCalculationService, FeeType } from '../common/services/fee-calculation.service';
import { ExchangeRateService, ExchangeRate, CurrencyInfo } from '../common/services/exchange-rate.service';
export declare class WalletsService {
    private walletModel;
    private transactionModel;
    private readonly paymentsService;
    private readonly feeCalculationService;
    private readonly exchangeRateService;
    constructor(walletModel: Model<WalletDocument>, transactionModel: Model<TransactionDocument>, paymentsService: PaymentsService, feeCalculationService: FeeCalculationService, exchangeRateService: ExchangeRateService);
    createWallet(userId: string, createWalletDto: CreateWalletDto): Promise<WalletDocument>;
    getWallet(walletId: string): Promise<WalletDocument>;
    getWalletByUserId(userId: string, currency?: string): Promise<WalletDocument>;
    getWalletByUserIdForUser(userId: string, requestingUserId: string, currency?: string): Promise<WalletDocument>;
    validateWalletOwnership(walletId: string, userId: string): Promise<WalletDocument>;
    getWalletBalance(walletId: string, userId?: string): Promise<{
        balance: number;
        currency: string;
    }>;
    addFunds(walletId: string, addFundsDto: AddFundsDto, userId?: string): Promise<WalletDocument>;
    withdrawFunds(walletId: string, withdrawFundsDto: WithdrawFundsDto, userId?: string): Promise<WalletDocument>;
    transferFunds(fromWalletId: string, transferFundsDto: TransferFundsDto): Promise<{
        fromWallet: WalletDocument;
        toWallet: WalletDocument;
    }>;
    getTransactionHistory(walletId: string, limit?: number, offset?: number, userId?: string): Promise<TransactionDocument[]>;
    deactivateWallet(walletId: string): Promise<WalletDocument>;
    reactivateWallet(walletId: string): Promise<WalletDocument>;
    processDonation(fromWalletId: string, toUserId: string, amount: number, description?: string): Promise<{
        fromWallet: WalletDocument;
        toWallet: WalletDocument;
        transaction: TransactionDocument;
    }>;
    processFee(walletId: string, amount: number, description?: string, feeType?: string): Promise<{
        wallet: WalletDocument;
        transaction: TransactionDocument;
    }>;
    getTransactionById(transactionId: string): Promise<TransactionDocument>;
    getTransactionsByType(walletId: string, type: string, limit?: number, offset?: number): Promise<TransactionDocument[]>;
    getTransactionStats(walletId: string): Promise<{
        totalDeposits: number;
        totalWithdrawals: number;
        totalFees: number;
        totalDonations: number;
        totalTransfers: number;
        transactionCount: number;
    }>;
    processPayment(walletId: string, processPaymentDto: ProcessPaymentDto): Promise<WalletDocument | {
        fromWallet: WalletDocument;
        toWallet: WalletDocument;
    }>;
    refundPayment(walletId: string, refundPaymentDto: RefundPaymentDto): Promise<{
        wallet: WalletDocument;
        refundTransaction: import("mongoose").Document<unknown, {}, TransactionDocument, {}, {}> & Transaction & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    createPaymentIntent(walletId: string, provider: PaymentProvider, amount: number, metadata?: Record<string, any>): Promise<import("../payments/interfaces/payment-gateway.interface").PaymentIntent>;
    confirmPayment(walletId: string, provider: PaymentProvider, paymentIntentId: string): Promise<{
        paymentResult: import("../payments/interfaces/payment-gateway.interface").PaymentIntent;
        wallet: WalletDocument;
        transaction: import("mongoose").Document<unknown, {}, TransactionDocument, {}, {}> & Transaction & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    withdrawViaPaymentProvider(walletId: string, provider: PaymentProvider, amount: number, destination: string, description?: string): Promise<{
        payoutResult: any;
        wallet: WalletDocument;
        transaction: import("mongoose").Document<unknown, {}, TransactionDocument, {}, {}> & Transaction & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    getFeeEstimate(provider: string, amount: number, currency: string): Promise<{
        provider: PaymentProvider;
        amount: number;
        currency: string;
        fee: number;
        totalAmount: number;
    }>;
    getInternalFeeEstimate(amount: number, feeType: FeeType, currency?: string, customFeeStructure?: any): Promise<{
        minFee: number;
        maxFee: number;
        estimatedFee: number;
        currency: string;
    }>;
    getRecommendedPaymentProvider(amount: number, currency: string): Promise<PaymentProvider>;
    getSupportedCurrencies(provider: string): Promise<string[]>;
    handlePaymentWebhook(provider: PaymentProvider, event: any): Promise<void>;
    private handlePaymentSuccess;
    private handlePaymentFailure;
    private handlePayoutSuccess;
    private handlePayoutFailure;
    convertCurrency(convertCurrencyDto: ConvertCurrencyDto): Promise<{
        description: string;
        timestamp: Date;
        amount: number;
        rate: number;
        fromCurrency: string;
        toCurrency: string;
    }>;
    getExchangeRates(getExchangeRateDto: GetExchangeRateDto): Promise<ExchangeRate[]>;
    getSupportedCurrenciesList(): CurrencyInfo[];
    transferFundsCrossCurrency(fromWalletId: string, toWalletId: string, amount: number, description?: string): Promise<{
        fromWallet: WalletDocument;
        toWallet: WalletDocument;
        conversion: any;
    }>;
    getWalletBalanceInCurrency(walletId: string, targetCurrency: string): Promise<{
        balance: number;
        currency: string;
        convertedBalance: number;
        targetCurrency: string;
        rate: number;
    }>;
    getExchangeRateCacheStats(): {
        size: number;
        entries: string[];
    };
    clearExchangeRateCache(): void;
}
