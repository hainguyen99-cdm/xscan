import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiProperty({ description: 'Bank name' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ description: 'Account holder name' })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({ description: 'Account number' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiPropertyOptional({ description: 'Bank code' })
  @IsOptional()
  @IsString()
  bankCode?: string;

  @ApiPropertyOptional({ description: 'Bank short name' })
  @IsOptional()
  @IsString()
  bankShortName?: string;

  @ApiPropertyOptional({ description: 'Bank Identification Number (BIN)' })
  @IsOptional()
  @IsString()
  bin?: string;

  @ApiPropertyOptional({ description: 'Bank logo URL' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'Set as default account' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateBankAccountDto {
  @ApiPropertyOptional({ description: 'Bank name' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ description: 'Account holder name' })
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiPropertyOptional({ description: 'Account number' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ description: 'Bank code' })
  @IsOptional()
  @IsString()
  bankCode?: string;

  @ApiPropertyOptional({ description: 'Bank short name' })
  @IsOptional()
  @IsString()
  bankShortName?: string;

  @ApiPropertyOptional({ description: 'Bank Identification Number (BIN)' })
  @IsOptional()
  @IsString()
  bin?: string;

  @ApiPropertyOptional({ description: 'Bank logo URL' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'Account active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Set as default account' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class BankAccountResponseDto {
  @ApiProperty({ description: 'Bank account ID' })
  _id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Bank name' })
  bankName: string;

  @ApiProperty({ description: 'Account holder name' })
  accountName: string;

  @ApiProperty({ description: 'Account number' })
  accountNumber: string;

  @ApiPropertyOptional({ description: 'Bank code' })
  bankCode?: string;

  @ApiPropertyOptional({ description: 'Bank short name' })
  bankShortName?: string;

  @ApiPropertyOptional({ description: 'Bank Identification Number (BIN)' })
  bin?: string;

  @ApiPropertyOptional({ description: 'Bank logo URL' })
  logo?: string;

  @ApiProperty({ description: 'Account active status' })
  isActive: boolean;

  @ApiProperty({ description: 'Is default account' })
  isDefault: boolean;

  @ApiPropertyOptional({ description: 'Last used timestamp' })
  lastUsedAt?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class SetDefaultBankAccountDto {
  @ApiProperty({ description: 'Bank account ID to set as default' })
  @IsString()
  @IsNotEmpty()
  bankAccountId: string;
}
