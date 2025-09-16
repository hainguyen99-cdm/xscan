import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsArray } from 'class-validator';

export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  PDF = 'pdf',
}

export class ProfileExportDto {
  @ApiProperty({
    description: 'Export format',
    enum: ExportFormat,
    example: ExportFormat.JSON,
    required: false,
    default: ExportFormat.JSON,
  })
  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat;

  @ApiProperty({
    description: 'Fields to include in export',
    example: ['username', 'email', 'firstName', 'lastName'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  fields?: string[];

  @ApiProperty({
    description: 'Include sensitive data in export',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  includeSensitiveData?: boolean;
}
