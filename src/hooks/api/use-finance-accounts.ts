"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApiResponse,
  FinancialAccount,
  CreateFinancialAccountInput,
  UpdateFinancialAccountInput,
} from "@/types";

const ACCOUNTS_KEY = ["financeAccounts"] as const;

export function useFinanceAccounts() {
  return useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: async () => {
      const res = await api.get<ApiResponse<FinancialAccount[]>>("/finance/accounts");
      // BE returns {success:true, data: FinancialAccount[]} ; ApiResponse wraps it
      // lib/api returns raw json, so res = {success,data}
      // For mock we return same shape; unwrap here
      // If BE returns Apiresponse already, data is inside data
      // Some endpoints return {success,data} directly, not {data:{...}}
      // Our api.get types it as ApiResponse<...>, but actual json is ApiResponse
      return (
        (res as unknown as ApiResponse<FinancialAccount[]>).data ??
        (res as unknown as { data: FinancialAccount[] }).data ??
        []
      );
    },
  });
}

export function useCreateFinanceAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateFinancialAccountInput) => {
      const res = await api.post<ApiResponse<FinancialAccount>>("/finance/accounts", input);
      return (
        (res as unknown as ApiResponse<FinancialAccount>).data ??
        (res as unknown as FinancialAccount)
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
}

export function useUpdateFinanceAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateFinancialAccountInput & { id: string }) => {
      const res = await api.patch<ApiResponse<FinancialAccount>>(`/finance/accounts/${id}`, input);
      return (
        (res as unknown as ApiResponse<FinancialAccount>).data ??
        (res as unknown as FinancialAccount)
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
}
