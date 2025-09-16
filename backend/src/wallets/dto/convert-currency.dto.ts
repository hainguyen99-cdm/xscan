import { IsNumber, IsString, IsOptional, Min, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConvertCurrencyDto {
  @ApiProperty({
    description: 'Amount to convert',
    example: 100.5,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Source currency code',
    example: 'VND',
    enum: ['VND'],
  })
  @IsString()
  @IsIn(['VND'])
  fromCurrency: string;

  @ApiProperty({
    description: 'Target currency code',
    example: 'VND',
    enum: ['VND'],
  })
  @IsString()
  @IsIn(['VND'])
  toCurrency: string;

  @ApiPropertyOptional({
    description: 'Optional description for the conversion',
    example: 'Currency conversion for international transfer',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
