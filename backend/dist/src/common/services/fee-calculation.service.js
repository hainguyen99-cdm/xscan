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
var FeeCalculationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeCalculationService = exports.FeeType = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../config/config.service");
var FeeType;
(function (FeeType) {
    FeeType["TRANSACTION"] = "transaction";
    FeeType["WITHDRAWAL"] = "withdrawal";
    FeeType["DEPOSIT"] = "deposit";
    FeeType["TRANSFER"] = "transfer";
    FeeType["DONATION"] = "donation";
    FeeType["MONTHLY_MAINTENANCE"] = "monthly_maintenance";
    FeeType["CURRENCY_CONVERSION"] = "currency_conversion";
})(FeeType || (exports.FeeType = FeeType = {}));
let FeeCalculationService = FeeCalculationService_1 = class FeeCalculationService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(FeeCalculationService_1.name);
        this.feeConfig = this.initializeFeeConfig();
    }
    initializeFeeConfig() {
        return {
            transactionFee: {
                percentage: 0.025,
                fixedAmount: 0,
                minimumFee: 0.1,
                currency: 'VND',
            },
            withdrawalFee: {
                percentage: 0.015,
                fixedAmount: 0.5,
                minimumFee: 0.5,
                maximumFee: 25.0,
                currency: 'VND',
            },
            depositFee: {
                percentage: 0.01,
                fixedAmount: 0,
                minimumFee: 0.05,
                currency: 'VND',
            },
            transferFee: {
                percentage: 0.02,
                fixedAmount: 0.25,
                minimumFee: 0.25,
                maximumFee: 15.0,
                currency: 'VND',
            },
            donationFee: {
                percentage: 0.03,
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
                percentage: 0.02,
                fixedAmount: 0.5,
                minimumFee: 0.5,
                currency: 'VND',
            },
        };
    }
    calculateFee(amount, feeType, currency = 'VND', customFeeStructure) {
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
            description: this.getFeeDescription(feeType, feeBreakdown.adjustedFee, currency),
        };
    }
    calculateFeeBreakdown(amount, feeStructure) {
        const percentageFee = amount * feeStructure.percentage;
        const fixedFee = feeStructure.fixedAmount;
        let totalFee = percentageFee + fixedFee;
        if (totalFee < feeStructure.minimumFee) {
            totalFee = feeStructure.minimumFee;
        }
        if (feeStructure.maximumFee !== undefined &&
            totalFee > feeStructure.maximumFee) {
            totalFee = feeStructure.maximumFee;
        }
        return {
            percentageFee,
            fixedFee,
            adjustedFee: totalFee,
        };
    }
    getFeeStructure(feeType, currency) {
        const feeTypeToConfigKey = {
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
        return { ...baseStructure, currency };
    }
    getFeeDescription(feeType, feeAmount, currency) {
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
    calculateBulkFee(transactions, currency = 'VND') {
        if (transactions.length === 0) {
            throw new Error('At least one transaction is required');
        }
        const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const individualFees = transactions.map((tx) => this.calculateFee(tx.amount, tx.feeType, tx.currency || currency));
        const totalIndividualFees = individualFees.reduce((sum, fee) => sum + fee.feeAmount, 0);
        let bulkDiscount = 0;
        if (transactions.length >= 5) {
            bulkDiscount = totalIndividualFees * 0.1;
        }
        else if (transactions.length >= 3) {
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
    calculateTieredFee(amount, feeType, userTier, currency = 'VND') {
        const baseFee = this.calculateFee(amount, feeType, currency);
        let discountPercentage = 0;
        switch (userTier) {
            case 'premium':
                discountPercentage = 0.15;
                break;
            case 'enterprise':
                discountPercentage = 0.3;
                break;
            default:
                discountPercentage = 0;
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
    calculateInternationalFee(amount, feeType, sourceCurrency, targetCurrency, currency = 'VND') {
        const baseFee = this.calculateFee(amount, feeType, currency);
        const internationalFee = this.calculateFee(amount, FeeType.CURRENCY_CONVERSION, currency);
        const totalFee = baseFee.feeAmount + internationalFee.feeAmount;
        return {
            ...baseFee,
            feeAmount: totalFee,
            totalAmount: amount + totalFee,
            feeBreakdown: {
                percentageFee: baseFee.feeBreakdown.percentageFee,
                fixedFee: baseFee.feeBreakdown.fixedFee +
                    internationalFee.feeBreakdown.fixedFee,
                adjustedFee: totalFee,
            },
            description: `${baseFee.description} + International Fee (${sourceCurrency} → ${targetCurrency})`,
        };
    }
    getFeeEstimate(amount, feeType, currency = 'USD', customFeeStructure) {
        const baseFeeStructure = this.getFeeStructure(feeType, currency);
        const feeStructure = customFeeStructure
            ? { ...baseFeeStructure, ...customFeeStructure }
            : baseFeeStructure;
        const estimatedFee = this.calculateFeeBreakdown(amount, feeStructure).adjustedFee;
        return {
            minFee: feeStructure.minimumFee,
            maxFee: feeStructure.maximumFee || estimatedFee,
            estimatedFee,
            currency: feeStructure.currency,
        };
    }
    updateFeeConfig(feeType, newConfig) {
        const configKey = `${feeType}Fee`;
        if (this.feeConfig[configKey]) {
            this.feeConfig[configKey] = {
                ...this.feeConfig[configKey],
                ...newConfig,
            };
            this.logger.log(`Updated fee configuration for ${feeType}`);
        }
        else {
            throw new Error(`Invalid fee type: ${feeType}`);
        }
    }
    getFeeConfig() {
        return { ...this.feeConfig };
    }
    validateFeeStructure(feeStructure) {
        if (feeStructure.percentage < 0 || feeStructure.percentage > 1) {
            return false;
        }
        if (feeStructure.fixedAmount < 0) {
            return false;
        }
        if (feeStructure.minimumFee < 0) {
            return false;
        }
        if (feeStructure.maximumFee !== undefined &&
            feeStructure.maximumFee < feeStructure.minimumFee) {
            return false;
        }
        return true;
    }
};
exports.FeeCalculationService = FeeCalculationService;
exports.FeeCalculationService = FeeCalculationService = FeeCalculationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], FeeCalculationService);
//# sourceMappingURL=fee-calculation.service.js.map