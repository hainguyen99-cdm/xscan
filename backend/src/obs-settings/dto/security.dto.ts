import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, IsDateString, IsEnum, ValidateNested, IsIP } from 'class-validator';
import { Type } from 'class-transformer';

export enum SecurityViolationType {
  INVALID_TOKEN = 'invalid_token',
  IP_BLOCKED = 'ip_blocked',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  REPLAY_ATTACK = 'replay_attack',
  SIGNATURE_MISMATCH = 'signature_mismatch',
}

export class SecurityViolationDto {
  @ApiProperty({ enum: SecurityViolationType })
  @IsEnum(SecurityViolationType)
  type: SecurityViolationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  details?: string;

  @ApiProperty()
  @IsDateString()
  timestamp: string;
}

export class SecuritySettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  tokenExpiresAt?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsIP(4, { each: true })
  allowedIPs?: string[];

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @IsNumber()
  maxConnections?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  requireIPValidation?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  requireRequestSigning?: boolean;
}

export class UpdateSecuritySettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => SecuritySettingsDto)
  securitySettings?: SecuritySettingsDto;
}

export class RevokeTokenDto {
  @ApiPropertyOptional({ default: 'Manual revocation' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SecurityAuditResponseDto {
  @ApiProperty()
  @IsString()
  streamerId: string;

  @ApiProperty({ type: [SecurityViolationDto] })
  @ValidateNested({ each: true })
  @Type(() => SecurityViolationDto)
  violations: SecurityViolationDto[];

  @ApiProperty()
  @IsNumber()
  totalViolations: number;

  @ApiProperty()
  @IsDateString()
  lastSecurityAudit: string;
}

export class RequestSignatureDto {
  @ApiProperty()
  @IsNumber()
  timestamp: number;

  @ApiProperty()
  @IsString()
  nonce: string;

  @ApiProperty()
  @IsString()
  signature: string;
}

export class SecurityStatusDto {
  @ApiProperty()
  @IsString()
  streamerId: string;

  @ApiProperty()
  @IsBoolean()
  isTokenActive: boolean;

  @ApiProperty()
  @IsBoolean()
  isTokenRevoked: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  revocationReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  revokedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  tokenExpiresAt?: string;

  @ApiProperty()
  @IsBoolean()
  requireIPValidation: boolean;

  @ApiProperty()
  @IsBoolean()
  requireRequestSigning: boolean;

  @ApiProperty()
  @IsNumber()
  maxConnections: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  allowedIPs: string[];

  @ApiProperty()
  @IsNumber()
  totalViolations: number;

  @ApiProperty()
  @IsDateString()
  lastSecurityAudit: string;
} 