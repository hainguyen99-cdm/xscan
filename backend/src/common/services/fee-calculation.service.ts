import { Injectable, Logger } from '@nestjs/common';
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

export enum FeeType {
  TRANSACTION = 'transaction',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  TRANSFER = 'transfer',
  DONATION = 'donation',
  MONTHLY_MAINTENANCE = 'monthly_maintenance',
  CURRENCY_CONVERSION = 'currency_conversion',
}

@Injectable()
export class FeeCalculationService {
  private readonly logger = new Logger(FeeCalculationService.name);
  private readonly feeConfig: FeeConfig;

  constructor(private readonly configService: ConfigService) {
    // Initialize default fee configuration
    this.feeConfig = this.initializeFeeConfig();
  }

  private initializeFeeConfig(): FeeConfig {
    return {
      transactionFee: {
        percentage: 0.025, // 2.5%
        fixedAmount: 0,
        minimumFee: 0.1,
        currency: 'VND',
      },
      withdrawalFee: {
        percentage: 0.015, // 1.5%
        fixedAmount: 0.5,
        minimumFee: 0.5,
        maximumFee: 25.0,
        currency: 'VND',
      },
      depositFee: {
        percentage: 0.01, // 1%
        fixedAmount: 0,
        minimumFee: 0.05,
        currency: 'VND',
      },
      transferFee: {
        percentage: 0.02, // 2%
        fixedAmount: 0.25,
        minimumFee: 0.25,
        maximumFee: 15.0,
        currency: 'VND',
      },
      donationFee: {
        percentage: 0.03, // 3%
        fixedAmount: 0,
        minimumFee: 0.1,
        currency: 'VND',
      },
      monthlyMaintenanceFee: {
        percentage: 0,
        fixedAmount: 2.99,
        minimumFee: 2.99,
        currency: 'VND',
      },
      currencyConversionFee: {
        percentage: 0.02, // 2%
        fixedAmount: 0.5,
        minimumFee: 0.5,
        currency: 'VND',
      },
    };
  }

  /**
   * Calculate fee for a given amount and fee type
   */
  calculateFee(
    amount: number,
    feeType: FeeType,
    currency: string = 'VND',
    customFeeStructure?: Partial<FeeStructure>,
  ): FeeCalculationResult {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const baseFeeStructure = this.getFeeStructure(feeType, currency);
    const feeStructure = customFeeStructure
      ? { ...baseFeeStructure, ...customFeeStructure }
      : baseFeeStructure;

    const feeBreakdown = this.calculateFeeBreakdown(amount, feeStructure);

    return {
      baseAmount: amount,
      feeAmount: feeBreakdown.adjustedFee,
      totalAmount: amount + feeBreakdown.adjustedFee,
      feeBreakdown,
      currency: feeStructure.currency,
      feeType,
      description: this.getFeeDescription(
        feeType,
        feeBreakdown.adjustedFee,
        currency,
      ),
    };
  }

  /**
   * Calculate fee breakdown including percentage and fixed components
   */
  private calculateFeeBreakdown(amount: number, feeStructure: FeeStructure) {
    const percentageFee = amount * feeStructure.percentage;
    const fixedFee = feeStructure.fixedAmount;
    let totalFee = percentageFee + fixedFee;

    // Apply minimum fee constraint
    if (totalFee < feeStructure.minimumFee) {
      totalFee = feeStructure.minimumFee;
    }

    // Apply maximum fee constraint if specified
    if (
      feeStructure.maximumFee !== undefined &&
      totalFee > feeStructure.maximumFee
    ) {
      totalFee = feeStructure.maximumFee;
    }

    return {
      percentageFee,
      fixedFee,
      adjustedFee: totalFee,
    };
  }

  /**
   * Get fee structure for a specific fee type and currency
   */
  private getFeeStructure(feeType: FeeType, currency: string): FeeStructure {
    // Map fee types to their config keys
    const feeTypeToConfigKey: Record<FeeType, keyof FeeConfig> = {
      [FeeType.TRANSACTION]: 'transactionFee',
      [FeeType.WITHDRAWAL]: 'withdrawalFee',
      [FeeType.DEPOSIT]: 'depositFee',
      [FeeType.TRANSFER]: 'transferFee',
      [FeeType.DONATION]: 'donationFee',
      [FeeType.MONTHLY_MAINTENANCE]: 'monthlyMaintenanceFee',
      [FeeType.CURRENCY_CONVERSION]: 'currencyConversionFee',
    };

    const configKey = feeTypeToConfigKey[feeType];
    const baseStructure = this.feeConfig[configKey];

    if (!baseStructure) {
      throw new Error(`Unsupported fee type: ${feeType}`);
    }

    // Return a copy with the specified currency
    return { ...baseStructure, currency };
  }

  /**
   * Get human-readable fee description
   */
  private getFeeDescription(
    feeType: FeeType,
    feeAmount: number,
    currency: string,
  ): string {
    const feeTypeNames = {
      [FeeType.TRANSACTION]: 'Transaction Fee',
      [FeeType.WITHDRAWAL]: 'Withdrawal Fee',
      [FeeType.DEPOSIT]: 'Deposit Fee',
      [FeeType.TRANSFER]: 'Transfer Fee',
      [FeeType.DONATION]: 'Donation Processing Fee',
      [FeeType.MONTHLY_MAINTENANCE]: 'Monthly Maintenance Fee',
      [FeeType.CURRENCY_CONVERSION]: 'Currency Conversion Fee',
    };

    return `${feeTypeNames[feeType]} - ${currency.toUpperCase()} ${feeAmount.toFixed(2)}`;
  }

  /**
   * Calculate fee for multiple transactions (bulk discount)
   */
  calculateBulkFee(
    transactions: Array<{
      amount: number;
      feeType: FeeType;
      currency?: string;
    }>,
    currency: string = 'VND',
  ): FeeCalculationResult {
    if (transactions.length === 0) {
      throw new Error('At least one transaction is required');
    }

    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const individualFees = transactions.map((tx) =>
      this.calculateFee(tx.amount, tx.feeType, tx.currency || currency),
    );

    const totalIndividualFees = individualFees.reduce(
      (sum, fee) => sum + fee.feeAmount,
      0,
    );

    // Apply bulk discount (10% off for 5+ transactions)
    let bulkDiscount = 0;
    if (transactions.length >= 5) {
      bulkDiscount = totalIndividualFees * 0.1;
    } else if (transactions.length >= 3) {
      bulkDiscount = totalIndividualFees * 0.05;
    }

    const finalFee = totalIndividualFees - bulkDiscount;

    return {
      baseAmount: totalAmount,
      feeAmount: finalFee,
      totalAmount: totalAmount + finalFee,
      feeBreakdown: {
        percentageFee: totalIndividualFees,
        fixedFee: 0,
        adjustedFee: finalFee,
      },
      currency,
      feeType: FeeType.TRANSACTION,
      description: `Bulk Transaction Fee (${transactions.length} transactions) - ${currency.toUpperCase()} ${finalFee.toFixed(2)}`,
    };
  }

  /**
   * Calculate fee with user tier discount
   */
  calculateTieredFee(
    amount: number,
    feeType: FeeType,
    userTier: 'basic' | 'premium' | 'enterprise',
    currency: string = 'VND',
  ): FeeCalculationResult {
    const baseFee = this.calculateFee(amount, feeType, currency);

    let discountPercentage = 0;
    switch (userTier) {
      case 'premium':
        discountPercentage = 0.15; // 15% discount
        break;
      case 'enterprise':
        discountPercentage = 0.3; // 30% discount
        break;
      default:
        discountPercentage = 0; // No discount for basic tier
    }

    const discountAmount = baseFee.feeAmount * discountPercentage;
    const discountedFee = baseFee.feeAmount - discountAmount;

    return {
      ...baseFee,
      feeAmount: discountedFee,
      totalAmount: amount + discountedFee,
      feeBreakdown: {
        ...baseFee.feeBreakdown,
        adjustedFee: discountedFee,
      },
      description: `${baseFee.description} (${userTier} tier discount: ${currency.toUpperCase()} ${discountAmount.toFixed(2)})`,
    };
  }

  /**
   * Calculate fee for international transactions
   */
  calculateInternationalFee(
    amount: number,
    feeType: FeeType,
    sourceCurrency: string,
    targetCurrency: string,
    currency: string = 'VND',
  ): FeeCalculationResult {
    const baseFee = this.calculateFee(amount, feeType, currency);

    // Add international transaction fee
    const internationalFee = this.calculateFee(
      amount,
      FeeType.CURRENCY_CONVERSION,
      currency,
    );

    const totalFee = baseFee.feeAmount + internationalFee.feeAmount;

    return {
      ...baseFee,
      feeAmount: totalFee,
      totalAmount: amount + totalFee,
      feeBreakdown: {
        percentageFee: baseFee.feeBreakdown.percentageFee,
        fixedFee:
          baseFee.feeBreakdown.fixedFee +
          internationalFee.feeBreakdown.fixedFee,
        adjustedFee: totalFee,
      },
      description: `${baseFee.description} + International Fee (${sourceCurrency} → ${targetCurrency})`,
    };
  }

  /**
   * Get fee estimate without calculating the actual fee
   */
  getFeeEstimate(
    amount: number,
    feeType: FeeType,
    currency: string = 'USD',
    customFeeStructure?: Partial<FeeStructure>,
  ): {
    minFee: number;
    maxFee: number;
    estimatedFee: number;
    currency: string;
  } {
    const baseFeeStructure = this.getFeeStructure(feeType, currency);
    const feeStructure = customFeeStructure
      ? { ...baseFeeStructure, ...customFeeStructure }
      : baseFeeStructure;

    const estimatedFee = this.calculateFeeBreakdown(
      amount,
      feeStructure,
    ).adjustedFee;

    return {
      minFee: feeStructure.minimumFee,
      maxFee: feeStructure.maximumFee || estimatedFee,
      estimatedFee,
      currency: feeStructure.currency,
    };
  }

  /**
   * Update fee configuration (for admin use)
   */
  updateFeeConfig(feeType: FeeType, newConfig: Partial<FeeStructure>): void {
    const configKey = `${feeType}Fee` as keyof FeeConfig;
    if (this.feeConfig[configKey]) {
      this.feeConfig[configKey] = {
        ...this.feeConfig[configKey],
        ...newConfig,
      };
      this.logger.log(`Updated fee configuration for ${feeType}`);
    } else {
      throw new Error(`Invalid fee type: ${feeType}`);
    }
  }

  /**
   * Get current fee configuration
   */
  getFeeConfig(): FeeConfig {
    return { ...this.feeConfig };
  }

  /**
   * Validate fee structure
   */
  validateFeeStructure(feeStructure: FeeStructure): boolean {
    if (feeStructure.percentage < 0 || feeStructure.percentage > 1) {
      return false;
    }
    if (feeStructure.fixedAmount < 0) {
      return false;
    }
    if (feeStructure.minimumFee < 0) {
      return false;
    }
    if (
      feeStructure.maximumFee !== undefined &&
      feeStructure.maximumFee < feeStructure.minimumFee
    ) {
      return false;
    }
    return true;
  }
}
