"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  FinancialTransaction,
  CreateFinancialTransactionInput,
  UpdateFinancialTransactionInput,
  FinancialTransactionListParams,
  Pagination,
} from "@/types";

const TX_KEY = ["financeTransactions"] as const;

type TxListResponse = {
  success: boolean;
  data: FinancialTransaction[];
  pagination: Pagination;
};

export function useFinanceTransactions(params?: FinancialTransactionListParams) {
  return useQuery({
    queryKey: [...TX_KEY, params ?? {}],
    queryFn: async () => {
      const res = await api.get<TxListResponse>("/finance/transactions", {
        params: params as Record<string, string | number | undefined>,
      });
      return res;
    },
  });
}

export function useCreateFinanceTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateFinancialTransactionInput) => {
      const res = await api.post<{ success: boolean; data: FinancialTransaction }>(
        "/finance/transactions",
        input,
      );
      return (
        (res as unknown as { success: boolean; data: FinancialTransaction }).data ??
        (res as unknown as FinancialTransaction)
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TX_KEY }),
  });
}

export function useUpdateFinanceTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateFinancialTransactionInput & { id: string }) => {
      const res = await api.patch<{ success: boolean; data: FinancialTransaction }>(
        `/finance/transactions/${id}`,
        input,
      );
      return (
        (res as unknown as { success: boolean; data: FinancialTransaction }).data ??
        (res as unknown as FinancialTransaction)
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TX_KEY }),
  });
}

export function useDeleteFinanceTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete<void>(`/finance/transactions/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TX_KEY }),
  });
}
