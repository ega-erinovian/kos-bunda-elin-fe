import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { generateIdempotencyKey } from "@/lib/idempotency";
import type {
  AddPaymentResponse,
  ApiResponse,
  CreatePaymentRecordInput,
  PaymentRecord,
} from "@/types";

interface UseAddPaymentOptions {
  onSuccess?: (data: AddPaymentResponse) => void;
  onError?: (error: Error) => void;
}

export function useAddPayment(options?: UseAddPaymentOptions) {
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pembayaran"],
      });

      queryClient.invalidateQueries({
        queryKey: ["pembayaranRecords", variables.pembayaranId],
      });

      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

export function usePaymentRecords(pembayaranId: string) {
  return useQuery({
    queryKey: ["pembayaranRecords", pembayaranId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ data: PaymentRecord[] }>>(
        `/pembayaran/${pembayaranId}/payments`,
      );
      return response.data.data;
    },
  });
}
