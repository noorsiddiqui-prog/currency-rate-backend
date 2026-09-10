import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { QueryHistoryDto } from './dto/query-history.dto';
import { HistoryRecord } from './history.types';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  async create(@Body() dto: CreateHistoryDto): Promise<HistoryRecord> {
    return this.historyService.create(dto);
  }

  @Get()
  async findRecent(@Query() query: QueryHistoryDto): Promise<HistoryRecord[]> {
    return this.historyService.findRecent(query.clientId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clear(@Query() query: QueryHistoryDto): Promise<void> {
    await this.historyService.clear(query.clientId);
  }
}
