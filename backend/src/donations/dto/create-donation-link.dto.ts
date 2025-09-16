import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  IsUrl,
  IsHexColor,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ThemeDto {
  @ApiProperty({
    description: 'Primary color in hex format',
    example: '#3B82F6',
  })
  @IsHexColor()
  primaryColor: string;

  @ApiProperty({
    description: 'Secondary color in hex format',
    example: '#1E40AF',
  })
  @IsHexColor()
  secondaryColor: string;

  @ApiProperty({
    description: 'Background color in hex format',
    example: '#FFFFFF',
  })
  @IsHexColor()
  backgroundColor: string;

  @ApiProperty({ description: 'Text color in hex format', example: '#1F2937' })
  @IsHexColor()
  textColor: string;
}

export class CreateDonationLinkDto {
  @ApiProperty({
    description: 'Unique slug for the donation link',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  slug: string;

  @ApiProperty({
    description: 'Title of the donation link',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the donation link',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ 
    description: 'Custom URL slug for the donation page (alphanumeric and hyphens only)',
    example: 'my-donation-page'
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'Custom URL can only contain letters, numbers, and hyphens'
  })
  customUrl: string;

  @ApiPropertyOptional({
    description: 'Whether to allow anonymous donations',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  allowAnonymous?: boolean;

  @ApiProperty({ description: 'Theme customization for the donation page' })
  @ValidateNested()
  @Type(() => ThemeDto)
  theme: ThemeDto;

  @ApiPropertyOptional({ description: 'Social media links for sharing' })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  socialMediaLinks?: string[];

  @ApiPropertyOptional({
    description: 'Whether the link is featured',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Expiration date for the donation link' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
