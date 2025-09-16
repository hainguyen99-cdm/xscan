import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsMongoId,
  Min,
  MaxLength,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateDonationDto {
  @IsOptional()
  @IsMongoId()
  donorId?: string; // null for anonymous donations

  @IsMongoId()
  streamerId: string;

  @IsMongoId()
  donationLinkId: string;

  @IsNumber()
  @Min(10000)
  amount: number;

  @IsString()
  @IsEnum(['VND', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'])
  currency: string = 'VND';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean = false;

  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed', 'cancelled'])
  status?: 'pending' | 'completed' | 'failed' | 'cancelled' = 'pending';

  @IsOptional()
  @IsEnum(['wallet', 'stripe', 'paypal', 'bank_transfer'])
  paymentMethod?: 'wallet' | 'stripe' | 'paypal' | 'bank_transfer' = 'wallet';

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  paymentIntentId?: string;

  @IsOptional()
  @IsNumber()
  processingFee?: number = 0;

  @IsOptional()
  @IsNumber()
  netAmount?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}
