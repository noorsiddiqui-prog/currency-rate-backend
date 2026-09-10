import * as dns from 'dns';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

// Some routers/ISPs refuse Node's direct UDP DNS queries for the SRV records
// that `mongodb+srv://` URIs rely on, even though the OS resolver handles them
// fine. Pointing Node at public resolvers avoids spurious ECONNREFUSED errors
// when connecting to MongoDB Atlas.
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

export async function createApp() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const corsOrigin = configService.get<string>('corsOrigin') ?? 'http://localhost:5173';
  const localhostPattern = /^http:\/\/localhost:\d+$/;

  app.enableCors({
    origin: (requestOrigin, callback) => {
      const isAllowed =
        !requestOrigin || requestOrigin === corsOrigin || localhostPattern.test(requestOrigin);
      callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  if (!configService.get<boolean>('mongodbConfigured')) {
    // eslint-disable-next-line no-console
    console.warn(
      'MONGODB_URI is not set - falling back to mongodb://127.0.0.1:27017/currency-converter. ' +
        'Conversion history will not persist until a real MongoDB Atlas URI is configured in backend/.env.',
    );
  }

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3001;

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${port}/api`);
}

if (require.main === module) {
  bootstrap();
}
