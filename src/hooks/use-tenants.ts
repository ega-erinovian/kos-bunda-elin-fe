"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Tenant } from "@/types";

const TENANTS_KEY = ["tenants"];

export function useTenants() {
  return useQuery({
    queryKey: TENANTS_KEY,
    queryFn: () => api.get<Tenant[]>("/tenants"),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: [...TENANTS_KEY, id],
    queryFn: () => api.get<Tenant>(`/tenants/${id}`),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Tenant, "id" | "createdAt" | "updatedAt">) =>
      api.post<Tenant>("/tenants", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TENANTS_KEY }),
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Tenant> & { id: string }) =>
      api.put<Tenant>(`/tenants/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TENANTS_KEY }),
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tenants/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TENANTS_KEY }),
  });
}
