import { IsNumber, IsString, IsOptional, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePayoutDto {
  @ApiProperty({ description: 'Amount in cents/smallest currency unit' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Currency code (e.g., USD, EUR)' })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Destination account (email, bank account, etc.)',
  })
  @IsString()
  destination: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Description of the payout' })
  @IsOptional()
  @IsString()
  description?: string;
}
