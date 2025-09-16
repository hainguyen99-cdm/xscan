import { Test, TestingModule } from '@nestjs/testing';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import {
  CreateWalletDto,
  AddFundsDto,
  WithdrawFundsDto,
  TransferFundsDto,
  ProcessDonationDto,
  ProcessFeeDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('WalletsController', () => {
  let controller: WalletsController;
  let service: WalletsService;

  const mockWalletsService = {
    createWallet: jest.fn(),
    getWallet: jest.fn(),
    getWalletByUserId: jest.fn(),
    addFunds: jest.fn(),
    withdrawFunds: jest.fn(),
    transferFunds: jest.fn(),
    deactivateWallet: jest.fn(),
    reactivateWallet: jest.fn(),
    processDonation: jest.fn(),
    processFee: jest.fn(),
    getTransactionHistory: jest.fn(),
    getTransactionById: jest.fn(),
    getTransactionsByType: jest.fn(),
    getTransactionStats: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletsController],
      providers: [
        {
          provide: WalletsService,
          useValue: mockWalletsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<WalletsController>(WalletsController);
    service = module.get<WalletsService>(WalletsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /wallets', () => {
    it('should create a new wallet', async () => {
      const createWalletDto: CreateWalletDto = {
        currency: 'USD',
      };
      const mockWallet = { _id: 'wallet123', currency: 'USD' };
      const mockRequest = { user: { userId: 'user123' } };

      mockWalletsService.createWallet.mockResolvedValue(mockWallet);

      const result = await controller.createWallet(
        mockRequest,
        createWalletDto,
      );

      expect(result).toEqual({
        success: true,
        data: mockWallet,
        message: 'Wallet created successfully',
      });
      expect(service.createWallet).toHaveBeenCalledWith(
        'user123',
        createWalletDto,
      );
    });
  });

  describe('GET /wallets/:id', () => {
    it('should return a wallet by ID', async () => {
      const walletId = 'wallet123';
      const mockWallet = { _id: walletId, userId: 'user123', balance: 100 };

      mockWalletsService.getWallet.mockResolvedValue(mockWallet);

      const result = await controller.getWallet(walletId);

      expect(result).toEqual({
        success: true,
        data: mockWallet,
        message: 'Wallet retrieved successfully',
      });
      expect(service.getWallet).toHaveBeenCalledWith(walletId);
    });
  });

  describe('GET /wallets/user/:userId', () => {
    it('should return wallets by user ID', async () => {
      const userId = 'user123';
      const mockWallet = { _id: 'wallet123', userId, balance: 100 };
      const body = { currency: 'USD' };

      mockWalletsService.getWalletByUserId.mockResolvedValue(mockWallet);

      const result = await controller.getWalletByUserId(userId, body);

      expect(result).toEqual({
        success: true,
        data: mockWallet,
        message: 'Wallet retrieved successfully',
      });
      expect(service.getWalletByUserId).toHaveBeenCalledWith(
        userId,
        body.currency,
      );
    });
  });

  describe('POST /wallets/:id/add-funds', () => {
    it('should add funds to wallet', async () => {
      const walletId = 'wallet123';
      const addFundsDto: AddFundsDto = {
        amount: 100,
        description: 'Test deposit',
      };
      const mockWallet = { _id: walletId, balance: 100 };

      mockWalletsService.addFunds.mockResolvedValue(mockWallet);

      const result = await controller.addFunds(walletId, addFundsDto);

      expect(result).toEqual({
        success: true,
        data: mockWallet,
        message: 'Funds added successfully',
      });
      expect(service.addFunds).toHaveBeenCalledWith(walletId, addFundsDto);
    });
  });

  describe('POST /wallets/:id/withdraw-funds', () => {
    it('should withdraw funds from wallet', async () => {
      const walletId = 'wallet123';
      const withdrawFundsDto: WithdrawFundsDto = {
        amount: 50,
        description: 'Test withdrawal',
      };
      const mockWallet = { _id: walletId, balance: 50 };

      mockWalletsService.withdrawFunds.mockResolvedValue(mockWallet);

      const result = await controller.withdrawFunds(walletId, withdrawFundsDto);

      expect(result).toEqual({
        success: true,
        data: mockWallet,
        message: 'Funds withdrawn successfully',
      });
      expect(service.withdrawFunds).toHaveBeenCalledWith(
        walletId,
        withdrawFundsDto,
      );
    });
  });

  describe('POST /wallets/:id/transfer-funds', () => {
    it('should transfer funds between wallets', async () => {
      const walletId = 'wallet123';
      const transferFundsDto: TransferFundsDto = {
        toWalletId: 'wallet456',
        amount: 50,
        description: 'Test transfer',
      };
      const mockResult = {
        fromWallet: { _id: walletId, balance: 50 },
        toWallet: { _id: 'wallet456', balance: 50 },
      };

      mockWalletsService.transferFunds.mockResolvedValue(mockResult);

      const result = await controller.transferFunds(walletId, transferFundsDto);

      expect(result).toEqual({
        success: true,
        data: mockResult,
        message: 'Funds transferred successfully',
      });
      expect(service.transferFunds).toHaveBeenCalledWith(
        walletId,
        transferFundsDto,
      );
    });
  });

  describe('POST /wallets/:id/donate', () => {
    it('should process donation', async () => {
      const walletId = 'wallet123';
      const processDonationDto: ProcessDonationDto = {
        toUserId: 'user456',
        amount: 25,
        description: 'Test donation',
      };
      const mockResult = {
        fromWallet: { _id: walletId, balance: 75 },
        toWallet: { _id: 'wallet456', balance: 25 },
        transaction: { _id: 'tx123', type: 'donation' },
      };

      mockWalletsService.processDonation.mockResolvedValue(mockResult);

      const result = await controller.processDonation(
        walletId,
        processDonationDto,
      );

      expect(result).toEqual({
        success: true,
        data: mockResult,
        message: 'Donation processed successfully',
      });
      expect(service.processDonation).toHaveBeenCalledWith(
        walletId,
        processDonationDto.toUserId,
        processDonationDto.amount,
        processDonationDto.description,
      );
    });
  });

  describe('POST /wallets/:id/process-fee', () => {
    it('should process fee', async () => {
      const walletId = 'wallet123';
      const processFeeDto: ProcessFeeDto = {
        amount: 5,
        description: 'Service fee',
        feeType: 'transaction',
      };
      const mockResult = {
        wallet: { _id: walletId, balance: 95 },
        transaction: { _id: 'tx123', type: 'fee' },
      };

      mockWalletsService.processFee.mockResolvedValue(mockResult);

      const result = await controller.processFee(walletId, processFeeDto);

      expect(result).toEqual({
        success: true,
        data: mockResult,
        message: 'Fee processed successfully',
      });
      expect(service.processFee).toHaveBeenCalledWith(
        walletId,
        processFeeDto.amount,
        processFeeDto.description,
        processFeeDto.feeType,
      );
    });
  });

  describe('GET /wallets/:id/transactions', () => {
    it('should return transaction history', async () => {
      const walletId = 'wallet123';
      const mockTransactions = [
        { _id: 'tx1', amount: 100, type: 'deposit' },
        { _id: 'tx2', amount: -50, type: 'withdrawal' },
      ];

      mockWalletsService.getTransactionHistory.mockResolvedValue(
        mockTransactions,
      );

      const result = await controller.getTransactionHistory(walletId, 10, 0);

      expect(result).toEqual({
        success: true,
        data: mockTransactions,
        message: 'Transaction history retrieved successfully',
      });
      expect(service.getTransactionHistory).toHaveBeenCalledWith(
        walletId,
        10,
        0,
      );
    });
  });

  describe('GET /wallets/transactions/:transactionId', () => {
    it('should return a specific transaction', async () => {
      const transactionId = 'tx123';
      const mockTransaction = {
        _id: transactionId,
        amount: 100,
        type: 'deposit',
      };

      mockWalletsService.getTransactionById.mockResolvedValue(mockTransaction);

      const result = await controller.getTransactionById(transactionId);

      expect(result).toEqual({
        success: true,
        data: mockTransaction,
        message: 'Transaction retrieved successfully',
      });
      expect(service.getTransactionById).toHaveBeenCalledWith(transactionId);
    });
  });

  describe('GET /wallets/:id/transactions/type/:type', () => {
    it('should return transactions by type', async () => {
      const walletId = 'wallet123';
      const type = 'deposit';
      const mockTransactions = [
        { _id: 'tx1', amount: 100, type: 'deposit' },
        { _id: 'tx2', amount: 200, type: 'deposit' },
      ];

      mockWalletsService.getTransactionsByType.mockResolvedValue(
        mockTransactions,
      );

      const result = await controller.getTransactionsByType(
        walletId,
        type,
        10,
        0,
      );

      expect(result).toEqual({
        success: true,
        data: mockTransactions,
        message: 'Transactions retrieved successfully',
      });
      expect(service.getTransactionsByType).toHaveBeenCalledWith(
        walletId,
        type,
        10,
        0,
      );
    });
  });

  describe('GET /wallets/:id/transaction-stats', () => {
    it('should return transaction statistics', async () => {
      const walletId = 'wallet123';
      const mockStats = {
        totalTransactions: 10,
        totalDeposits: 500,
        totalWithdrawals: 200,
        totalFees: 25,
      };

      mockWalletsService.getTransactionStats.mockResolvedValue(mockStats);

      const result = await controller.getTransactionStats(walletId);

      expect(result).toEqual({
        success: true,
        data: mockStats,
        message: 'Transaction statistics retrieved successfully',
      });
      expect(service.getTransactionStats).toHaveBeenCalledWith(walletId);
    });
  });

  describe('PUT /wallets/:id/deactivate', () => {
    it('should deactivate wallet', async () => {
      const walletId = 'wallet123';
      const mockWallet = { _id: walletId, isActive: false };

      mockWalletsService.deactivateWallet.mockResolvedValue(mockWallet);

      const result = await controller.deactivateWallet(walletId);

      expect(result).toEqual({
        success: true,
        data: mockWallet,
        message: 'Wallet deactivated successfully',
      });
      expect(service.deactivateWallet).toHaveBeenCalledWith(walletId);
    });
  });

  describe('PUT /wallets/:id/reactivate', () => {
    it('should reactivate wallet', async () => {
      const walletId = 'wallet123';
      const mockWallet = { _id: walletId, isActive: true };

      mockWalletsService.reactivateWallet.mockResolvedValue(mockWallet);

      const result = await controller.reactivateWallet(walletId);

      expect(result).toEqual({
        success: true,
        data: mockWallet,
        message: 'Wallet reactivated successfully',
      });
      expect(service.reactivateWallet).toHaveBeenCalledWith(walletId);
    });
  });
});
