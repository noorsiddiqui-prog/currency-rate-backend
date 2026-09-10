import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  ConvertResult,
  CurrencyInfo,
  FreeCurrencyApiCurrenciesResponse,
  FreeCurrencyApiHistoricalResponse,
  FreeCurrencyApiRatesResponse,
  TrendPoint,
} from './currency.types';

const DEFAULT_TREND_DAYS = 7;

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly cacheTtlMs: number;

  private currenciesCache: { data: CurrencyInfo[]; expiresAt: number } | null = null;
  private readonly ratesCache = new Map<string, { data: Record<string, number>; expiresAt: number }>();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('freeCurrencyApi.apiKey') ?? '';
    this.baseUrl =
      this.configService.get<string>('freeCurrencyApi.baseUrl') ??
      'https://api.freecurrencyapi.com/v1';
    this.cacheTtlMs =
      (this.configService.get<number>('cacheTtlSeconds') ?? 3600) * 1000;

    if (!this.apiKey) {
      this.logger.warn(
        'FREE_CURRENCY_API_KEY is not set. Requests to freecurrencyapi.com will fail.',
      );
    }
  }

  async getCurrencies(): Promise<CurrencyInfo[]> {
    if (this.currenciesCache && this.currenciesCache.expiresAt > Date.now()) {
      return this.currenciesCache.data;
    }

    const response = await this.request<FreeCurrencyApiCurrenciesResponse>('/currencies');

    const currencies: CurrencyInfo[] = Object.values(response.data)
      .map((currency) => ({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        symbolNative: currency.symbol_native,
        decimalDigits: currency.decimal_digits,
        namePlural: currency.name_plural,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));

    this.currenciesCache = { data: currencies, expiresAt: Date.now() + this.cacheTtlMs };
    return currencies;
  }

  async convert(from: string, to: string, amount: number, date?: string): Promise<ConvertResult> {
    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();

    const rates = date
      ? await this.getHistoricalRates(fromCode, toCode, date)
      : await this.getLatestRates(fromCode, toCode);

    const rate = rates[toCode];
    if (rate === undefined) {
      throw new BadGatewayException(
        `Exchange rate for ${fromCode} -> ${toCode} is unavailable`,
      );
    }

    return {
      from: fromCode,
      to: toCode,
      amount,
      rate,
      result: Number((amount * rate).toFixed(6)),
      date: date ?? new Date().toISOString().slice(0, 10),
    };
  }

  async getTrend(from: string, to: string, days: number = DEFAULT_TREND_DAYS): Promise<TrendPoint[]> {
    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();
    const dates = this.getRecentDates(days);

    const settled = await Promise.allSettled(
      dates.map((date) => this.getHistoricalRates(fromCode, toCode, date)),
    );

    return settled
      .map((outcome, index) => {
        if (outcome.status !== 'fulfilled') return null;
        const rate = outcome.value[toCode];
        return rate === undefined ? null : { date: dates[index], rate };
      })
      .filter((point): point is TrendPoint => point !== null);
  }

  private getRecentDates(days: number): string[] {
    const dates: string[] = [];
    for (let daysAgo = days; daysAgo >= 1; daysAgo -= 1) {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - daysAgo);
      dates.push(date.toISOString().slice(0, 10));
    }
    return dates;
  }

  private async getLatestRates(base: string, target: string): Promise<Record<string, number>> {
    const cacheKey = `latest:${base}:${target}`;
    const cached = this.ratesCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const response = await this.request<FreeCurrencyApiRatesResponse>('/latest', {
      base_currency: base,
      currencies: target,
    });

    this.ratesCache.set(cacheKey, {
      data: response.data,
      expiresAt: Date.now() + this.cacheTtlMs,
    });
    return response.data;
  }

  private async getHistoricalRates(
    base: string,
    target: string,
    date: string,
  ): Promise<Record<string, number>> {
    const cacheKey = `historical:${base}:${target}:${date}`;
    const cached = this.ratesCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const response = await this.request<FreeCurrencyApiHistoricalResponse>('/historical', {
      base_currency: base,
      currencies: target,
      date,
    });

    const ratesForDate = response.data[date] ?? Object.values(response.data)[0];
    if (!ratesForDate) {
      throw new BadGatewayException(`No historical rates found for ${date}`);
    }

    this.ratesCache.set(cacheKey, {
      data: ratesForDate,
      expiresAt: Date.now() + this.cacheTtlMs,
    });
    return ratesForDate;
  }

  private async request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<T>(`${this.baseUrl}${path}`, {
          params: { ...params, apikey: this.apiKey },
        }),
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;
      this.logger.error(
        `Request to ${path} failed: ${axiosError.message}`,
        axiosError.stack,
      );

      const upstreamStatus = axiosError.response?.status;
      const upstreamData = axiosError.response?.data;

      if (upstreamStatus) {
        const fieldErrors = upstreamData?.errors
          ? Object.values(upstreamData.errors).flat().join(' ')
          : undefined;
        const message =
          fieldErrors || upstreamData?.message || 'The upstream currency API returned an error';

        if (upstreamStatus === 422 || upstreamStatus === 400) {
          throw new BadRequestException(message);
        }
        throw new BadGatewayException(message);
      }
      throw new InternalServerErrorException('Failed to reach the currency API');
    }
  }
}
