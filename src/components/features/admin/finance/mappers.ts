import type {
  FinancialAccountType,
  CategoryType,
  TransactionType,
  TransactionSource,
} from "@/types";

export function accountTypeLabel(t: FinancialAccountType): string {
  const map: Record<FinancialAccountType, string> = {
    CASH: "Tunai",
    BANK: "Bank",
    E_WALLET: "E-Wallet",
    QRIS: "QRIS",
    OTHER: "Lainnya",
  };
  return map[t] ?? t;
}

export function categoryTypeLabel(t: CategoryType): string {
  return t === "INCOME" ? "Pemasukan" : "Pengeluaran";
}

export function transactionTypeLabel(t: TransactionType): string {
  return t === "INCOME" ? "Pemasukan" : "Pengeluaran";
}

export function transactionSourceLabel(s: TransactionSource): string {
  const m: Record<TransactionSource, string> = {
    RENT_PAYMENT: "Pembayaran Sewa",
    MANUAL_INCOME: "Manual Masuk",
    MANUAL_EXPENSE: "Manual Keluar",
    DEPOSIT: "Deposit",
    DEPOSIT_REFUND: "Refund Deposit",
    ADJUSTMENT: "Penyesuaian",
    REFUND: "Refund",
  };
  return m[s] ?? s;
}
