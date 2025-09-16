import { IsString, IsBoolean, IsNumber, IsOptional, IsEnum, IsUrl, Min, Max, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ImageSettingsDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ enum: ['image', 'gif', 'video'], default: 'image' })
  @IsOptional()
  @IsEnum(['image', 'gif', 'video'])
  mediaType?: 'image' | 'gif' | 'video';

  @ApiPropertyOptional({ minimum: 50, maximum: 1920, default: 300 })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(1920)
  width?: number;

  @ApiPropertyOptional({ minimum: 50, maximum: 1080, default: 200 })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(1080)
  height?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 50, default: 8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  borderRadius?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  shadow?: boolean;

  @ApiPropertyOptional({ default: '#000000' })
  @IsOptional()
  @IsString()
  shadowColor?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 50, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  shadowBlur?: number;

  @ApiPropertyOptional({ minimum: -20, maximum: 20, default: 2 })
  @IsOptional()
  @IsNumber()
  @Min(-20)
  @Max(20)
  shadowOffsetX?: number;

  @ApiPropertyOptional({ minimum: -20, maximum: 20, default: 2 })
  @IsOptional()
  @IsNumber()
  @Min(-20)
  @Max(20)
  shadowOffsetY?: number;
}

export class SoundSettingsDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 100, default: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  volume?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 5000, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5000)
  fadeIn?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 5000, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5000)
  fadeOut?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  loop?: boolean;
}

export class AnimationSettingsDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ enum: ['fade', 'slide', 'bounce', 'zoom', 'none'], default: 'fade' })
  @IsOptional()
  @IsEnum(['fade', 'slide', 'bounce', 'zoom', 'none'])
  animationType?: 'fade' | 'slide' | 'bounce' | 'zoom' | 'none';

  @ApiPropertyOptional({ minimum: 200, maximum: 5000, default: 500 })
  @IsOptional()
  @IsNumber()
  @Min(200)
  @Max(5000)
  duration?: number;

  @ApiPropertyOptional({ enum: ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'], default: 'ease-out' })
  @IsOptional()
  @IsEnum(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'])
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';

  @ApiPropertyOptional({ enum: ['left', 'right', 'top', 'bottom'], default: 'right' })
  @IsOptional()
  @IsEnum(['left', 'right', 'top', 'bottom'])
  direction?: 'left' | 'right' | 'top' | 'bottom';

  @ApiPropertyOptional({ minimum: 0, maximum: 100, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bounceIntensity?: number;

  @ApiPropertyOptional({ minimum: 0.1, maximum: 3, default: 1.2 })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(3)
  zoomScale?: number;
}

export class StyleSettingsDto {
  @ApiPropertyOptional({ default: '#1a1a1a' })
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiPropertyOptional({ default: '#ffffff' })
  @IsOptional()
  @IsString()
  textColor?: string;

  @ApiPropertyOptional({ default: '#00ff00' })
  @IsOptional()
  @IsString()
  accentColor?: string;

  @ApiPropertyOptional({ default: '#333333' })
  @IsOptional()
  @IsString()
  borderColor?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 10, default: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  borderWidth?: number;

  @ApiPropertyOptional({ enum: ['solid', 'dashed', 'dotted', 'none'], default: 'solid' })
  @IsOptional()
  @IsEnum(['solid', 'dashed', 'dotted', 'none'])
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';

  @ApiPropertyOptional({ default: 'Arial, sans-serif' })
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiPropertyOptional({ minimum: 12, maximum: 72, default: 16 })
  @IsOptional()
  @IsNumber()
  @Min(12)
  @Max(72)
  fontSize?: number;

  @ApiPropertyOptional({ enum: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'], default: 'normal' })
  @IsOptional()
  @IsEnum(['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'])
  fontWeight?: string;

  @ApiPropertyOptional({ enum: ['normal', 'italic'], default: 'normal' })
  @IsOptional()
  @IsEnum(['normal', 'italic'])
  fontStyle?: 'normal' | 'italic';

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  textShadow?: boolean;

  @ApiPropertyOptional({ default: '#000000' })
  @IsOptional()
  @IsString()
  textShadowColor?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 20, default: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  textShadowBlur?: number;

  @ApiPropertyOptional({ minimum: -10, maximum: 10, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(-10)
  @Max(10)
  textShadowOffsetX?: number;

  @ApiPropertyOptional({ minimum: -10, maximum: 10, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(-10)
  @Max(10)
  textShadowOffsetY?: number;
}

export class PositionSettingsDto {
  @ApiPropertyOptional({ minimum: 0, maximum: 1920, default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1920)
  x?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 1080, default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1080)
  y?: number;

  @ApiPropertyOptional({ 
    enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'], 
    default: 'top-left' 
  })
  @IsOptional()
  @IsEnum(['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'])
  anchor?: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

  @ApiPropertyOptional({ minimum: 0, maximum: 9999, default: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(9999)
  zIndex?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  responsive?: boolean;

  @ApiPropertyOptional({ minimum: 0.1, maximum: 2, default: 0.8 })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(2)
  mobileScale?: number;
}

export class DisplaySettingsDto {
  @ApiPropertyOptional({ minimum: 1000, maximum: 30000, default: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(30000)
  duration?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 5000, default: 300 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5000)
  fadeInDuration?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 5000, default: 300 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5000)
  fadeOutDuration?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  autoHide?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  showProgress?: boolean;

  @ApiPropertyOptional({ default: '#00ff00' })
  @IsOptional()
  @IsString()
  progressColor?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 20, default: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  progressHeight?: number;
}

export class GeneralSettingsDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ minimum: 1, maximum: 10, default: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxAlerts?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  alertSpacing?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 60000, default: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60000)
  cooldown?: number;

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export class CreateOBSSettingsDto {
  @ApiProperty({ description: 'ID of the streamer/KOL user' })
  @IsMongoId()
  streamerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  imageSettings?: ImageSettingsDto;

  @ApiPropertyOptional()
  @IsOptional()
  soundSettings?: SoundSettingsDto;

  @ApiPropertyOptional()
  @IsOptional()
  animationSettings?: AnimationSettingsDto;

  @ApiPropertyOptional()
  @IsOptional()
  styleSettings?: StyleSettingsDto;

  @ApiPropertyOptional()
  @IsOptional()
  positionSettings?: PositionSettingsDto;

  @ApiPropertyOptional()
  @IsOptional()
  displaySettings?: DisplaySettingsDto;

  @ApiPropertyOptional()
  @IsOptional()
  generalSettings?: GeneralSettingsDto;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 