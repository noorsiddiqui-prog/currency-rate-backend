import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversionHistory, ConversionHistoryDocument } from './schemas/conversion-history.schema';
import { CreateHistoryDto } from './dto/create-history.dto';
import { HistoryRecord } from './history.types';

const RECENT_HISTORY_LIMIT = 50;

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(ConversionHistory.name)
    private readonly historyModel: Model<ConversionHistoryDocument>,
  ) {}

  async create(dto: CreateHistoryDto): Promise<HistoryRecord> {
    const created = await this.historyModel.create({
      clientId: dto.clientId,
      from: dto.from,
      to: dto.to,
      amount: dto.amount,
      rate: dto.rate,
      result: dto.result,
      rateDate: dto.rateDate,
      isHistorical: dto.isHistorical,
    });
    return this.toRecord(created);
  }

  async findRecent(clientId: string): Promise<HistoryRecord[]> {
    const documents = await this.historyModel
      .find({ clientId })
      .sort({ createdAt: -1 })
      .limit(RECENT_HISTORY_LIMIT)
      .exec();
    return documents.map((document) => this.toRecord(document));
  }

  async clear(clientId: string): Promise<void> {
    await this.historyModel.deleteMany({ clientId }).exec();
  }

  private toRecord(document: ConversionHistoryDocument): HistoryRecord {
    return {
      id: document._id.toString(),
      from: document.from,
      to: document.to,
      amount: document.amount,
      rate: document.rate,
      result: document.result,
      rateDate: document.rateDate,
      isHistorical: document.isHistorical,
      createdAt: (document.createdAt ?? new Date()).toISOString(),
    };
  }
}
