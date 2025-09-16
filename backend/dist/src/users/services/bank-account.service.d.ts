import { Model } from 'mongoose';
import { BankAccountDocument } from '../schemas/bank-account.schema';
import { CreateBankAccountDto, UpdateBankAccountDto, BankAccountResponseDto } from '../dto/bank-account.dto';
export declare class BankAccountService {
    private bankAccountModel;
    constructor(bankAccountModel: Model<BankAccountDocument>);
    createBankAccount(userId: string, createBankAccountDto: CreateBankAccountDto): Promise<BankAccountResponseDto>;
    getUserBankAccounts(userId: string): Promise<BankAccountResponseDto[]>;
    getBankAccount(userId: string, accountId: string): Promise<BankAccountResponseDto>;
    updateBankAccount(userId: string, accountId: string, updateBankAccountDto: UpdateBankAccountDto): Promise<BankAccountResponseDto>;
    deleteBankAccount(userId: string, accountId: string): Promise<void>;
    setDefaultBankAccount(userId: string, accountId: string): Promise<BankAccountResponseDto>;
    getDefaultBankAccount(userId: string): Promise<BankAccountResponseDto | null>;
    validateBankAccount(userId: string, accountId: string): Promise<boolean>;
    getBankAccountStats(userId: string): Promise<{
        totalAccounts: number;
        activeAccounts: number;
        defaultAccount: BankAccountResponseDto | null;
    }>;
    private mapToResponseDto;
}
