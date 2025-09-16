import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsMongoId,
  MaxLength,
} from 'class-validator';

export class TransferFundsDto {
  @IsString()
  @IsMongoId()
  toWalletId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
