import { IsBoolean, IsDateString, IsNumber, IsPositive, IsString, Length } from 'class-validator';

export class CreateHistoryDto {
  @IsString()
  @Length(1, 100)
  clientId: string;

  @IsString()
  @Length(3, 3)
  from: string;

  @IsString()
  @Length(3, 3)
  to: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  rate: number;

  @IsNumber()
  result: number;

  @IsDateString()
  rateDate: string;

  @IsBoolean()
  isHistorical: boolean;
}
