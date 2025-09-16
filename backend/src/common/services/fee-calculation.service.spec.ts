import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  FeeCalculationService,
  FeeType,
  FeeStructure,
} from './fee-calculation.service';

describe('FeeCalculationService', () => {
  let service: FeeCalculationService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeeCalculationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FeeCalculationService>(FeeCalculationService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateFee', () => {
    it('should calculate transaction fee correctly', () => {
      const result = service.calculateFee(100, FeeType.TRANSACTION);

      expect(result.baseAmount).toBe(100);
      expect(result.feeAmount).toBe(2.5); // 2.5% of 100
      expect(result.totalAmount).toBe(102.5);
      expect(result.currency).toBe('USD');
      expect(result.feeType).toBe(FeeType.TRANSACTION);
    });

    it('should calculate withdrawal fee correctly', () => {
      const result = service.calculateFee(100, FeeType.WITHDRAWAL);

      expect(result.baseAmount).toBe(100);
      expect(result.feeAmount).toBe(2.0); // 1.5% of 100 + 0.50 fixed
      expect(result.totalAmount).toBe(102.0);
      expect(result.feeType).toBe(FeeType.WITHDRAWAL);
    });

    it('should apply minimum fee constraint', () => {
      const result = service.calculateFee(1, FeeType.TRANSACTION);

      expect(result.feeAmount).toBe(0.1); // Minimum fee instead of 0.025
      expect(result.totalAmount).toBe(1.1);
    });

    it('should apply maximum fee constraint', () => {
      const result = service.calculateFee(2000, FeeType.WITHDRAWAL);

      expect(result.feeAmount).toBe(25.0); // Maximum fee instead of 30.50
      expect(result.totalAmount).toBe(2025.0);
    });

    it('should throw error for invalid amount', () => {
      expect(() => service.calculateFee(0, FeeType.TRANSACTION)).toThrow(
        'Amount must be greater than 0',
      );
      expect(() => service.calculateFee(-100, FeeType.TRANSACTION)).toThrow(
        'Amount must be greater than 0',
      );
    });

    it('should accept custom fee structure', () => {
      const customStructure: Partial<FeeStructure> = {
        percentage: 0.05, // 5%
        fixedAmount: 1.0,
        minimumFee: 2.0,
      };

      const result = service.calculateFee(
        100,
        FeeType.TRANSACTION,
        'USD',
        customStructure,
      );

      expect(result.feeAmount).toBe(6.0); // 5% of 100 + 1.00 fixed
      expect(result.totalAmount).toBe(106.0);
    });
  });

  describe('calculateBulkFee', () => {
    it('should calculate bulk fee with no discount for small transactions', () => {
      const transactions = [
        { amount: 100, feeType: FeeType.TRANSACTION },
        { amount: 200, feeType: FeeType.TRANSACTION },
      ];

      const result = service.calculateBulkFee(transactions);

      expect(result.baseAmount).toBe(300);
      expect(result.feeAmount).toBe(7.5); // 2.5% of 300
      expect(result.totalAmount).toBe(307.5);
    });

    it('should apply 5% discount for 3+ transactions', () => {
      const transactions = [
        { amount: 100, feeType: FeeType.TRANSACTION },
        { amount: 200, feeType: FeeType.TRANSACTION },
        { amount: 300, feeType: FeeType.TRANSACTION },
      ];

      const result = service.calculateBulkFee(transactions);

      const expectedFee = 15 * 0.95; // 2.5% of 600 with 5% discount
      expect(result.feeAmount).toBeCloseTo(expectedFee, 2);
    });

    it('should apply 10% discount for 5+ transactions', () => {
      const transactions = [
        { amount: 100, feeType: FeeType.TRANSACTION },
        { amount: 200, feeType: FeeType.TRANSACTION },
        { amount: 300, feeType: FeeType.TRANSACTION },
        { amount: 400, feeType: FeeType.TRANSACTION },
        { amount: 500, feeType: FeeType.TRANSACTION },
      ];

      const result = service.calculateBulkFee(transactions);

      const expectedFee = 37.5 * 0.9; // 2.5% of 1500 with 10% discount
      expect(result.feeAmount).toBeCloseTo(expectedFee, 2);
    });

    it('should throw error for empty transactions', () => {
      expect(() => service.calculateBulkFee([])).toThrow(
        'At least one transaction is required',
      );
    });
  });

  describe('calculateTieredFee', () => {
    it('should calculate basic tier fee with no discount', () => {
      const result = service.calculateTieredFee(
        100,
        FeeType.TRANSACTION,
        'basic',
      );

      expect(result.feeAmount).toBe(2.5); // No discount
      expect(result.totalAmount).toBe(102.5);
    });

    it('should calculate premium tier fee with 15% discount', () => {
      const result = service.calculateTieredFee(
        100,
        FeeType.TRANSACTION,
        'premium',
      );

      const expectedFee = 2.5 * 0.85; // 15% discount
      expect(result.feeAmount).toBeCloseTo(expectedFee, 2);
      expect(result.totalAmount).toBeCloseTo(100 + expectedFee, 2);
    });

    it('should calculate enterprise tier fee with 30% discount', () => {
      const result = service.calculateTieredFee(
        100,
        FeeType.TRANSACTION,
        'enterprise',
      );

      const expectedFee = 2.5 * 0.7; // 30% discount
      expect(result.feeAmount).toBeCloseTo(expectedFee, 2);
      expect(result.totalAmount).toBeCloseTo(100 + expectedFee, 2);
    });
  });

  describe('calculateInternationalFee', () => {
    it('should add currency conversion fee to base fee', () => {
      const result = service.calculateInternationalFee(
        100,
        FeeType.TRANSACTION,
        'USD',
        'EUR',
      );

      const baseFee = 2.5; // 2.5% of 100
      const conversionFee = 2.5; // 2% of 100 + 0.50 fixed
      const totalFee = baseFee + conversionFee;

      expect(result.feeAmount).toBe(totalFee);
      expect(result.totalAmount).toBe(100 + totalFee);
      expect(result.description).toContain('International Fee (USD → EUR)');
    });
  });

  describe('getFeeEstimate', () => {
    it('should return fee estimate without calculating actual fee', () => {
      const estimate = service.getFeeEstimate(100, FeeType.TRANSACTION);

      expect(estimate.minFee).toBe(0.1);
      expect(estimate.maxFee).toBe(2.5);
      expect(estimate.estimatedFee).toBe(2.5);
      expect(estimate.currency).toBe('USD');
    });
  });

  describe('updateFeeConfig', () => {
    it('should update fee configuration', () => {
      const newConfig: Partial<FeeStructure> = {
        percentage: 0.03, // 3%
        minimumFee: 0.2,
      };

      service.updateFeeConfig(FeeType.TRANSACTION, newConfig);

      const result = service.calculateFee(100, FeeType.TRANSACTION);
      expect(result.feeAmount).toBe(3.0); // 3% of 100
    });

    it('should throw error for invalid fee type', () => {
      const newConfig: Partial<FeeStructure> = { percentage: 0.03 };

      expect(() =>
        service.updateFeeConfig('invalid' as FeeType, newConfig),
      ).toThrow('Invalid fee type: invalid');
    });
  });

  describe('getFeeConfig', () => {
    it('should return copy of fee configuration', () => {
      const config = service.getFeeConfig();

      expect(config).toBeDefined();
      expect(config.transactionFee).toBeDefined();
      expect(config.withdrawalFee).toBeDefined();

      // Verify it's a copy, not the original
      const originalConfig = service.getFeeConfig();
      expect(config).not.toBe(originalConfig);
    });
  });

  describe('validateFeeStructure', () => {
    it('should validate correct fee structure', () => {
      const validStructure: FeeStructure = {
        percentage: 0.025,
        fixedAmount: 0.5,
        minimumFee: 0.1,
        maximumFee: 25.0,
        currency: 'USD',
      };

      expect(service.validateFeeStructure(validStructure)).toBe(true);
    });

    it('should reject invalid percentage', () => {
      const invalidStructure: FeeStructure = {
        percentage: 1.5, // > 100%
        fixedAmount: 0.5,
        minimumFee: 0.1,
        currency: 'USD',
      };

      expect(service.validateFeeStructure(invalidStructure)).toBe(false);
    });

    it('should reject negative fixed amount', () => {
      const invalidStructure: FeeStructure = {
        percentage: 0.025,
        fixedAmount: -0.5,
        minimumFee: 0.1,
        currency: 'USD',
      };

      expect(service.validateFeeStructure(invalidStructure)).toBe(false);
    });

    it('should reject maximum fee less than minimum fee', () => {
      const invalidStructure: FeeStructure = {
        percentage: 0.025,
        fixedAmount: 0.5,
        minimumFee: 1.0,
        maximumFee: 0.5, // Less than minimum
        currency: 'USD',
      };

      expect(service.validateFeeStructure(invalidStructure)).toBe(false);
    });
  });

  describe('fee breakdown', () => {
    it('should provide detailed fee breakdown', () => {
      const result = service.calculateFee(100, FeeType.WITHDRAWAL);

      expect(result.feeBreakdown.percentageFee).toBe(1.5); // 1.5% of 100
      expect(result.feeBreakdown.fixedFee).toBe(0.5);
      expect(result.feeBreakdown.adjustedFee).toBe(2.0);
    });
  });

  describe('currency handling', () => {
    it('should handle different currencies', () => {
      const result = service.calculateFee(100, FeeType.TRANSACTION, 'EUR');

      expect(result.currency).toBe('EUR');
      expect(result.description).toContain('EUR');
    });
  });
});
