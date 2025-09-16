import { IsString, IsOptional, IsNumber, IsEnum, IsUrl, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ImageCustomizationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string; // Accept both URLs and base64 data URLs

  @ApiPropertyOptional({ enum: ['image', 'gif', 'video'] })
  @IsOptional()
  @IsEnum(['image', 'gif', 'video'])
  type?: 'image' | 'gif' | 'video';

  @ApiPropertyOptional({ minimum: 1, maximum: 30000 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30000)
  duration?: number;
}

export class SoundCustomizationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string; // Accept both URLs and base64 data URLs

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  volume?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 30000 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30000)
  duration?: number;
}

export class TextCustomizationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  font?: string;

  @ApiPropertyOptional({ minimum: 8, maximum: 72 })
  @IsOptional()
  @IsNumber()
  @Min(8)
  @Max(72)
  fontSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiPropertyOptional({ enum: ['fade', 'slide', 'bounce', 'none'] })
  @IsOptional()
  @IsEnum(['fade', 'slide', 'bounce', 'none'])
  animation?: 'fade' | 'slide' | 'bounce' | 'none';
}

export class CustomizationDto {
  @ApiPropertyOptional()
  @IsOptional()
  image?: ImageCustomizationDto;

  @ApiPropertyOptional()
  @IsOptional()
  sound?: SoundCustomizationDto;

  @ApiPropertyOptional()
  @IsOptional()
  text?: TextCustomizationDto;

  @ApiPropertyOptional({ enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] })
  @IsOptional()
  @IsEnum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'])
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

  @ApiPropertyOptional({ minimum: 1, maximum: 30000 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30000)
  duration?: number;
}

export class UpdateOBSSettingsDto {
  @ApiPropertyOptional({ description: 'Alert token for OBS widget (optional, read-only)' })
  @IsOptional()
  @IsString()
  alertToken?: string;

  @ApiPropertyOptional({ description: 'Customization settings for OBS widget' })
  @IsOptional()
  customization?: CustomizationDto;
} 