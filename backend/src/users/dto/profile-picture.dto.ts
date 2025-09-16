import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class ProfilePictureDto {
  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  profilePicture?: string;
}

export class UploadProfilePictureDto {
  @ApiProperty({
    description: 'Profile picture file',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}

export class CoverPhotoDto {
  @ApiProperty({
    description: 'Cover photo URL',
    example: 'https://example.com/cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  coverPhoto?: string;
}

export class UploadCoverPhotoDto {
  @ApiProperty({
    description: 'Cover photo file',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}
