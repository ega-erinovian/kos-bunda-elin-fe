"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ReportRangeParams,
  TransactionsReportParams,
  DashboardReportResponse,
  RevenueReportResponse,
  ExpenseReportResponse,
  CashFlowReportResponse,
  IncomeStatementReportResponse,
  TransactionsReportResponse,
} from "@/types";

const REPORT_KEY = ["reports"] as const;

function paramsKey(params?: Record<string, string | undefined>) {
  return params ?? {};
}

export function useDashboardReport(params?: ReportRangeParams, enabled = true) {
  return useQuery({
    queryKey: [...REPORT_KEY, "dashboard", paramsKey(params as Record<string, string | undefined>)],
    enabled,
    queryFn: async () => {
      const res = await api.get<DashboardReportResponse>("/reports/dashboard", {
        params: params as Record<string, string | undefined>,
      });
      return res;
    },
  });
}

export function useRevenueReport(params?: ReportRangeParams, enabled = true) {
  return useQuery({
    queryKey: [...REPORT_KEY, "revenue", paramsKey(params as Record<string, string | undefined>)],
    enabled,
    queryFn: async () => {
      const res = await api.get<RevenueReportResponse>("/reports/revenue", {
        params: params as Record<string, string | undefined>,
      });
      return res;
    },
  });
}

export function useExpenseReport(params?: ReportRangeParams, enabled = true) {
  return useQuery({
    queryKey: [...REPORT_KEY, "expenses", paramsKey(params as Record<string, string | undefined>)],
    enabled,
    queryFn: async () => {
      const res = await api.get<ExpenseReportResponse>("/reports/expenses", {
        params: params as Record<string, string | undefined>,
      });
      return res;
    },
  });
}

export function useCashFlowReport(params?: ReportRangeParams, enabled = true) {
  return useQuery({
    queryKey: [...REPORT_KEY, "cash-flow", paramsKey(params as Record<string, string | undefined>)],
    enabled,
    queryFn: async () => {
      const res = await api.get<CashFlowReportResponse>("/reports/cash-flow", {
        params: params as Record<string, string | undefined>,
      });
      return res;
    },
  });
}

export function useIncomeStatementReport(params?: ReportRangeParams, enabled = true) {
  return useQuery({
    queryKey: [
      ...REPORT_KEY,
      "income-statement",
      paramsKey(params as Record<string, string | undefined>),
    ],
    enabled,
    queryFn: async () => {
      const res = await api.get<IncomeStatementReportResponse>("/reports/income-statement", {
        params: params as Record<string, string | undefined>,
      });
      return res;
    },
  });
}

export function useTransactionsReport(params?: TransactionsReportParams, enabled = true) {
  return useQuery({
    queryKey: [
      ...REPORT_KEY,
      "transactions",
      paramsKey(params as Record<string, string | undefined>),
    ],
    enabled,
    queryFn: async () => {
      const res = await api.get<TransactionsReportResponse>("/reports/transactions", {
        params: params as Record<string, string | undefined>,
      });
      return res;
    },
  });
}
