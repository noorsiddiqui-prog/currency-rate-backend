import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { ConversionHistory, ConversionHistorySchema } from './schemas/conversion-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ConversionHistory.name, schema: ConversionHistorySchema }]),
  ],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
