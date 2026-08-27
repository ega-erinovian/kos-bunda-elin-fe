"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { generateIdempotencyKey } from "@/lib/idempotency";
import type {
  AddPaymentResponse,
  ApiResponse,
  CreatePaymentInput,
  CreatePaymentRecordInput,
  PaginatedResponse,
  Payment,
  PaymentListParams,
  UpdatePaymentInput,
} from "@/types";

const PAYMENTS_KEY = ["pembayaran"];

export function usePayments(params?: PaymentListParams) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, params],
    queryFn: () =>
      api.get<PaginatedResponse<Payment>>("/pembayaran", {
        params: params as Record<string, string | number | undefined>,
      }),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Payment>>(`/pembayaran/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePaymentInput) => {
      const response = await api.post<ApiResponse<Payment>>("/pembayaran", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY }),
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdatePaymentInput & { id: string }) => {
      const response = await api.patch<ApiResponse<Payment>>(`/pembayaran/${id}`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY }),
  });
}

export function useCreatePaymentRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePaymentRecordInput) => {
      const { pembayaranId, ...body } = input;
      const idempotencyKey = generateIdempotencyKey();
      const response = await api.post<ApiResponse<AddPaymentResponse>>(
        `/pembayaran/${pembayaranId}/payments`,
        body,
        {
          headers: {
            "Idempotency-Key": idempotencyKey,
          },
        },
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["pembayaranRecords", variables.pembayaranId] });
    },
  });
}
