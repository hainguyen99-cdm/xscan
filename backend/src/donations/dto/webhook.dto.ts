import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsObject,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebhookPayloadDto {
  @ApiProperty({ description: 'Unique identifier for the webhook event' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Type of webhook event' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Webhook event data' })
  @IsObject()
  data: any;

  @ApiProperty({ description: 'Unix timestamp when the event was created' })
  @IsNumber()
  created: number;

  @ApiPropertyOptional({ description: 'Webhook signature for verification' })
  @IsOptional()
  @IsString()
  signature?: string;
}

export class StripeWebhookDto {
  @ApiProperty({ description: 'Stripe webhook signature' })
  @IsString()
  @IsNotEmpty()
  'stripe-signature': string;

  @ApiProperty({ description: 'Stripe webhook payload' })
  @IsObject()
  body: any;
}

export class PayPalWebhookDto {
  @ApiProperty({ description: 'PayPal webhook signature' })
  @IsString()
  @IsNotEmpty()
  'paypal-signature': string;

  @ApiProperty({ description: 'PayPal webhook payload' })
  @IsObject()
  body: any;
}

export class CustomWebhookDto {
  @ApiProperty({ description: 'Custom webhook signature' })
  @IsString()
  @IsNotEmpty()
  'x-signature': string;

  @ApiProperty({ description: 'Custom webhook payload' })
  @IsObject()
  body: any;
}

export class DonationWebhookDataDto {
  @ApiProperty({ description: 'Donation ID' })
  @IsString()
  @IsNotEmpty()
  donationId: string;

  @ApiProperty({ description: 'Donor information' })
  @IsObject()
  donor: {
    name?: string;
    email?: string;
    isAnonymous: boolean;
  };

  @ApiProperty({ description: 'Streamer/KOL ID' })
  @IsString()
  @IsNotEmpty()
  streamerId: string;

  @ApiProperty({ description: 'Donation amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiPropertyOptional({ description: 'Donation message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: 'Payment status' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class WebhookResponseDto {
  @ApiProperty({ description: 'Success status' })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: 'Response data' })
  @IsOptional()
  @IsObject()
  data?: any;

  @ApiPropertyOptional({ description: 'Timestamp of response' })
  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

export class WebhookStatsDto {
  @ApiProperty({ description: 'Total webhooks processed' })
  @IsNumber()
  totalWebhooks: number;

  @ApiProperty({ description: 'Successfully processed webhooks' })
  @IsNumber()
  successfulWebhooks: number;

  @ApiProperty({ description: 'Failed webhooks' })
  @IsNumber()
  failedWebhooks: number;

  @ApiProperty({ description: 'Average processing time in milliseconds' })
  @IsNumber()
  averageProcessingTime: number;

  @ApiProperty({ description: 'Last webhook processed timestamp' })
  @IsDateString()
  lastWebhookProcessed: string;
}
