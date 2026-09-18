"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  FinancialTransaction,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseListParams,
  Pagination,
} from "@/types";

const EXPENSE_KEY = ["expenses"] as const;
const TX_KEY = ["financeTransactions"] as const;

type ExpenseListResponse = {
  success: boolean;
  data: FinancialTransaction[];
  pagination: Pagination;
};

export function useExpenses(params?: ExpenseListParams) {
  return useQuery({
    queryKey: [...EXPENSE_KEY, params ?? {}],
    queryFn: async () => {
      const res = await api.get<ExpenseListResponse>("/expenses", {
        params: params as Record<string, string | number | undefined>,
      });
      return res;
    },
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      const res = await api.post<{ success: boolean; data: FinancialTransaction }>(
        "/expenses",
        input,
      );
      return (
        (res as unknown as { success: boolean; data: FinancialTransaction }).data ??
        (res as unknown as FinancialTransaction)
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPENSE_KEY });
      qc.invalidateQueries({ queryKey: TX_KEY });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateExpenseInput & { id: string }) => {
      const res = await api.patch<{ success: boolean; data: FinancialTransaction }>(
        `/expenses/${id}`,
        input,
      );
      return (
        (res as unknown as { success: boolean; data: FinancialTransaction }).data ??
        (res as unknown as FinancialTransaction)
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPENSE_KEY });
      qc.invalidateQueries({ queryKey: TX_KEY });
    },
  });
}

export function useReverseExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.post<{
        success: boolean;
        data: { reversal: FinancialTransaction };
      }>(`/expenses/${id}/reverse`, { reason });
      return (res as unknown as { success: boolean; data: { reversal: FinancialTransaction } })
        .data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPENSE_KEY });
      qc.invalidateQueries({ queryKey: TX_KEY });
    },
  });
}

export function useReverseFinanceTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.post<{
        success: boolean;
        data: { reversal: FinancialTransaction };
      }>(`/finance/transactions/${id}/reverse`, { reason });
      return (res as unknown as { success: boolean; data: { reversal: FinancialTransaction } })
        .data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPENSE_KEY });
      qc.invalidateQueries({ queryKey: TX_KEY });
    },
  });
}
