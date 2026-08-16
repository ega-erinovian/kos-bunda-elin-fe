"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, PaginatedResponse, Tenant } from "@/types";

const TENANTS_KEY = ["tenants"];

export type TenantListParams = {
  page?: number;
  limit?: number;
  aktif?: boolean;
  search?: string;
};

export type CreateTenantInput = {
  nama: string;
  noHp: string;
  kamarId: string;
  tanggalMulaiSewa: string;
  nominalSewa: number;
  tanggalJatuhTempo: number;
};

export type UpdateTenantInput = Partial<CreateTenantInput>;

export type KeluarTenantInput = {
  tanggalKeluar?: string;
};

export function useTenants(params?: TenantListParams) {
  return useQuery({
    queryKey: [...TENANTS_KEY, params],
    queryFn: () => api.get<PaginatedResponse<Tenant>>("/penyewa", { params }),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: [...TENANTS_KEY, id],
    queryFn: () => api.get<ApiResponse<Tenant>>(`/penyewa/${id}`),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTenantInput) => api.post<Tenant>("/penyewa", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TENANTS_KEY }),
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateTenantInput & { id: string }) =>
      api.patch<Tenant>(`/penyewa/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TENANTS_KEY }),
  });
}

export function useMarkTenantKeluar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: KeluarTenantInput & { id: string }) =>
      api.post<Tenant>(`/penyewa/${id}/keluar`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TENANTS_KEY }),
  });
}
