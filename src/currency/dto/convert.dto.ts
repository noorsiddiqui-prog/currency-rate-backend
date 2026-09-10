import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator';

export class ConvertDto {
  @IsString()
  @Length(3, 3)
  from: string;

  @IsString()
  @Length(3, 3)
  to: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
