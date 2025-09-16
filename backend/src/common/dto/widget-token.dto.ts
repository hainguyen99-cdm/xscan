import { ApiProperty } from '@nestjs/swagger';

export class WidgetTokenDto {
  @ApiProperty({ description: 'The generated widget token' })
  token: string;

  @ApiProperty({ description: 'ID of the streamer this token is for' })
  streamerId: string;

  @ApiProperty({ description: 'List of permissions granted to this token', type: [String] })
  permissions: string[];

  @ApiProperty({ description: 'Additional metadata for the token' })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'When the token expires' })
  expiresAt: Date;

  @ApiProperty({ description: 'When the token was created' })
  createdAt: Date;
} 