export interface RevenueReport {
  billedRevenue: number;
  cashRevenue: number;
  expectedRevenue: number;
  collectionRate: number;
  otherIncome?: number;
}

export interface ExpenseReport {
  totalExpenses: number;
  byCategory: { categoryId: string; amount: number }[];
  trend?: { month: string; amount: number }[];
}

export interface CashFlowReport {
  inflow: number;
  outflow: number;
  net: number;
}

export interface IncomeStatementReport {
  totalIncome: number;
  totalExpenses: number;
  netOperatingIncome: number;
}

export interface DashboardReport {
  revenue: RevenueReport;
  expenses: ExpenseReport;
  cashFlow: CashFlowReport;
  occupancyRate: number;
  overdueRent?: number;
  revenueTrend?: { month: string; billedRevenue: number; cashRevenue: number }[];
}

export interface ReportRangeParams {
  from?: string;
  to?: string;
}

export interface TransactionsReportParams extends ReportRangeParams {
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
}

export interface RevenueReportResponse {
  success: boolean;
  data: RevenueReport;
}

export interface ExpenseReportResponse {
  success: boolean;
  data: ExpenseReport;
}

export interface CashFlowReportResponse {
  success: boolean;
  data: CashFlowReport;
}

export interface IncomeStatementReportResponse {
  success: boolean;
  data: IncomeStatementReport;
}

export interface DashboardReportResponse {
  success: boolean;
  data: DashboardReport;
}

export interface TransactionsReportResponse {
  success: boolean;
  data: import("./finance").FinancialTransaction[];
}
