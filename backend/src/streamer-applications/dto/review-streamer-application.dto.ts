import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewStreamerApplicationDto {
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}



