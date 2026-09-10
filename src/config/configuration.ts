const DEFAULT_DB_NAME = 'currency-converter';

function withDatabaseName(uri: string, dbName: string): string {
  const [beforeQuery, query] = uri.split('?');
  const hasDbName = /\/[^/]+\/?$/.test(beforeQuery) && !beforeQuery.endsWith('/');
  const base = hasDbName ? beforeQuery : `${beforeQuery.replace(/\/$/, '')}/${dbName}`;
  return query ? `${base}?${query}` : base;
}

export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS ?? '3600', 10),
  mongodbUri: process.env.MONGODB_URI
    ? withDatabaseName(process.env.MONGODB_URI, DEFAULT_DB_NAME)
    : `mongodb://127.0.0.1:27017/${DEFAULT_DB_NAME}`,
  mongodbConfigured: Boolean(process.env.MONGODB_URI),
  freeCurrencyApi: {
    apiKey: process.env.FREE_CURRENCY_API_KEY ?? '',
    baseUrl:
      process.env.FREE_CURRENCY_API_BASE_URL ??
      'https://api.freecurrencyapi.com/v1',
  },
});
