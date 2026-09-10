import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CurrencyModule } from './currency/currency.module';
import { HistoryModule } from './history/history.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodbUri'),
        serverSelectionTimeoutMS: 3000,
        retryAttempts: 2,
        retryDelay: 1000,
        connectionErrorFactory: (error: Error) => {
          // eslint-disable-next-line no-console
          console.warn(
            `MongoDB connection failed (history will be unavailable until MONGODB_URI is reachable): ${error.message}`,
          );
          return error;
        },
      }),
    }),
    CurrencyModule,
    HistoryModule,
  ],
})
export class AppModule {}
