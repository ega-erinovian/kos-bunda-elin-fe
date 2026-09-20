"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ReceivableListParams,
  ReceivableListResponse,
  ReceivableSummaryResponse,
  ReceivableAgingResponse,
} from "@/types";

const RECEIVABLE_KEY = ["receivables"] as const;

export function useReceivables(params?: ReceivableListParams, enabled = true) {
  return useQuery({
    queryKey: [...RECEIVABLE_KEY, "list", params ?? {}],
    enabled,
    queryFn: async () => {
      const res = await api.get<ReceivableListResponse>("/receivables", {
        params: params as Record<string, string | number | undefined>,
      });
      return res;
    },
  });
}

export function useReceivableSummary(params?: ReceivableListParams, enabled = true) {
  return useQuery({
    queryKey: [...RECEIVABLE_KEY, "summary", params ?? {}],
    enabled,
    queryFn: async () => {
      const res = await api.get<ReceivableSummaryResponse>("/receivables/summary", {
        params: params as Record<string, string | number | undefined>,
      });
      return res;
    },
  });
}

export function useReceivableAging(params?: ReceivableListParams, enabled = true) {
  return useQuery({
    queryKey: [...RECEIVABLE_KEY, "aging", params ?? {}],
    enabled,
    queryFn: async () => {
      const res = await api.get<ReceivableAgingResponse>("/receivables/aging", {
        params: params as Record<string, string | number | undefined>,
      });
      return res;
    },
  });
}
