import { IsString, IsObject, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentWebhookDto {
  @ApiProperty({ description: 'Webhook event ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Type of webhook event' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Webhook event data' })
  @IsObject()
  data: any;

  @ApiProperty({ description: 'Timestamp when the event was created' })
  @IsNumber()
  created: number;

  @ApiPropertyOptional({
    description: 'Payment provider (stripe, paypal, etc.)',
  })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
