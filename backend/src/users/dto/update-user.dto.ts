import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsDate, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @ApiProperty({
    description: 'Last login timestamp',
    required: false,
  })
  @IsOptional()
  @IsDate()
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Whether the user account is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
