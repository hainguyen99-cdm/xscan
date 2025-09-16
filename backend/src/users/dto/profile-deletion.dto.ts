import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class ProfileDeletionDto {
  @ApiProperty({
    description: 'Reason for account deletion',
    example: 'No longer using the service',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  reason?: string;

  @ApiProperty({
    description: 'Password confirmation for account deletion',
    example: 'currentPassword123',
    required: true,
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Whether to export data before deletion',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  exportData?: boolean;
}
