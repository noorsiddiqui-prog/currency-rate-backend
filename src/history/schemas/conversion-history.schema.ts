import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConversionHistoryDocument = HydratedDocument<ConversionHistory>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class ConversionHistory {
  @Prop({ required: true, index: true })
  clientId: string;

  @Prop({ required: true, uppercase: true, minlength: 3, maxlength: 3 })
  from: string;

  @Prop({ required: true, uppercase: true, minlength: 3, maxlength: 3 })
  to: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  rate: number;

  @Prop({ required: true })
  result: number;

  @Prop({ required: true })
  rateDate: string;

  @Prop({ required: true, default: false })
  isHistorical: boolean;

  createdAt?: Date;
}

export const ConversionHistorySchema = SchemaFactory.createForClass(ConversionHistory);
ConversionHistorySchema.index({ clientId: 1, createdAt: -1 });
