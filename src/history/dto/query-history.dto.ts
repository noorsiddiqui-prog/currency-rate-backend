import { IsString, Length } from 'class-validator';

export class QueryHistoryDto {
  @IsString()
  @Length(1, 100)
  clientId: string;
}
