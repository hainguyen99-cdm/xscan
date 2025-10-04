import { Test, TestingModule } from '@nestjs/testing';
import { BankDonationTotalController } from '../../src/obs-settings/bank-donation-total.controller';
import { BankDonationTotalService } from '../../src/obs-settings/bank-donation-total.service';
import { getModelToken } from '@nestjs/mongoose';
import { BankTransaction } from '../../src/bank-sync/schemas/bank-transaction.schema';
import { Model } from 'mongoose';

describe('BankDonationTotalController', () => {
  let controller: BankDonationTotalController;
  let service: BankDonationTotalService;
  let mockBankTransactionModel: Model<BankTransaction>;

  const mockBankTransaction = {
    _id: '64a1b2c3d4e5f6789abcdef0',
    streamerId: '64a1b2c3d4e5f6789abcdef1',
    reference: 'REF123456',
    description: 'Test donation',
    amount: 100000,
    currency: 'VND',
    transactionDate: new Date('2024-01-15T10:30:00.000Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockModel = {
      aggregate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankDonationTotalController],
      providers: [
        BankDonationTotalService,
        {
          provide: getModelToken(BankTransaction.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    controller = module.get<BankDonationTotalController>(BankDonationTotalController);
    service = module.get<BankDonationTotalService>(BankDonationTotalService);
    mockBankTransactionModel = module.get<Model<BankTransaction>>(getModelToken(BankTransaction.name));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTotalBankDonations', () => {
    it('should return total bank donations for a streamer', async () => {
      const streamerId = '64a1b2c3d4e5f6789abcdef1';
      const mockResult = [{
        _id: null,
        totalAmount: 500000,
        transactionCount: 5,
        lastDonationDate: new Date('2024-01-15T10:30:00.000Z'),
        currency: 'VND',
      }];

      jest.spyOn(mockBankTransactionModel, 'aggregate').mockResolvedValue(mockResult);

      const result = await service.getTotalBankDonations(streamerId);

      expect(result).toEqual({
        totalAmount: 500000,
        currency: 'VND',
        transactionCount: 5,
        lastDonationDate: new Date('2024-01-15T10:30:00.000Z'),
      });
    });

    it('should return zero values when no transactions exist', async () => {
      const streamerId = '64a1b2c3d4e5f6789abcdef1';
      const mockResult: any[] = [];

      jest.spyOn(mockBankTransactionModel, 'aggregate').mockResolvedValue(mockResult);

      const result = await service.getTotalBankDonations(streamerId);

      expect(result).toEqual({
        totalAmount: 0,
        currency: 'VND',
        transactionCount: 0,
      });
    });
  });

  describe('formatCurrency', () => {
    it('should format VND currency correctly', () => {
      const result = service.formatCurrency(1500000, 'VND');
      expect(result).toBe('1.500.000 ₫');
    });

    it('should format USD currency correctly', () => {
      const result = service.formatCurrency(150.50, 'USD');
      expect(result).toBe('$150.50');
    });
  });

  describe('getBankDonationStats', () => {
    it('should return comprehensive stats for a streamer', async () => {
      const streamerId = '64a1b2c3d4e5f6789abcdef1';
      const mockTotalStats = [{
        _id: null,
        totalAmount: 1000000,
        transactionCount: 10,
        lastDonationDate: new Date('2024-01-15T10:30:00.000Z'),
        currency: 'VND',
      }];
      const mockTodayStats = [{ totalAmount: 100000, transactionCount: 1 }];
      const mockWeekStats = [{ totalAmount: 300000, transactionCount: 3 }];
      const mockMonthStats = [{ totalAmount: 500000, transactionCount: 5 }];

      jest.spyOn(mockBankTransactionModel, 'aggregate')
        .mockResolvedValueOnce(mockTotalStats)
        .mockResolvedValueOnce(mockTodayStats)
        .mockResolvedValueOnce(mockWeekStats)
        .mockResolvedValueOnce(mockMonthStats);

      const result = await service.getBankDonationStats(streamerId);

      expect(result).toEqual({
        totalAmount: 1000000,
        currency: 'VND',
        transactionCount: 10,
        lastDonationDate: new Date('2024-01-15T10:30:00.000Z'),
        averageDonation: 100000,
        todayDonations: 100000,
        thisWeekDonations: 300000,
        thisMonthDonations: 500000,
      });
    });
  });
});
