import { ApiProperty } from '@nestjs/swagger';

export class ScanResultDto {
  @ApiProperty({ description: 'Whether the file is safe to process' })
  isSafe: boolean;

  @ApiProperty({ description: 'List of detected threats', type: [String] })
  threats: string[];

  @ApiProperty({ description: 'MIME type of the file' })
  fileType: string;

  @ApiProperty({ description: 'Size of the file in bytes' })
  fileSize: number;

  @ApiProperty({ description: 'SHA-256 hash of the file' })
  hash: string;

  @ApiProperty({ description: 'Timestamp when the scan was performed' })
  scanTimestamp: Date;
} 