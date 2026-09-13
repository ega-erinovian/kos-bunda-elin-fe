"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AuditLogEntry, AuditLogListParams, Pagination } from "@/types";

type AuditListResponse = {
  success: boolean;
  data: AuditLogEntry[];
  pagination?: Pagination;
};

export function useAuditLog(params?: AuditLogListParams) {
  return useQuery({
    queryKey: ["auditLog", params ?? {}],
    queryFn: async () => {
      const res = await api.get<AuditListResponse>("/audit-log", {
        params: params as unknown as Record<string, string | number | undefined>,
      });
      // normalize: BE may not return pagination when not requested; mock does
      // For FE with client pagination we always expect pagination, but tolerate missing
      if (!res.pagination && Array.isArray(res.data)) {
        const total = res.data.length;
        return {
          ...res,
          pagination: {
            page: params?.page ?? 1,
            pageSize: params?.pageSize ?? total,
            total,
            totalPages: 1,
          } as Pagination,
        } as AuditListResponse;
      }
      return res;
    },
  });
}
