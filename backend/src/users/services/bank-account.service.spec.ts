import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BankAccountService } from './bank-account.service';
import { BankAccountDocument } from '../schemas/bank-account.schema';
import { CreateBankAccountDto, UpdateBankAccountDto } from '../dto/bank-account.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('BankAccountService', () => {
  let service: BankAccountService;
  let model: Model<BankAccountDocument>;

  const mockBankAccountModel = {
    new: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockBankAccount = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    bankName: 'Test Bank',
    accountName: 'Test Account',
    accountNumber: '1234567890',
    bankCode: 'TEST',
    bankShortName: 'TB',
    isActive: true,
    isDefault: false,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountService,
        {
          provide: getModelToken('BankAccount'),
          useValue: mockBankAccountModel,
        },
      ],
    }).compile();

    service = module.get<BankAccountService>(BankAccountService);
    model = module.get<Model<BankAccountDocument>>(getModelToken('BankAccount'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBankAccount', () => {
    it('should create a new bank account successfully', async () => {
      const createDto: CreateBankAccountDto = {
        bankName: 'Test Bank',
        accountName: 'Test Account',
        accountNumber: '1234567890',
        bankCode: 'TEST',
        bankShortName: 'TB',
        isDefault: false,
      };

      const mockNewAccount = {
        ...mockBankAccount,
        ...createDto,
        save: jest.fn().mockResolvedValue(mockBankAccount),
      };

      mockBankAccountModel.new.mockReturnValue(mockNewAccount);
      mockBankAccountModel.findOne.mockResolvedValue(null);
      mockBankAccountModel.updateMany.mockResolvedValue({});

      const result = await service.createBankAccount('userId', createDto);

      expect(result).toBeDefined();
      expect(result.bankName).toBe(createDto.bankName);
      expect(mockBankAccountModel.new).toHaveBeenCalled();
      expect(mockNewAccount.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if account already exists', async () => {
      const createDto: CreateBankAccountDto = {
        bankName: 'Test Bank',
        accountName: 'Test Account',
        accountNumber: '1234567890',
        bankCode: 'TEST',
        bankShortName: 'TB',
        isDefault: false,
      };

      mockBankAccountModel.findOne.mockResolvedValue(mockBankAccount);

      await expect(service.createBankAccount('userId', createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getUserBankAccounts', () => {
    it('should return user bank accounts', async () => {
      const mockFind = {
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockBankAccount]),
        }),
      };

      mockBankAccountModel.find.mockReturnValue(mockFind);

      const result = await service.getUserBankAccounts('userId');

      expect(result).toHaveLength(1);
      expect(result[0].bankName).toBe(mockBankAccount.bankName);
    });
  });

  describe('getBankAccount', () => {
    it('should return a specific bank account', async () => {
      const mockFindOne = {
        exec: jest.fn().mockResolvedValue(mockBankAccount),
      };

      mockBankAccountModel.findOne.mockReturnValue(mockFindOne);

      const result = await service.getBankAccount('userId', 'accountId');

      expect(result).toBeDefined();
      expect(result.bankName).toBe(mockBankAccount.bankName);
    });

    it('should throw NotFoundException if account not found', async () => {
      const mockFindOne = {
        exec: jest.fn().mockResolvedValue(null),
      };

      mockBankAccountModel.findOne.mockReturnValue(mockFindOne);

      await expect(service.getBankAccount('userId', 'accountId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBankAccount', () => {
    it('should update bank account successfully', async () => {
      const updateDto: UpdateBankAccountDto = {
        accountName: 'Updated Account Name',
      };

      const mockFindOne = {
        exec: jest.fn().mockResolvedValue(mockBankAccount),
      };

      const mockFindByIdAndUpdate = {
        exec: jest.fn().mockResolvedValue({ ...mockBankAccount, ...updateDto }),
      };

      mockBankAccountModel.findOne.mockReturnValue(mockFindOne);
      mockBankAccountModel.findByIdAndUpdate.mockReturnValue(mockFindByIdAndUpdate);

      const result = await service.updateBankAccount('userId', 'accountId', updateDto);

      expect(result).toBeDefined();
      expect(result.accountName).toBe(updateDto.accountName);
    });
  });

  describe('deleteBankAccount', () => {
    it('should soft delete bank account', async () => {
      const mockFindOne = {
        exec: jest.fn().mockResolvedValue(mockBankAccount),
      };

      mockBankAccountModel.findOne.mockReturnValue(mockFindOne);
      mockBankAccountModel.findByIdAndUpdate.mockResolvedValue({});

      await service.deleteBankAccount('userId', 'accountId');

      expect(mockBankAccountModel.findByIdAndUpdate).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        { isActive: false }
      );
    });
  });

  describe('setDefaultBankAccount', () => {
    it('should set bank account as default', async () => {
      const mockFindOne = {
        exec: jest.fn().mockResolvedValue(mockBankAccount),
      };

      const mockFindByIdAndUpdate = {
        exec: jest.fn().mockResolvedValue({ ...mockBankAccount, isDefault: true }),
      };

      mockBankAccountModel.findOne.mockReturnValue(mockFindOne);
      mockBankAccountModel.updateMany.mockResolvedValue({});
      mockBankAccountModel.findByIdAndUpdate.mockReturnValue(mockFindByIdAndUpdate);

      const result = await service.setDefaultBankAccount('userId', 'accountId');

      expect(result).toBeDefined();
      expect(result.isDefault).toBe(true);
      expect(mockBankAccountModel.updateMany).toHaveBeenCalled();
    });
  });
});
