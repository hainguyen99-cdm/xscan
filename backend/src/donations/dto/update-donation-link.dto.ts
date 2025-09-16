import { PartialType } from '@nestjs/swagger';
import { CreateDonationLinkDto, ThemeDto } from './create-donation-link.dto';
import { IsArray, IsOptional, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDonationLinkDto extends PartialType(CreateDonationLinkDto) {
  qrCodeUrl?: string;
}

export class UpdateThemeDto extends PartialType(ThemeDto) {}

export class UpdateSocialMediaDto {
  @ApiPropertyOptional({ description: 'Array of social media URLs' })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  socialMediaLinks?: string[];
}

export class AnalyticsEventDto {
  @ApiPropertyOptional({ description: 'Type of analytics event' })
  eventType: string;

  @ApiPropertyOptional({ description: 'Additional metadata for the event' })
  metadata?: any;
}
