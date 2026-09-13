"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApiResponse,
  FinancialCategory,
  CreateFinancialCategoryInput,
  UpdateFinancialCategoryInput,
  CategoryType,
} from "@/types";

const CATEGORIES_KEY = ["financeCategories"] as const;

export function useFinanceCategories(type?: CategoryType) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, type ?? "all"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<FinancialCategory[]>>("/finance/categories", {
        params: type ? { type } : undefined,
      });
      const unwrapped = (res as unknown as ApiResponse<FinancialCategory[]>).data;
      if (Array.isArray(unwrapped)) return unwrapped;
      const alt = (res as unknown as { data: FinancialCategory[] }).data;
      return alt ?? [];
    },
  });
}

export function useCreateFinanceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateFinancialCategoryInput) => {
      const res = await api.post<ApiResponse<FinancialCategory>>("/finance/categories", input);
      return (
        (res as unknown as ApiResponse<FinancialCategory>).data ??
        (res as unknown as FinancialCategory)
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useUpdateFinanceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateFinancialCategoryInput & { id: string }) => {
      const res = await api.patch<ApiResponse<FinancialCategory>>(
        `/finance/categories/${id}`,
        input,
      );
      return (
        (res as unknown as ApiResponse<FinancialCategory>).data ??
        (res as unknown as FinancialCategory)
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}
