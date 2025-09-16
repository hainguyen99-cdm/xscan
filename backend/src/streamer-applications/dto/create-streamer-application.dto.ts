import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';

export class CreateStreamerApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(['twitch', 'youtube', 'kick', 'facebook', 'other'])
  platform: 'twitch' | 'youtube' | 'kick' | 'facebook' | 'other';

  @IsUrl()
  channelUrl: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @IsNumber()
  @Min(0)
  monthlyViewers: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contentCategory: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reasonForApplying: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referrer?: string;
}



