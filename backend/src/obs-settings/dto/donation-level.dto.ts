import { IsString, IsNumber, IsBoolean, IsOptional, IsObject, Min, Max } from 'class-validator';

export class CreateDonationLevelDto {
  @IsString()
  levelName: string;

  @IsNumber()
  @Min(0)
  minAmount: number;

  @IsNumber()
  @Min(0)
  maxAmount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'VND';

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean = true;

  @IsObject()
  @IsOptional()
  configuration?: {
    imageSettings?: any;
    soundSettings?: any;
    animationSettings?: any;
    styleSettings?: any;
    positionSettings?: any;
    displaySettings?: any;
    generalSettings?: any;
  };
}

export class UpdateDonationLevelDto {
  @IsString()
  @IsOptional()
  levelName?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxAmount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsObject()
  @IsOptional()
  configuration?: {
    imageSettings?: any;
    soundSettings?: any;
    animationSettings?: any;
    styleSettings?: any;
    positionSettings?: any;
    displaySettings?: any;
    generalSettings?: any;
  };
}

export class DonationLevelResponseDto {
  levelId: string;
  levelName: string;
  minAmount: number;
  maxAmount: number;
  currency: string;
  isEnabled: boolean;
  configuration: {
    imageSettings?: any;
    soundSettings?: any;
    animationSettings?: any;
    styleSettings?: any;
    positionSettings?: any;
    displaySettings?: any;
    generalSettings?: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class DonationLevelFormDto {
  @IsString()
  levelName: string;

  @IsNumber()
  @Min(0)
  minAmount: number;

  @IsNumber()
  @Min(0)
  maxAmount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'VND';

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean = true;

  // Frontend customization format
  customization?: {
    image?: {
      url?: string;
      type?: 'image' | 'gif' | 'video';
      duration?: number;
    };
    sound?: {
      url?: string;
      volume?: number;
      duration?: number;
    };
    text?: {
      font?: string;
      fontSize?: number;
      color?: string;
      backgroundColor?: string;
      animation?: string;
    };
    position?: string;
    duration?: number;
  };
}
