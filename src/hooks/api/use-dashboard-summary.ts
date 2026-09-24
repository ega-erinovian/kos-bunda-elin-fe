"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardSummaryParams, DashboardSummaryResponse } from "@/types";

const DASHBOARD_KEY = ["dashboard"] as const;

function paramsKey(params?: Record<string, string | undefined>) {
  return params ?? {};
}

export function useDashboardSummary(params?: DashboardSummaryParams, enabled = true) {
  return useQuery({
    queryKey: [
      ...DASHBOARD_KEY,
      "summary",
      paramsKey(params as Record<string, string | undefined>),
    ],
    enabled,
    queryFn: async () => {
      const res = await api.get<DashboardSummaryResponse>("/dashboard/summary", {
        params: params as Record<string, string | undefined>,
      });
      return res;
    },
  });
}
