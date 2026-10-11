"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApiResponse,
  FinancialAccount,
  FinancialAccountDropdownItem,
  CreateFinancialAccountInput,
  UpdateFinancialAccountInput,
} from "@/types";

const ACCOUNTS_KEY = ["financeAccounts"] as const;
const ACCOUNTS_DROPDOWN_KEY = ["financeAccountsDropdown"] as const;

export function useFinanceAccounts() {
  return useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: async () => {
      const res = await api.get<ApiResponse<FinancialAccount[]>>("/finance/accounts");
      return (
        (res as unknown as ApiResponse<FinancialAccount[]>).data ??
        (res as unknown as { data: FinancialAccount[] }).data ??
        []
      );
    },
  });
}

export function useFinanceAccountsDropdown() {
  return useQuery({
    queryKey: ACCOUNTS_DROPDOWN_KEY,
    queryFn: async () => {
      const res = await api.get<ApiResponse<FinancialAccountDropdownItem[]>>(
        "/finance/accounts/dropdown",
      );
      return (
        (res as unknown as ApiResponse<FinancialAccountDropdownItem[]>).data ??
        (res as unknown as { data: FinancialAccountDropdownItem[] }).data ??
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
