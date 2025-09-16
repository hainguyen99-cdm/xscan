import { ApiProperty } from '@nestjs/swagger';

export class WidgetUrlResponseDto {
  @ApiProperty({
    description: 'Widget URL for OBS Browser Source',
    example: 'https://xscan.com/widget/alert/streamer-123'
  })
  widgetUrl: string;

  @ApiProperty({
    description: 'Streamer ID',
    example: 'streamer-123'
  })
  streamerId: string;

  @ApiProperty({
    description: 'Alert token (masked for security)',
    example: 'abc123de...'
  })
  alertToken: string;
}

export class WidgetConnectionStatusDto {
  @ApiProperty({
    description: 'Number of connected OBS widgets',
    example: 2
  })
  connectedWidgets: number;

  @ApiProperty({
    description: 'Whether the widget is currently connected',
    example: true
  })
  isConnected: boolean;

  @ApiProperty({
    description: 'Last connection timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  lastConnected?: string;
}

export class FullWidgetUrlResponseDto {
  @ApiProperty({
    description: 'Widget URL without token',
    example: 'https://xscan.com/widget/alert/streamer-123'
  })
  widgetUrl: string;

  @ApiProperty({
    description: 'Streamer ID',
    example: 'streamer-123'
  })
  streamerId: string;

  @ApiProperty({
    description: 'Full alert token for verification',
    example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
  })
  alertToken: string;

  @ApiProperty({
    description: 'Complete widget URL with format: {domain}/widget/alert/{streamerId}/{alertToken}',
    example: 'https://xscan.com/widget/alert/streamer-123/abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
  })
  fullUrl: string;
}

export class TokenVerificationResponseDto {
  @ApiProperty({
    description: 'Whether the alert token is valid',
    example: true
  })
  isValid: boolean;

  @ApiProperty({
    description: 'Streamer user ID',
    example: 'streamer-123'
  })
  streamerId: string;

  @ApiProperty({
    description: 'The alert token being verified',
    example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
  })
  alertToken: string;

  @ApiProperty({
    description: 'Widget URL format: {domain}/widget/alert/{streamerId}/{alertToken}',
    example: 'https://xscan.com/widget/alert/streamer-123/abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
  })
  widgetUrl: string;

  @ApiProperty({
    description: 'Verification message',
    example: 'Alert token verified successfully'
  })
  message: string;
}

export class TokenRenderResponseDto {
  @ApiProperty({
    description: 'Streamer user ID',
    example: 'streamer-123'
  })
  streamerId: string;

  @ApiProperty({
    description: 'The alert token for the streamer',
    example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
  })
  alertToken: string;

  @ApiProperty({
    description: 'Widget URL format: {domain}/widget/alert/{streamerId}/{alertToken}',
    example: 'https://xscan.com/widget/alert/streamer-123/abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
  })
  widgetUrl: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Alert token rendered successfully for Widget URL'
  })
  message: string;
} 