import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ScanType } from '../schemas/scan.schema';

export class CreateScanDto {
  @IsString()
  name: string;

  @IsString()
  target: string;

  @IsEnum(ScanType)
  type: ScanType;

  @IsString()
  userId: string;

  @IsOptional()
  @IsObject()
  configuration?: any;
}
