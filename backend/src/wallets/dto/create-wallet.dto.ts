import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateWalletDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['VND'])
  currency?: string = 'VND';
}
