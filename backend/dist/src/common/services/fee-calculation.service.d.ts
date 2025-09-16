import { ConfigService } from '../../config/config.service';
export interface FeeStructure {
    percentage: number;
    fixedAmount: number;
    minimumFee: number;
    maximumFee?: number;
    currency: string;
}
export interface FeeCalculationResult {
    baseAmount: number;
    feeAmount: number;
    totalAmount: number;
    feeBreakdown: {
        percentageFee: number;
        fixedFee: number;
        adjustedFee: number;
    };
    currency: string;
    feeType: string;
    description: string;
}
export interface FeeConfig {
    transactionFee: FeeStructure;
    withdrawalFee: FeeStructure;
    depositFee: FeeStructure;
    transferFee: FeeStructure;
    donationFee: FeeStructure;
    monthlyMaintenanceFee: FeeStructure;
    currencyConversionFee: FeeStructure;
}
export declare enum FeeType {
    TRANSACTION = "transaction",
    WITHDRAWAL = "withdrawal",
    DEPOSIT = "deposit",
    TRANSFER = "transfer",
    DONATION = "donation",
    MONTHLY_MAINTENANCE = "monthly_maintenance",
    CURRENCY_CONVERSION = "currency_conversion"
}
export declare class FeeCalculationService {
    private readonly configService;
    private readonly logger;
    private readonly feeConfig;
    constructor(configService: ConfigService);
    private initializeFeeConfig;
    calculateFee(amount: number, feeType: FeeType, currency?: string, customFeeStructure?: Partial<FeeStructure>): FeeCalculationResult;
    private calculateFeeBreakdown;
    private getFeeStructure;
    private getFeeDescription;
    calculateBulkFee(transactions: Array<{
        amount: number;
        feeType: FeeType;
        currency?: string;
    }>, currency?: string): FeeCalculationResult;
    calculateTieredFee(amount: number, feeType: FeeType, userTier: 'basic' | 'premium' | 'enterprise', currency?: string): FeeCalculationResult;
    calculateInternationalFee(amount: number, feeType: FeeType, sourceCurrency: string, targetCurrency: string, currency?: string): FeeCalculationResult;
    getFeeEstimate(amount: number, feeType: FeeType, currency?: string, customFeeStructure?: Partial<FeeStructure>): {
        minFee: number;
        maxFee: number;
        estimatedFee: number;
        currency: string;
    };
    updateFeeConfig(feeType: FeeType, newConfig: Partial<FeeStructure>): void;
    getFeeConfig(): FeeConfig;
    validateFeeStructure(feeStructure: FeeStructure): boolean;
}
