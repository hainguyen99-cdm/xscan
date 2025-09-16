import { IsString, IsOptional, IsBoolean, IsObject, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PresetDto {
  @ApiProperty({ description: 'Unique identifier for the preset' })
  @IsString()
  presetId: string;

  @ApiProperty({ description: 'Name of the preset' })
  @IsString()
  presetName: string;

  @ApiPropertyOptional({ description: 'Description of the preset' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Configuration data for the preset' })
  @IsObject()
  configuration: any;

  @ApiProperty({ description: 'When the preset was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the preset was last updated' })
  updatedAt: Date;
}

export class SavePresetDto {
  @ApiProperty({ description: 'Name for the preset' })
  @IsString()
  presetName: string;

  @ApiPropertyOptional({ description: 'Optional description for the preset' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ValidationErrorDto {
  @ApiProperty({ description: 'Field that has the error' })
  @IsString()
  field: string;

  @ApiProperty({ description: 'Error message' })
  @IsString()
  message: string;
}

export class ValidationWarningDto {
  @ApiProperty({ description: 'Field that has the warning' })
  @IsString()
  field: string;

  @ApiProperty({ description: 'Warning message' })
  @IsString()
  message: string;
}

export class ConfigurationValidationDto {
  @ApiProperty({ description: 'Whether the configuration is valid' })
  isValid: boolean;

  @ApiProperty({ description: 'List of validation errors', type: [ValidationErrorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationErrorDto)
  errors: ValidationErrorDto[];

  @ApiProperty({ description: 'List of validation warnings', type: [ValidationWarningDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationWarningDto)
  warnings: ValidationWarningDto[];
}

export class ExportConfigurationDto {
  @ApiProperty({ description: 'Exported configuration data' })
  @IsObject()
  exportData: any;

  @ApiProperty({ description: 'Export date' })
  @IsString()
  exportDate: string;

  @ApiProperty({ description: 'Export version' })
  @IsString()
  version: string;
}

export class ImportConfigurationDto {
  @ApiProperty({ description: 'Configuration data to import' })
  @IsObject()
  importData: any;

  @ApiPropertyOptional({ description: 'Whether to overwrite existing settings', default: false })
  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;
}

export class TestResultDto {
  @ApiProperty({ description: 'Whether the test was successful' })
  success: boolean;

  @ApiProperty({ description: 'Detailed test results' })
  @IsObject()
  testResults: {
    mediaValidation: boolean;
    animationValidation: boolean;
    positionValidation: boolean;
    styleValidation: boolean;
  };

  @ApiProperty({ description: 'Test result message' })
  @IsString()
  message: string;
}

export class ResetSectionDto {
  @ApiProperty({ 
    description: 'Section to reset',
    enum: ['image', 'sound', 'animation', 'style', 'position', 'display', 'general']
  })
  @IsString()
  section: 'image' | 'sound' | 'animation' | 'style' | 'position' | 'display' | 'general';
}

export class TemplateDto {
  @ApiProperty({ description: 'Unique identifier for the template' })
  @IsString()
  templateId: string;

  @ApiProperty({ description: 'Name of the template' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the template' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Category of the template' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Preview image for the template' })
  @IsString()
  preview: string;
}

export class TestAlertDto {
  @ApiPropertyOptional({ description: 'Custom donor name for test alert', default: 'Test Donor' })
  @IsOptional()
  @IsString()
  donorName?: string;

  @ApiPropertyOptional({ description: 'Custom donation amount for test alert', default: 25.00 })
  @IsOptional()
  @IsString()
  amount?: string;

  @ApiPropertyOptional({ description: 'Custom message for test alert', default: 'This is a test alert!' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Whether to use current OBS settings or test with provided configuration' })
  @IsOptional()
  @IsBoolean()
  useCurrentSettings?: boolean;

  @ApiPropertyOptional({ description: 'Test configuration to use instead of current settings' })
  @IsOptional()
  @IsObject()
  testConfiguration?: any;
}

export class TestAlertResponseDto {
  @ApiProperty({ description: 'Whether the test alert was triggered successfully' })
  success: boolean;

  @ApiProperty({ description: 'Test alert ID' })
  @IsString()
  alertId: string;

  @ApiProperty({ description: 'Streamer ID' })
  @IsString()
  streamerId: string;

  @ApiProperty({ description: 'Alert data that was sent' })
  @IsObject()
  alertData: {
    donorName: string;
    amount: string;
    message: string;
    timestamp: Date;
  };

  @ApiProperty({ description: 'Widget URL for the test alert' })
  @IsString()
  widgetUrl: string;

  @ApiProperty({ description: 'Response message' })
  @IsString()
  message: string;
}

export class DonationAlertDto {
  @ApiProperty({ description: 'Donor name (or "Anonymous" for anonymous donations)' })
  @IsString()
  donorName: string;

  @ApiProperty({ description: 'Donation amount in the specified currency' })
  @IsString()
  amount: string;

  @ApiProperty({ description: 'Currency code, only VND is supported' })
  @IsString()
  currency: string;

  @ApiPropertyOptional({ description: 'Donor message (optional)' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: 'Donation ID for tracking purposes' })
  @IsString()
  donationId: string;

  @ApiProperty({ description: 'Payment method used (wallet, stripe, paypal)' })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ description: 'Transaction ID from payment provider' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ description: 'Whether this is an anonymous donation' })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({ description: 'Additional metadata for the donation' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class DonationAlertResponseDto {
  @ApiProperty({ description: 'Whether the donation alert was triggered successfully' })
  success: boolean;

  @ApiProperty({ description: 'Alert ID' })
  @IsString()
  alertId: string;

  @ApiProperty({ description: 'Streamer ID' })
  @IsString()
  streamerId: string;

  @ApiProperty({ description: 'Donation data that was sent' })
  @IsObject()
  alertData: {
    donorName: string;
    amount: string;
    currency: string;
    message?: string;
    donationId: string;
    paymentMethod: string;
    isAnonymous: boolean;
    timestamp: Date;
  };

  @ApiProperty({ description: 'Widget URL for the alert' })
  @IsString()
  widgetUrl: string;

  @ApiProperty({ description: 'Response message' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Number of connected OBS widgets that received the alert' })
  @IsString()
  connectedWidgets: number;
} 