export interface HistoryRecord {
  id: string;
  from: string;
  to: string;
  amount: number;
  rate: number;
  result: number;
  rateDate: string;
  isHistorical: boolean;
  createdAt: string;
}
