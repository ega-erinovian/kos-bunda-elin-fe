export interface ReceivableByTenant {
  penyewaId: string;
  nama: string;
  outstanding: number;
  unpaidPeriods: number;
}

export interface ReceivableSummary {
  totalOutstanding: number;
  unpaidPeriodCount: number;
  propertyTotal: number;
}

export type AgingLabel = "current" | "1-30" | "31-60" | "61-90" | "90+";

export interface AgingBucket {
  label: AgingLabel;
  outstanding: number;
  count: number;
}

export interface ReceivableListParams {
  asOf?: string;
}

export interface ReceivableListResponse {
  success: boolean;
  data: ReceivableByTenant[];
}

export interface ReceivableSummaryResponse {
  success: boolean;
  data: ReceivableSummary;
}

export interface ReceivableAgingResponse {
  success: boolean;
  data: { buckets: AgingBucket[] };
}
