"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  useDashboardReport,
  useRevenueReport,
  useExpenseReport,
  useCashFlowReport,
  useIncomeStatementReport,
  useTransactionsReport,
} from "@/hooks/api/use-reports";
import type { ReportRangeParams } from "@/types";

export const MAX_REPORT_RANGE_DAYS = 1095;
export type ReportTab =
  "dashboard" | "revenue" | "expenses" | "cash-flow" | "income-statement" | "transactions";

const TAB_ORDER: ReportTab[] = [
  "dashboard",
  "revenue",
  "expenses",
  "cash-flow",
  "income-statement",
  "transactions",
];

function defaultRange(): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: toInput(start), to: toInput(now) };
}

function toInput(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function parseInput(s: string): Date | null {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function diffDays(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function useReportsSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initial = useMemo(() => {
    const qsFrom = searchParams.get("from");
    const qsTo = searchParams.get("to");
    const qsTab = searchParams.get("tab") as ReportTab | null;
    const fallback = defaultRange();
    const tab: ReportTab = qsTab && TAB_ORDER.includes(qsTab) ? qsTab : "dashboard";
    return {
      from: qsFrom ?? fallback.from,
      to: qsTo ?? fallback.to,
      tab,
    };
  }, [searchParams]);

  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [tab, setTab] = useState<ReportTab>(initial.tab);
  const [txType, setTxType] = useState<string>("semua");
  const [txCategoryId, setTxCategoryId] = useState<string>("semua");

  // sync when URL changes externally (back/forward)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync URL state on back/forward navigation
    setFrom(initial.from);
    setTo(initial.to);
    setTab(initial.tab);
  }, [initial]);

  const fromDate = parseInput(from);
  const toDate = parseInput(to);
  const hasBoth = !!from && !!to && !!fromDate && !!toDate;

  let rangeError: string | null = null;
  if (from && to && fromDate && toDate) {
    if (fromDate > toDate) rangeError = "Tanggal mulai tidak boleh setelah tanggal selesai";
    else if (diffDays(fromDate, toDate) > MAX_REPORT_RANGE_DAYS)
      rangeError = `Rentang maksimal ${MAX_REPORT_RANGE_DAYS} hari (3 tahun)`;
  } else if ((from && !fromDate) || (to && !toDate)) {
    rangeError = "Format tanggal tidak valid";
  }

  const isValid = hasBoth && !rangeError;

  // query params for APIs (ISO strings, date-only)
  const apiParams: ReportRangeParams | undefined = useMemo(() => {
    if (!hasBoth || !fromDate || !toDate) return undefined;
    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    };
  }, [hasBoth, fromDate, toDate]);

  const dashboardParams = apiParams;
  const otherParams = isValid ? apiParams : undefined;

  const txParams = useMemo(() => {
    if (!isValid || !apiParams) return undefined;
    const p: Record<string, string> = { from: apiParams.from!, to: apiParams.to! };
    if (txType !== "semua") p.type = txType;
    if (txCategoryId !== "semua") p.categoryId = txCategoryId;
    return p as ReportRangeParams & { type?: "INCOME" | "EXPENSE"; categoryId?: string };
  }, [isValid, apiParams, txType, txCategoryId]);

  const dashboard = useDashboardReport(dashboardParams, !!dashboardParams && !rangeError);
  const revenue = useRevenueReport(otherParams, isValid);
  const expenses = useExpenseReport(otherParams, isValid);
  const cashFlow = useCashFlowReport(otherParams, isValid);
  const incomeStatement = useIncomeStatementReport(otherParams, isValid);
  const transactions = useTransactionsReport(txParams, isValid);

  const isLoading =
    dashboard.isLoading ||
    revenue.isLoading ||
    expenses.isLoading ||
    cashFlow.isLoading ||
    incomeStatement.isLoading;

  const isError =
    dashboard.isError ||
    revenue.isError ||
    expenses.isError ||
    cashFlow.isError ||
    incomeStatement.isError;

  function syncUrl(nextFrom: string, nextTo: string, nextTab: ReportTab) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("from", nextFrom);
    sp.set("to", nextTo);
    sp.set("tab", nextTab);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  function handleFromChange(v: string) {
    setFrom(v);
    syncUrl(v, to, tab);
  }

  function handleToChange(v: string) {
    setTo(v);
    syncUrl(from, v, tab);
  }

  function handleTabChange(next: ReportTab) {
    setTab(next);
    syncUrl(from, to, next);
  }

  function handleResetRange() {
    const d = defaultRange();
    setFrom(d.from);
    setTo(d.to);
    syncUrl(d.from, d.to, tab);
  }

  function refetchAll() {
    dashboard.refetch();
    revenue.refetch();
    expenses.refetch();
    cashFlow.refetch();
    incomeStatement.refetch();
    transactions.refetch();
  }

  // today for max attr
  const todayStr = toInput(new Date());

  return {
    from,
    to,
    tab,
    todayStr,
    rangeError,
    isValid,
    hasBoth,
    txType,
    txCategoryId,
    setTxType,
    setTxCategoryId,
    dashboard: dashboard.data?.data ?? null,
    revenue: revenue.data?.data ?? null,
    expense: expenses.data?.data ?? null,
    cashFlow: cashFlow.data?.data ?? null,
    incomeStatement: incomeStatement.data?.data ?? null,
    transactions: transactions.data?.data ?? [],
    transactionsLoading: transactions.isLoading,
    transactionsError: transactions.isError,
    isLoading,
    isError,
    dashboardLoading: dashboard.isLoading,
    dashboardError: dashboard.isError,
    refetchAll,
    handleFromChange,
    handleToChange,
    handleTabChange,
    handleResetRange,
    handleTxTypeChange: setTxType,
    handleTxCategoryChange: setTxCategoryId,
  };
}
