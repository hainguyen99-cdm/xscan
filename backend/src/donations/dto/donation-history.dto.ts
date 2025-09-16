import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class DonationHistoryQueryDto {
  @ApiProperty({ required: false, description: 'Filter by streamer ID' })
  @IsOptional()
  @IsString()
  streamerId?: string;

  @ApiProperty({ required: false, description: 'Filter by donor ID' })
  @IsOptional()
  @IsString()
  donorId?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by donation status',
    enum: ['pending', 'completed', 'failed', 'cancelled'],
  })
  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed', 'cancelled'])
  status?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by payment method',
    enum: ['wallet', 'stripe', 'paypal', 'bank_transfer'],
  })
  @IsOptional()
  @IsEnum(['wallet', 'stripe', 'paypal', 'bank_transfer'])
  paymentMethod?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by currency',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
  })
  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'])
  currency?: string;

  @ApiProperty({
    required: false,
    description: 'Minimum donation amount',
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  minAmount?: number;

  @ApiProperty({
    required: false,
    description: 'Maximum donation amount',
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  maxAmount?: number;

  @ApiProperty({ required: false, description: 'Start date (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'End date (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, description: 'Filter anonymous donations' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isAnonymous?: boolean;

  @ApiProperty({
    required: false,
    description: 'Sort field',
    enum: ['createdAt', 'amount', 'status', 'paymentMethod'],
  })
  @IsOptional()
  @IsEnum(['createdAt', 'amount', 'status', 'paymentMethod'])
  sortBy?: string = 'createdAt';

  @ApiProperty({
    required: false,
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    required: false,
    description: 'Number of results per page',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiProperty({ required: false, description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;
}

export class TopDonorsQueryDto {
  @ApiProperty({
    required: false,
    description: 'Number of top donors to return',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiProperty({
    required: false,
    description: 'Time range',
    enum: ['24h', '7d', '30d', '90d'],
  })
  @IsOptional()
  @IsEnum(['24h', '7d', '30d', '90d'])
  timeRange?: string;
}

export class DonationAnalyticsQueryDto {
  @ApiProperty({ required: false, description: 'Filter by streamer ID' })
  @IsOptional()
  @IsString()
  streamerId?: string;

  @ApiProperty({
    required: false,
    description: 'Time range',
    enum: ['24h', '7d', '30d', '90d'],
  })
  @IsOptional()
  @IsEnum(['24h', '7d', '30d', '90d'])
  timeRange?: string;
}

export class DonationTrendsQueryDto {
  @ApiProperty({ required: false, description: 'Filter by streamer ID' })
  @IsOptional()
  @IsString()
  streamerId?: string;

  @ApiProperty({
    required: false,
    description: 'Time period',
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
  })
  @IsOptional()
  @IsEnum(['hourly', 'daily', 'weekly', 'monthly'])
  period?: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily';

  @ApiProperty({
    required: false,
    description: 'Number of days to analyze',
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  @Transform(({ value }) => parseInt(value))
  days?: number = 30;
}

export class DonationComparisonQueryDto {
  @ApiProperty({ required: false, description: 'Filter by streamer ID' })
  @IsOptional()
  @IsString()
  streamerId?: string;

  @ApiProperty({
    required: false,
    description: 'Current period',
    enum: ['24h', '7d', '30d', '90d'],
  })
  @IsOptional()
  @IsEnum(['24h', '7d', '30d', '90d'])
  currentPeriod?: string = '30d';

  @ApiProperty({
    required: false,
    description: 'Previous period',
    enum: ['24h', '7d', '30d', '90d'],
  })
  @IsOptional()
  @IsEnum(['24h', '7d', '30d', '90d'])
  previousPeriod?: string = '30d';
}
