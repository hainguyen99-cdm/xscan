export declare class CreateBankAccountDto {
    bankName: string;
    accountName: string;
    accountNumber: string;
    bankCode?: string;
    bankShortName?: string;
    bin?: string;
    logo?: string;
    isDefault?: boolean;
}
export declare class UpdateBankAccountDto {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    bankCode?: string;
    bankShortName?: string;
    bin?: string;
    logo?: string;
    isActive?: boolean;
    isDefault?: boolean;
}
export declare class BankAccountResponseDto {
    _id: string;
    userId: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    bankCode?: string;
    bankShortName?: string;
    bin?: string;
    logo?: string;
    isActive: boolean;
    isDefault: boolean;
    lastUsedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SetDefaultBankAccountDto {
    bankAccountId: string;
}
