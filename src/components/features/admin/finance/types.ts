import type { CategoryType, FinancialAccountType, TransactionType } from "@/types";

export type FinanceTab = "all" | CategoryType;
export type TxFilterType = "semua" | TransactionType;
export type AccountTypeFilter = "semua" | FinancialAccountType;
