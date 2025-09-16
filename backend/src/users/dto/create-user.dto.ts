import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username for the user account',
    example: 'johndoe',
    minLength: 3,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @ApiProperty({
    description: 'Email address for the user account',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    minLength: 2,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
    required: false,
    default: 'User',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1-555-123-4567',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[\d\s\-\(\)]+$/, { message: 'Phone number format is invalid' })
  phone?: string;

  @ApiProperty({
    description: 'Address of the user',
    example: '123 Main St, City, State 12345',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({
    description: 'URL to the user profile picture',
    example: 'https://example.com/profile.jpg',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  profilePicture?: string;

  @ApiProperty({
    description: 'URL to the user cover photo',
    example: 'https://example.com/cover.jpg',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverPhoto?: string;

  @ApiProperty({
    description: 'User bio/description',
    example: 'Passionate content creator sharing amazing moments!',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiProperty({
    description: 'User location',
    example: 'New York, NY',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiProperty({
    description: 'User website URL',
    example: 'https://example.com',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;

  @ApiProperty({
    description: 'Role of the user',
    example: 'donor',
    enum: ['admin', 'streamer', 'donor'],
    required: false,
    default: 'donor',
  })
  @IsOptional()
  @IsEnum(['admin', 'streamer', 'donor'])
  role?: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
