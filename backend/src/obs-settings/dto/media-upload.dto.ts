import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MediaUploadResponseDto {
  @ApiProperty({ description: 'Unique filename of the uploaded media' })
  filename: string;

  @ApiProperty({ description: 'Original filename of the uploaded media' })
  originalName: string;

  @ApiProperty({ description: 'CDN URL where the media can be accessed' })
  url: string;

  @ApiProperty({ description: 'Type of media (image, gif, video, audio)' })
  type: 'image' | 'gif' | 'video' | 'audio';

  @ApiProperty({ description: 'Size of the media file in bytes' })
  size: number;

  @ApiPropertyOptional({ description: 'Dimensions of the media (width x height)' })
  dimensions?: { width: number; height: number };

  @ApiPropertyOptional({ description: 'Duration of the media in seconds' })
  duration?: number;

  @ApiProperty({ description: 'MIME type of the media file' })
  mimeType: string;
}

export class MediaUploadRequestDto {
  @ApiProperty({ description: 'Streamer ID for whom the media is being uploaded' })
  @IsString()
  streamerId: string;

  @ApiProperty({ description: 'Type of media being uploaded' })
  @IsEnum(['image', 'gif', 'video', 'audio'])
  mediaType: 'image' | 'gif' | 'video' | 'audio';
}

export class MediaDeleteRequestDto {
  @ApiProperty({ description: 'Filename of the media to delete' })
  @IsString()
  filename: string;

  @ApiProperty({ description: 'Type of media to delete' })
  @IsEnum(['image', 'gif', 'video', 'audio'])
  mediaType: 'image' | 'gif' | 'video' | 'audio';
}

export class MediaValidationDto {
  @ApiProperty({ description: 'Maximum file size in bytes' })
  @IsNumber()
  maxSize: number;

  @ApiProperty({ description: 'Allowed MIME types' })
  @IsString({ each: true })
  allowedTypes: string[];

  @ApiPropertyOptional({ description: 'Maximum duration in seconds (for video/audio)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  maxDuration?: number;

  @ApiPropertyOptional({ description: 'Maximum dimensions (width x height)' })
  @IsOptional()
  maxDimensions?: { width: number; height: number };
}

export class MediaSettingsDto {
  @ApiProperty({ description: 'Whether media is enabled' })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'URL of the media file' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'Type of media' })
  @IsOptional()
  @IsEnum(['image', 'gif', 'video'])
  type?: 'image' | 'gif' | 'video';

  @ApiPropertyOptional({ description: 'Width of the media' })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(1920)
  width?: number;

  @ApiPropertyOptional({ description: 'Height of the media' })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(1080)
  height?: number;

  @ApiPropertyOptional({ description: 'Border radius of the media' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  borderRadius?: number;

  @ApiPropertyOptional({ description: 'Whether shadow is enabled' })
  @IsOptional()
  @IsBoolean()
  shadow?: boolean;

  @ApiPropertyOptional({ description: 'Shadow color' })
  @IsOptional()
  @IsString()
  shadowColor?: string;

  @ApiPropertyOptional({ description: 'Shadow blur amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  shadowBlur?: number;

  @ApiPropertyOptional({ description: 'Shadow X offset' })
  @IsOptional()
  @IsNumber()
  @Min(-20)
  @Max(20)
  shadowOffsetX?: number;

  @ApiPropertyOptional({ description: 'Shadow Y offset' })
  @IsOptional()
  @IsNumber()
  @Min(-20)
  @Max(20)
  shadowOffsetY?: number;
}

export class AudioSettingsDto {
  @ApiProperty({ description: 'Whether audio is enabled' })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'URL of the audio file' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'Volume level (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  volume?: number;

  @ApiPropertyOptional({ description: 'Fade in duration in milliseconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5000)
  fadeIn?: number;

  @ApiPropertyOptional({ description: 'Fade out duration in milliseconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5000)
  fadeOut?: number;

  @ApiPropertyOptional({ description: 'Whether audio should loop' })
  @IsOptional()
  @IsBoolean()
  loop?: boolean;
}

export class MediaUploadProgressDto {
  @ApiProperty({ description: 'Upload progress percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({ description: 'Current upload status' })
  @IsString()
  status: 'uploading' | 'processing' | 'completed' | 'failed';

  @ApiPropertyOptional({ description: 'Error message if upload failed' })
  @IsOptional()
  @IsString()
  error?: string;

  @ApiPropertyOptional({ description: 'Uploaded media info when completed' })
  @IsOptional()
  media?: MediaUploadResponseDto;
} 