import { ApiProperty } from '@nestjs/swagger';

export class ImageSettingsResponseDto {
  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  url?: string;

  @ApiProperty({ enum: ['image', 'gif', 'video'] })
  mediaType: 'image' | 'gif' | 'video';

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  borderRadius: number;

  @ApiProperty()
  shadow: boolean;

  @ApiProperty()
  shadowColor: string;

  @ApiProperty()
  shadowBlur: number;

  @ApiProperty()
  shadowOffsetX: number;

  @ApiProperty()
  shadowOffsetY: number;
}

export class SoundSettingsResponseDto {
  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  url?: string;

  @ApiProperty()
  volume: number;

  @ApiProperty()
  fadeIn: number;

  @ApiProperty()
  fadeOut: number;

  @ApiProperty()
  loop: boolean;
}

export class AnimationSettingsResponseDto {
  @ApiProperty()
  enabled: boolean;

  @ApiProperty({ enum: ['fade', 'slide', 'bounce', 'zoom', 'none'] })
  animationType: 'fade' | 'slide' | 'bounce' | 'zoom' | 'none';

  @ApiProperty()
  duration: number;

  @ApiProperty({ enum: ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'] })
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';

  @ApiProperty({ enum: ['left', 'right', 'top', 'bottom'] })
  direction: 'left' | 'right' | 'top' | 'bottom';

  @ApiProperty()
  bounceIntensity: number;

  @ApiProperty()
  zoomScale: number;
}

export class StyleSettingsResponseDto {
  @ApiProperty()
  backgroundColor: string;

  @ApiProperty()
  textColor: string;

  @ApiProperty()
  accentColor: string;

  @ApiProperty()
  borderColor: string;

  @ApiProperty()
  borderWidth: number;

  @ApiProperty({ enum: ['solid', 'dashed', 'dotted', 'none'] })
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';

  @ApiProperty()
  fontFamily: string;

  @ApiProperty()
  fontSize: number;

  @ApiProperty()
  fontWeight: string;

  @ApiProperty({ enum: ['normal', 'italic'] })
  fontStyle: 'normal' | 'italic';

  @ApiProperty()
  textShadow: boolean;

  @ApiProperty()
  textShadowColor: string;

  @ApiProperty()
  textShadowBlur: number;

  @ApiProperty()
  textShadowOffsetX: number;

  @ApiProperty()
  textShadowOffsetY: number;
}

export class PositionSettingsResponseDto {
  @ApiProperty()
  x: number;

  @ApiProperty()
  y: number;

  @ApiProperty({ 
    enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'] 
  })
  anchor: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

  @ApiProperty()
  zIndex: number;

  @ApiProperty()
  responsive: boolean;

  @ApiProperty()
  mobileScale: number;
}

export class DisplaySettingsResponseDto {
  @ApiProperty()
  duration: number;

  @ApiProperty()
  fadeInDuration: number;

  @ApiProperty()
  fadeOutDuration: number;

  @ApiProperty()
  autoHide: boolean;

  @ApiProperty()
  showProgress: boolean;

  @ApiProperty()
  progressColor: string;

  @ApiProperty()
  progressHeight: number;
}

export class GeneralSettingsResponseDto {
  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  maxAlerts: number;

  @ApiProperty()
  alertSpacing: number;

  @ApiProperty()
  cooldown: number;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'urgent'] })
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export class OBSSettingsResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  streamerId: string;

  @ApiProperty()
  alertToken: string;

  @ApiProperty()
  imageSettings: ImageSettingsResponseDto;

  @ApiProperty()
  soundSettings: SoundSettingsResponseDto;

  @ApiProperty()
  animationSettings: AnimationSettingsResponseDto;

  @ApiProperty()
  styleSettings: StyleSettingsResponseDto;

  @ApiProperty()
  positionSettings: PositionSettingsResponseDto;

  @ApiProperty()
  displaySettings: DisplaySettingsResponseDto;

  @ApiProperty()
  generalSettings: GeneralSettingsResponseDto;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  lastUsedAt?: Date;

  @ApiProperty()
  totalAlerts: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 