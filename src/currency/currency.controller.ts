import { Controller, Get, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ConvertDto } from './dto/convert.dto';
import { TrendDto } from './dto/trend.dto';
import { ConvertResult, CurrencyInfo, TrendPoint } from './currency.types';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('list')
  async getCurrencies(): Promise<CurrencyInfo[]> {
    return this.currencyService.getCurrencies();
  }

  @Get('convert')
  async convert(@Query() query: ConvertDto): Promise<ConvertResult> {
    return this.currencyService.convert(query.from, query.to, query.amount, query.date);
  }

  @Get('trend')
  async getTrend(@Query() query: TrendDto): Promise<TrendPoint[]> {
    return this.currencyService.getTrend(query.from, query.to, query.days);
  }
}
