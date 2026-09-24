export interface DashboardKamarSummary {
  total: number;
  terisi: number;
  kosong: number;
  occupancyRate: number;
}

export interface DashboardPembayaranSummary {
  total: number;
  lunas: number;
  belumBayar: number;
  sebagian: number;
  terlambat: number;
  outstanding: number;
}

export interface DashboardFinanceSummary {
  totalReceivables: number;
  netOperatingIncomeThisMonth: number;
}

export interface DashboardNotificationsSummary {
  remindersSentToday: number;
  failedMessagesCount: number;
}

export interface DashboardSummary {
  kamar: DashboardKamarSummary;
  pembayaran: DashboardPembayaranSummary;
  finance?: DashboardFinanceSummary;
  notifications?: DashboardNotificationsSummary;
}

export interface DashboardSummaryParams {
  from?: string;
  to?: string;
}

export interface DashboardSummaryResponse {
  success: boolean;
  data: DashboardSummary;
}
