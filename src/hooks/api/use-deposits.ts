"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Deposit,
  DepositListParams,
  DepositListResponse,
  DepositSingleResponse,
  ReceiveDepositInput,
  DeductDepositInput,
  RefundDepositInput,
} from "@/types";

const DEPOSIT_KEY = ["deposits"] as const;
const TX_KEY = ["financeTransactions"] as const;

export function useDeposits(params?: DepositListParams) {
  return useQuery({
    queryKey: [...DEPOSIT_KEY, params ?? {}],
    queryFn: async () => {
      const res = await api.get<DepositListResponse>("/deposits", {
        params: params as Record<string, string | undefined>,
      });
      return res;
    },
  });
}

export function useReceiveDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReceiveDepositInput) => {
      const res = await api.post<DepositSingleResponse>("/deposits", input);
      const data = (res as unknown as DepositSingleResponse).data ?? (res as unknown as Deposit);
      return data as Deposit;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEPOSIT_KEY });
      qc.invalidateQueries({ queryKey: TX_KEY });
    },
  });
}

export function useDeductDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: DeductDepositInput & { id: string }) => {
      const res = await api.patch<DepositSingleResponse>(`/deposits/${id}/deduct`, input);
      const data = (res as unknown as DepositSingleResponse).data ?? (res as unknown as Deposit);
      return data as Deposit;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEPOSIT_KEY });
    },
  });
}

export function useRefundDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: RefundDepositInput & { id: string }) => {
      const res = await api.post<DepositSingleResponse>(`/deposits/${id}/refund`, input);
      const data = (res as unknown as DepositSingleResponse).data ?? (res as unknown as Deposit);
      return data as Deposit;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEPOSIT_KEY });
      qc.invalidateQueries({ queryKey: TX_KEY });
    },
  });
}
