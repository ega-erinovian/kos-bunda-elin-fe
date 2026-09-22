import type { ReportTab } from "@/hooks/features/admin/report/useReportsSection";

export const REPORT_TABS: { id: ReportTab; label: string; shortLabel: string }[] = [
  { id: "dashboard", label: "Dasbor", shortLabel: "Dasbor" },
  { id: "revenue", label: "Pendapatan", shortLabel: "Pendapatan" },
  { id: "expenses", label: "Beban", shortLabel: "Beban" },
  { id: "cash-flow", label: "Arus Kas", shortLabel: "Arus Kas" },
  { id: "income-statement", label: "Laba Rugi", shortLabel: "Laba Rugi" },
  { id: "transactions", label: "Transaksi", shortLabel: "Transaksi" },
];

export const REPORT_TAB_LABELS: Record<ReportTab, string> = {
  dashboard: "Dasbor",
  revenue: "Pendapatan",
  expenses: "Beban",
  "cash-flow": "Arus Kas",
  "income-statement": "Laba Rugi",
  transactions: "Transaksi",
};
