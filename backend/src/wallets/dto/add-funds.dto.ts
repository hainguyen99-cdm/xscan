import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AddFundsDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
