import type { FinancialAccountType, CategoryType, TransactionType } from "@/types";

export const ACCOUNT_TYPE_OPTIONS: { value: FinancialAccountType; label: string }[] = [
  { value: "CASH", label: "Tunai" },
  { value: "BANK", label: "Bank" },
  { value: "E_WALLET", label: "E-Wallet" },
  { value: "QRIS", label: "QRIS" },
  { value: "OTHER", label: "Lainnya" },
];

export const CATEGORY_TYPE_OPTIONS: { value: CategoryType; label: string }[] = [
  { value: "INCOME", label: "Pemasukan" },
  { value: "EXPENSE", label: "Pengeluaran" },
];

export const TX_TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: "INCOME", label: "Pemasukan" },
  { value: "EXPENSE", label: "Pengeluaran" },
];

export const TX_SOURCE_OPTIONS: { value: "MANUAL_INCOME" | "MANUAL_EXPENSE"; label: string }[] = [
  { value: "MANUAL_INCOME", label: "Pemasukan Manual" },
  { value: "MANUAL_EXPENSE", label: "Pengeluaran Manual" },
];

export const FINANCE_PAGE_SIZE = 10;

export const AUDIT_PAGE_SIZE = 20;
