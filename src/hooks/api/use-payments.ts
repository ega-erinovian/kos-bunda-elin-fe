"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Payment } from "@/types";

const PAYMENTS_KEY = ["payments"];

export function usePayments(params?: { tenantId?: string; month?: number; year?: number }) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, params],
    queryFn: () =>
      api.get<Payment[]>("/payments", {
        params: params as Record<string, string | number | undefined>,
      }),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, id],
    queryFn: () => api.get<Payment>(`/payments/${id}`),
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Payment, "id" | "createdAt" | "updatedAt">) =>
      api.post<Payment>("/payments", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY }),
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Payment> & { id: string }) =>
      api.put<Payment>(`/payments/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY }),
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/payments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY }),
  });
}
