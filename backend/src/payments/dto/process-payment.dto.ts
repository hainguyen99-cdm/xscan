import {
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
}

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Wallet ID to process payment for' })
  @IsString()
  walletId: string;

  @ApiProperty({ description: 'Amount in cents/smallest currency unit' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Currency code (e.g., USD, EUR)' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Type of payment operation' })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @ApiPropertyOptional({ description: 'Destination wallet ID for transfers' })
  @IsOptional()
  @IsString()
  destinationWalletId?: string;

  @ApiPropertyOptional({ description: 'Description of the payment' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
