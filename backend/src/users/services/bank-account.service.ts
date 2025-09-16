import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BankAccountDocument } from '../schemas/bank-account.schema';
import { CreateBankAccountDto, UpdateBankAccountDto, BankAccountResponseDto } from '../dto/bank-account.dto';

@Injectable()
export class BankAccountService {
  constructor(
    @InjectModel('BankAccount') private bankAccountModel: Model<BankAccountDocument>,
  ) {}

  async createBankAccount(userId: string, createBankAccountDto: CreateBankAccountDto): Promise<BankAccountResponseDto> {
    const userObjectId = new Types.ObjectId(userId);

    // Check if account with same bank code and account number already exists for this user
    const existingAccount = await this.bankAccountModel.findOne({
      userId: userObjectId,
      bankCode: createBankAccountDto.bankCode,
      accountNumber: createBankAccountDto.accountNumber,
    });

    if (existingAccount) {
      throw new ConflictException('Bank account with this combination already exists');
    }

    // If setting as default, unset other default accounts
    if (createBankAccountDto.isDefault) {
      await this.bankAccountModel.updateMany(
        { userId: userObjectId, isDefault: true },
        { isDefault: false }
      );
    }

    const bankAccount = new this.bankAccountModel({
      userId: userObjectId,
      ...createBankAccountDto,
    });

    const savedAccount = await bankAccount.save();
    return this.mapToResponseDto(savedAccount);
  }

  async getUserBankAccounts(userId: string): Promise<BankAccountResponseDto[]> {
    const userObjectId = new Types.ObjectId(userId);
    
    const accounts = await this.bankAccountModel
      .find({ userId: userObjectId, isActive: true })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();

    return accounts.map(account => this.mapToResponseDto(account));
  }

  async getBankAccount(userId: string, accountId: string): Promise<BankAccountResponseDto> {
    const userObjectId = new Types.ObjectId(userId);
    const accountObjectId = new Types.ObjectId(accountId);

    const account = await this.bankAccountModel.findOne({
      _id: accountObjectId,
      userId: userObjectId,
      isActive: true,
    }).exec();

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    return this.mapToResponseDto(account);
  }

  async updateBankAccount(userId: string, accountId: string, updateBankAccountDto: UpdateBankAccountDto): Promise<BankAccountResponseDto> {
    const userObjectId = new Types.ObjectId(userId);
    const accountObjectId = new Types.ObjectId(accountId);

    const existingAccount = await this.bankAccountModel.findOne({
      _id: accountObjectId,
      userId: userObjectId,
      isActive: true,
    });

    if (!existingAccount) {
      throw new NotFoundException('Bank account not found');
    }

    // Check for duplicate account number if changing it
    if (updateBankAccountDto.accountNumber && updateBankAccountDto.accountNumber !== existingAccount.accountNumber) {
      const duplicateAccount = await this.bankAccountModel.findOne({
        userId: userObjectId,
        bankCode: updateBankAccountDto.bankCode || existingAccount.bankCode,
        accountNumber: updateBankAccountDto.accountNumber,
        _id: { $ne: accountObjectId },
      });

      if (duplicateAccount) {
        throw new ConflictException('Bank account with this combination already exists');
      }
    }

    // If setting as default, unset other default accounts
    if (updateBankAccountDto.isDefault) {
      await this.bankAccountModel.updateMany(
        { userId: userObjectId, isDefault: true, _id: { $ne: accountObjectId } },
        { isDefault: false }
      );
    }

    const updatedAccount = await this.bankAccountModel.findByIdAndUpdate(
      accountObjectId,
      { ...updateBankAccountDto },
      { new: true }
    ).exec();

    if (!updatedAccount) {
      throw new NotFoundException('Bank account not found');
    }

    return this.mapToResponseDto(updatedAccount);
  }

  async deleteBankAccount(userId: string, accountId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    const accountObjectId = new Types.ObjectId(accountId);

    const account = await this.bankAccountModel.findOne({
      _id: accountObjectId,
      userId: userObjectId,
      isActive: true,
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    // Soft delete by setting isActive to false
    await this.bankAccountModel.findByIdAndUpdate(accountObjectId, { isActive: false });
  }

  async setDefaultBankAccount(userId: string, accountId: string): Promise<BankAccountResponseDto> {
    const userObjectId = new Types.ObjectId(userId);
    const accountObjectId = new Types.ObjectId(accountId);

    const account = await this.bankAccountModel.findOne({
      _id: accountObjectId,
      userId: userObjectId,
      isActive: true,
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    // Unset other default accounts
    await this.bankAccountModel.updateMany(
      { userId: userObjectId, isDefault: true },
      { isDefault: false }
    );

    // Set this account as default
    const updatedAccount = await this.bankAccountModel.findByIdAndUpdate(
      accountObjectId,
      { isDefault: true },
      { new: true }
    ).exec();

    if (!updatedAccount) {
      throw new NotFoundException('Bank account not found');
    }

    return this.mapToResponseDto(updatedAccount);
  }

  async getDefaultBankAccount(userId: string): Promise<BankAccountResponseDto | null> {
    const userObjectId = new Types.ObjectId(userId);
    
    const account = await this.bankAccountModel.findOne({
      userId: userObjectId,
      isDefault: true,
      isActive: true,
    }).exec();

    return account ? this.mapToResponseDto(account) : null;
  }

  async validateBankAccount(userId: string, accountId: string): Promise<boolean> {
    const userObjectId = new Types.ObjectId(userId);
    const accountObjectId = new Types.ObjectId(accountId);

    const account = await this.bankAccountModel.findOne({
      _id: accountObjectId,
      userId: userObjectId,
      isActive: true,
    }).exec();

    return !!account;
  }

  async getBankAccountStats(userId: string): Promise<{
    totalAccounts: number;
    activeAccounts: number;
    defaultAccount: BankAccountResponseDto | null;
  }> {
    const userObjectId = new Types.ObjectId(userId);

    const [totalAccounts, activeAccounts, defaultAccount] = await Promise.all([
      this.bankAccountModel.countDocuments({ userId: userObjectId }),
      this.bankAccountModel.countDocuments({ userId: userObjectId, isActive: true }),
      this.bankAccountModel.findOne({ userId: userObjectId, isDefault: true, isActive: true }),
    ]);

    return {
      totalAccounts,
      activeAccounts,
      defaultAccount: defaultAccount ? this.mapToResponseDto(defaultAccount) : null,
    };
  }

  private mapToResponseDto(account: BankAccountDocument): BankAccountResponseDto {
    return {
      _id: account._id.toString(),
      userId: account.userId.toString(),
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankCode: account.bankCode,
      bankShortName: account.bankShortName,
      bin: (account as any).bin,
      logo: (account as any).logo,
      isActive: account.isActive,
      isDefault: account.isDefault,
      lastUsedAt: account.lastUsedAt,
      createdAt: (account as any).createdAt || new Date(),
      updatedAt: (account as any).updatedAt || new Date(),
    };
  }
}
