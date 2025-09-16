import { IsString, IsOptional, IsIn, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetExchangeRateDto {
  @ApiProperty({
    description: 'Base currency code',
    example: 'VND',
    enum: ['VND'],
  })
  @IsString()
  @IsIn(['VND'])
  baseCurrency: string;

  @ApiPropertyOptional({
    description:
      'Target currency codes (if not provided, returns rates for all supported currencies)',
    example: ['VND'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCurrencies?: string[];
}
