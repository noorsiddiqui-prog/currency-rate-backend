import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class TrendDto {
  @IsString()
  @Length(3, 3)
  from: string;

  @IsString()
  @Length(3, 3)
  to: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(30)
  days?: number;
}
