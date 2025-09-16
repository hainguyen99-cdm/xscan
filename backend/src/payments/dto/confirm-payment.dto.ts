import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Payment intent ID' })
  @IsString()
  paymentIntentId: string;

  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}
