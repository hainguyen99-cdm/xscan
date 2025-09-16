import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WalletsService } from './wallets.service';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { AddFundsDto } from './dto/add-funds.dto';
import { WithdrawFundsDto } from './dto/withdraw-funds.dto';
import { TransferFundsDto } from './dto/transfer-funds.dto';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  FeeCalculationService,
  FeeType,
} from '../common/services/fee-calculation.service';
import { PaymentsService } from '../payments/payments.service';
import { ExchangeRateService } from '../common/services/exchange-rate.service';

describe('WalletsService', () => {
  let service: WalletsService;
  let walletModel: Model<WalletDocument>;
  let transactionModel: Model<TransactionDocument>;
  let feeCalculationService: FeeCalculationService;
  let paymentsService: PaymentsService;

  // Mock constructor functions
  const MockWallet = jest.fn().mockImplementation((data) => ({
    ...data,
    _id: 'wallet123',
    save: jest.fn().mockResolvedValue({
      _id: 'wallet123',
      ...data,
    }),
  }));

  const MockTransaction = jest.fn().mockImplementation((data) => ({
    ...data,
    _id: 'transaction123',
    save: jest.fn().mockResolvedValue({
      _id: 'transaction123',
      ...data,
    }),
  }));

  // Mock model with constructor and methods
  const mockWalletModel = Object.assign(MockWallet, {
    findOne: jest.fn(),
    findById: jest.fn(),
    aggregate: jest.fn(),
  });

  const mockTransactionModel = Object.assign(MockTransaction, {
    find: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    skip: jest.fn(),
    exec: jest.fn(),
    aggregate: jest.fn(),
    findById: jest.fn(),
  });

  const mockFeeCalculationService = {
    calculateFee: jest.fn(),
    getFeeEstimate: jest.fn(),
    getFeeStructure: jest.fn(),
  };

  const mockPaymentsService = {
    createPaymentIntent: jest.fn(),
    createPayout: jest.fn(),
    processPayment: jest.fn(),
    refundPayment: jest.fn(),
    getFeeEstimate: jest.fn(),
    getRecommendedPaymentProvider: jest.fn(),
    getSupportedCurrencies: jest.fn(),
    handlePaymentWebhook: jest.fn(),
  };

  const mockExchangeRateService = {
    getExchangeRate: jest.fn(),
    convertCurrency: jest.fn(),
    getExchangeRates: jest.fn(),
    getSupportedCurrencies: jest.fn(),
    isCurrencySupported: jest.fn(),
    clearCache: jest.fn(),
    getCacheStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        {
          provide: getModelToken(Wallet.name),
          useValue: mockWalletModel,
        },
        {
          provide: getModelToken(Transaction.name),
          useValue: mockTransactionModel,
        },
        {
          provide: FeeCalculationService,
          useValue: mockFeeCalculationService,
        },
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
        {
          provide: ExchangeRateService,
          useValue: mockExchangeRateService,
        },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
    walletModel = module.get<Model<WalletDocument>>(getModelToken(Wallet.name));
    transactionModel = module.get<Model<TransactionDocument>>(
      getModelToken(Transaction.name),
    );
    feeCalculationService = module.get<FeeCalculationService>(
      FeeCalculationService,
    );
    paymentsService = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWallet', () => {
    it('should create a wallet successfully', async () => {
      const userId = 'user123';
      const createWalletDto: CreateWalletDto = { currency: 'USD' };

      mockWalletModel.findOne.mockResolvedValue(null);

      const result = await service.createWallet(userId, createWalletDto);

      expect(result._id).toBe('wallet123');
      expect(result.userId).toBe(userId);
      expect(result.currency).toBe('USD');
      expect(MockWallet).toHaveBeenCalledWith({
        userId,
        currency: 'USD',
        balance: 0,
        transactionHistory: [],
        isActive: true,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalFees: 0,
      });
    });

    it('should throw ConflictException if wallet already exists', async () => {
      const userId = 'user123';
      const createWalletDto: CreateWalletDto = { currency: 'USD' };
      const existingWallet = { _id: 'existing123' };

      mockWalletModel.findOne.mockResolvedValue(existingWallet);

      await expect(
        service.createWallet(userId, createWalletDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getWallet', () => {
    it('should return wallet if found', async () => {
      const walletId = 'wallet123';
      const mockWallet = { _id: walletId, userId: 'user123' };

      mockWalletModel.findById.mockResolvedValue(mockWallet);

      const result = await service.getWallet(walletId);

      expect(result).toEqual(mockWallet);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      const walletId = 'wallet123';

      mockWalletModel.findById.mockResolvedValue(null);

      await expect(service.getWallet(walletId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addFunds', () => {
    it('should add funds successfully', async () => {
      const walletId = 'wallet123';
      const addFundsDto: AddFundsDto = {
        amount: 100,
        description: 'Test deposit',
      };
      const mockWallet = {
        _id: walletId,
        isActive: true,
        balance: 0,
        currency: 'USD',
        transactionHistory: [],
        save: jest.fn().mockResolvedValue({
          _id: walletId,
          balance: 95,
          currency: 'USD',
        }),
      };

      mockWalletModel.findById.mockResolvedValue(mockWallet);
      mockFeeCalculationService.calculateFee.mockResolvedValue({
        feeAmount: 5,
        netAmount: 95,
        feeStructure: { percentage: 5, fixedAmount: 0 },
        currency: 'USD',
      });

      const result = await service.addFunds(walletId, addFundsDto);

      expect(result.balance).toBe(95);
      expect(mockFeeCalculationService.calculateFee).toHaveBeenCalledWith(
        100,
        FeeType.DEPOSIT,
        'USD',
      );
    });

    it('should throw NotFoundException if wallet not found', async () => {
      const walletId = 'wallet123';
      const addFundsDto: AddFundsDto = {
        amount: 100,
        description: 'Test deposit',
      };

      mockWalletModel.findById.mockResolvedValue(null);

      await expect(service.addFunds(walletId, addFundsDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if wallet is inactive', async () => {
      const walletId = 'wallet123';
      const addFundsDto: AddFundsDto = {
        amount: 100,
        description: 'Test deposit',
      };
      const mockWallet = { _id: walletId, isActive: false };

      mockWalletModel.findById.mockResolvedValue(mockWallet);

      await expect(service.addFunds(walletId, addFundsDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('withdrawFunds', () => {
    it('should withdraw funds successfully', async () => {
      const walletId = 'wallet123';
      const withdrawFundsDto: WithdrawFundsDto = {
        amount: 50,
        description: 'Test withdrawal',
      };
      const mockWallet = {
        _id: walletId,
        isActive: true,
        balance: 100,
        currency: 'USD',
        transactionHistory: [],
        save: jest.fn().mockResolvedValue({
          _id: walletId,
          balance: 45,
          currency: 'USD',
        }),
      };

      mockWalletModel.findById.mockResolvedValue(mockWallet);
      mockFeeCalculationService.calculateFee.mockResolvedValue({
        feeAmount: 5,
        netAmount: 45,
        feeStructure: { percentage: 10, fixedAmount: 0 },
        currency: 'USD',
      });

      const result = await service.withdrawFunds(walletId, withdrawFundsDto);

      expect(result.balance).toBe(45);
      expect(mockFeeCalculationService.calculateFee).toHaveBeenCalledWith(
        50,
        FeeType.WITHDRAWAL,
        'USD',
      );
    });

    it('should throw BadRequestException if insufficient funds', async () => {
      const walletId = 'wallet123';
      const withdrawFundsDto: WithdrawFundsDto = {
        amount: 150,
        description: 'Test withdrawal',
      };
      const mockWallet = {
        _id: walletId,
        isActive: true,
        balance: 100,
        currency: 'USD',
      };

      mockWalletModel.findById.mockResolvedValue(mockWallet);

      await expect(
        service.withdrawFunds(walletId, withdrawFundsDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('transferFunds', () => {
    it('should transfer funds successfully', async () => {
      const fromWalletId = 'wallet123';
      const transferFundsDto: TransferFundsDto = {
        toWalletId: 'wallet456',
        amount: 50,
        description: 'Test transfer',
      };

      const mockFromWallet = {
        _id: fromWalletId,
        isActive: true,
        balance: 100,
        currency: 'USD',
        transactionHistory: [],
        save: jest.fn().mockResolvedValue({
          _id: fromWalletId,
          balance: 45,
          currency: 'USD',
        }),
      };

      const mockToWallet = {
        _id: 'wallet456',
        isActive: true,
        balance: 0,
        currency: 'USD',
        transactionHistory: [],
        save: jest.fn().mockResolvedValue({
          _id: 'wallet456',
          balance: 50,
          currency: 'USD',
        }),
      };

      mockWalletModel.findById
        .mockResolvedValueOnce(mockFromWallet)
        .mockResolvedValueOnce(mockToWallet);

      mockFeeCalculationService.calculateFee.mockResolvedValue({
        feeAmount: 5,
        netAmount: 45,
        feeStructure: { percentage: 10, fixedAmount: 0 },
        currency: 'USD',
      });

      const result = await service.transferFunds(
        fromWalletId,
        transferFundsDto,
      );

      expect(result.fromWallet.balance).toBe(45);
      expect(result.toWallet.balance).toBe(50);
      expect(mockFeeCalculationService.calculateFee).toHaveBeenCalledWith(
        50,
        FeeType.TRANSFER,
        'USD',
      );
    });

    it('should throw BadRequestException if insufficient funds', async () => {
      const fromWalletId = 'wallet123';
      const transferFundsDto: TransferFundsDto = {
        toWalletId: 'wallet456',
        amount: 150,
        description: 'Test transfer',
      };

      const mockFromWallet = {
        _id: fromWalletId,
        isActive: true,
        balance: 100,
        currency: 'USD',
      };

      mockWalletModel.findById.mockResolvedValue(mockFromWallet);

      await expect(
        service.transferFunds(fromWalletId, transferFundsDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('processDonation', () => {
    it('should process donation successfully', async () => {
      const fromWalletId = 'wallet123';
      const toUserId = 'user456';
      const amount = 50;
      const description = 'Test donation';

      const mockFromWallet = {
        _id: fromWalletId,
        isActive: true,
        balance: 100,
        currency: 'USD',
        transactionHistory: [],
        save: jest.fn().mockResolvedValue({
          _id: fromWalletId,
          balance: 50,
          currency: 'USD',
        }),
      };

      const mockToWallet = {
        _id: 'wallet456',
        isActive: true,
        balance: 0,
        currency: 'USD',
        transactionHistory: [],
        save: jest.fn().mockResolvedValue({
          _id: 'wallet456',
          balance: 45,
          currency: 'USD',
        }),
      };

      mockWalletModel.findOne.mockResolvedValue(mockToWallet);
      mockWalletModel.findById.mockResolvedValue(mockFromWallet);

      mockFeeCalculationService.calculateFee.mockResolvedValue({
        feeAmount: 5,
        netAmount: 45,
        feeStructure: { percentage: 10, fixedAmount: 0 },
        currency: 'USD',
      });

      const result = await service.processDonation(
        fromWalletId,
        toUserId,
        amount,
        description,
      );

      expect(result.fromWallet.balance).toBe(50);
      expect(result.toWallet.balance).toBe(45);
      expect(mockFeeCalculationService.calculateFee).toHaveBeenCalledWith(
        50,
        FeeType.DONATION,
        'USD',
      );
    });

    it('should throw BadRequestException if insufficient funds', async () => {
      const fromWalletId = 'wallet123';
      const toUserId = 'user456';
      const amount = 150;
      const description = 'Test donation';

      const mockFromWallet = {
        _id: fromWalletId,
        isActive: true,
        balance: 100,
        currency: 'USD',
      };

      mockWalletModel.findById.mockResolvedValue(mockFromWallet);

      await expect(
        service.processDonation(fromWalletId, toUserId, amount, description),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('processFee', () => {
    it('should process fee successfully', async () => {
      const walletId = 'wallet123';
      const amount = 10;
      const description = 'Test fee';
      const feeType = 'transaction';

      const mockWallet = {
        _id: walletId,
        isActive: true,
        balance: 100,
        currency: 'USD',
        transactionHistory: [],
        save: jest.fn().mockResolvedValue({
          _id: walletId,
          balance: 90,
          currency: 'USD',
        }),
      };

      mockWalletModel.findById.mockResolvedValue(mockWallet);

      mockFeeCalculationService.calculateFee.mockResolvedValue({
        feeAmount: 10,
        netAmount: 90,
        feeStructure: { percentage: 0, fixedAmount: 10 },
        currency: 'USD',
      });

      const result = await service.processFee(
        walletId,
        amount,
        description,
        feeType,
      );

      expect(result.wallet.balance).toBe(90);
      expect(mockFeeCalculationService.calculateFee).toHaveBeenCalledWith(
        10,
        FeeType.TRANSACTION,
        'USD',
      );
    });

    it('should throw BadRequestException if insufficient funds', async () => {
      const walletId = 'wallet123';
      const amount = 150;
      const description = 'Test fee';
      const feeType = 'transaction';

      const mockWallet = {
        _id: walletId,
        isActive: true,
        balance: 100,
        currency: 'USD',
        transactionHistory: [],
      };

      mockWalletModel.findById.mockResolvedValue(mockWallet);

      // Mock the fee calculation to return a fee amount that exceeds the wallet balance
      mockFeeCalculationService.calculateFee.mockResolvedValue({
        feeAmount: 150, // This exceeds the wallet balance of 100
        netAmount: -50,
        feeStructure: { percentage: 0, fixedAmount: 150 },
        currency: 'USD',
      });

      await expect(
        service.processFee(walletId, amount, description, feeType),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction by ID', async () => {
      const transactionId = 'transaction123';
      const mockTransaction = {
        _id: transactionId,
        type: 'deposit',
        amount: 100,
      };

      mockTransactionModel.findById.mockResolvedValue(mockTransaction);

      const result = await service.getTransactionById(transactionId);

      expect(result).toBeDefined();
      expect(result._id).toBe(transactionId);
    });

    it('should throw NotFoundException if transaction not found', async () => {
      const transactionId = 'nonexistent';
      mockTransactionModel.findById.mockResolvedValue(null);

      await expect(service.getTransactionById(transactionId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTransactionsByType', () => {
    it('should return transactions by type', async () => {
      const walletId = 'wallet123';
      const type = 'deposit';
      const mockTransactions = [
        { _id: 'tx1', type: 'deposit', amount: 100 },
        { _id: 'tx2', type: 'deposit', amount: 200 },
      ];

      mockWalletModel.findById.mockResolvedValue({ _id: walletId });

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockTransactions),
      };
      mockTransactionModel.find.mockReturnValue(mockQuery);

      const result = await service.getTransactionsByType(walletId, type, 10, 0);

      expect(result).toEqual(mockTransactions);
      expect(mockTransactionModel.find).toHaveBeenCalledWith({
        walletId,
        type,
      });
    });
  });

  describe('getTransactionStats', () => {
    it('should return transaction statistics', async () => {
      const walletId = 'wallet123';
      const mockStats = {
        totalDeposits: 1000,
        totalWithdrawals: 500,
        totalFees: 25,
        totalDonations: 100,
        totalTransfers: 300,
        transactionCount: 15,
      };

      mockWalletModel.findById.mockResolvedValue({ _id: walletId });
      mockTransactionModel.aggregate.mockResolvedValue([mockStats]);

      const result = await service.getTransactionStats(walletId);

      expect(result).toEqual(mockStats);
      expect(mockTransactionModel.aggregate).toHaveBeenCalled();
    });

    it('should return default stats when no transactions exist', async () => {
      const walletId = 'wallet123';
      const defaultStats = {
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalFees: 0,
        totalDonations: 0,
        totalTransfers: 0,
        transactionCount: 0,
      };

      mockWalletModel.findById.mockResolvedValue({ _id: walletId });
      mockTransactionModel.aggregate.mockResolvedValue([]);

      const result = await service.getTransactionStats(walletId);

      expect(result).toEqual(defaultStats);
    });
  });
});
