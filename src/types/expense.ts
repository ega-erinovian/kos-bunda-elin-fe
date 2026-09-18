import type { FinancialTransaction } from "./finance";
import type { Pagination } from "./pagination";

export type ExpenseTransaction = FinancialTransaction;

export interface CreateExpenseInput {
  categoryId: string;
  accountId: string;
  amount: number;
  transactionDate: string;
  vendorName: string;
  receiptUrl?: string;
  description?: string;
  referenceNumber?: string;
}

export interface UpdateExpenseInput {
  vendorName?: string;
  receiptUrl?: string | null;
  description?: string | null;
}

export interface ExpenseListParams {
  categoryId?: string;
  accountId?: string;
  from?: string;
  to?: string;
  vendorName?: string;
  page?: number;
  pageSize?: number;
}

export interface ExpenseListResponse {
  success: boolean;
  data: FinancialTransaction[];
  pagination: Pagination;
}

export interface ExpenseSingleResponse {
  success: boolean;
  data: FinancialTransaction;
}

export interface ReverseExpenseResponse {
  success: boolean;
  data: { reversal: FinancialTransaction };
}
