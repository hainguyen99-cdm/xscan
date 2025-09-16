import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum ProfileVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS_ONLY = 'friends_only',
}

export class ProfilePrivacyDto {
  @ApiProperty({
    description: 'Profile visibility setting',
    enum: ProfileVisibility,
    example: ProfileVisibility.PUBLIC,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProfileVisibility)
  profileVisibility?: ProfileVisibility;

  @ApiProperty({
    description: 'Whether to show email in profile',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @ApiProperty({
    description: 'Whether to show phone in profile',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @ApiProperty({
    description: 'Whether to show address in profile',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  showAddress?: boolean;

  @ApiProperty({
    description: 'Whether to show last login time',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  showLastLogin?: boolean;
}
