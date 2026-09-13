export type FinancialAccountType = "CASH" | "BANK" | "E_WALLET" | "QRIS" | "OTHER";
export type CategoryType = "INCOME" | "EXPENSE";
export type TransactionType = "INCOME" | "EXPENSE";
export type TransactionSource =
  | "RENT_PAYMENT"
  | "MANUAL_INCOME"
  | "MANUAL_EXPENSE"
  | "DEPOSIT"
  | "DEPOSIT_REFUND"
  | "ADJUSTMENT"
  | "REFUND";

export interface FinancialAccount {
  id: string;
  name: string;
  type: FinancialAccountType;
  bankName?: string;
  accountNumber?: string;
  openingBalance: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialCategory {
  id: string;
  type: CategoryType;
  code: string;
  name: string;
  active: boolean;
  createdAt?: string;
}

export interface FinancialTransaction {
  id: string;
  accountId: string;
  categoryId: string;
  tenantId?: string;
  pembayaranId?: string;
  paymentRecordId?: string;
  depositId?: string;
  type: TransactionType;
  source: TransactionSource;
  amount: number;
  transactionDate: string;
  description?: string;
  referenceNumber?: string;
  vendorName?: string;
  receiptUrl?: string;
  createdAt: string;
  deletedAt?: string;
}

export interface CreateFinancialAccountInput {
  name: string;
  type: FinancialAccountType;
  bankName?: string;
  accountNumber?: string;
  openingBalance?: number;
}

export interface UpdateFinancialAccountInput {
  name?: string;
  type?: FinancialAccountType;
  bankName?: string | null;
  accountNumber?: string | null;
  openingBalance?: number;
  active?: boolean;
}

export interface CreateFinancialCategoryInput {
  type: CategoryType;
  code: string;
  name: string;
}

export interface UpdateFinancialCategoryInput {
  code?: string;
  name?: string;
  active?: boolean;
}

export interface CreateFinancialTransactionInput {
  accountId: string;
  categoryId: string;
  amount: number;
  transactionDate: string;
  description?: string;
  referenceNumber?: string;
  source: "MANUAL_INCOME" | "MANUAL_EXPENSE";
}

export interface UpdateFinancialTransactionInput {
  description?: string | null;
  referenceNumber?: string | null;
  categoryId?: string;
}

export interface FinancialTransactionListParams {
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}
