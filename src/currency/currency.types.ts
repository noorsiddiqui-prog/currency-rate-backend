export interface CurrencyInfo {
  symbol: string;
  name: string;
  symbolNative: string;
  decimalDigits: number;
  code: string;
  namePlural: string;
}

export interface FreeCurrencyApiCurrenciesResponse {
  data: Record<
    string,
    {
      symbol: string;
      name: string;
      symbol_native: string;
      decimal_digits: number;
      rounding: number;
      code: string;
      name_plural: string;
    }
  >;
}

export interface FreeCurrencyApiRatesResponse {
  data: Record<string, number>;
}

export interface FreeCurrencyApiHistoricalResponse {
  data: Record<string, Record<string, number>>;
}

export interface ConvertResult {
  from: string;
  to: string;
  amount: number;
  rate: number;
  result: number;
  date: string;
}

export interface TrendPoint {
  date: string;
  rate: number;
}
