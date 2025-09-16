import { IsString, IsNumber, IsOptional, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiProperty({ description: 'Payment intent ID to refund' })
  @IsString()
  paymentIntentId: string;

  @ApiPropertyOptional({
    description:
      'Amount to refund in cents/smallest currency unit (if not specified, refunds full amount)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiPropertyOptional({ description: 'Reason for the refund' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
