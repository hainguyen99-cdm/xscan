import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Verify2FADto {
  @ApiProperty({
    description: 'Two-factor authentication code from authenticator app',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
