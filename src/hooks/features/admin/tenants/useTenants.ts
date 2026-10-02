"use client";

import { useMemo, useState } from "react";
import { useTenants as useTenantsApi, type TenantListParams } from "@/hooks/api/use-tenants";
import { usePagedSearch } from "@/hooks/usePagedSearch";
import type { FilterOption } from "@/components/features/admin/tenant/types";
import { PAGE_SIZE } from "@/components/features/admin/tenant/constants";
import { mapTenant } from "@/components/features/admin/tenant/mappers";

export function useTenants(pageSize: number = PAGE_SIZE) {
  const [filterStatus, setFilterStatus] = useState<FilterOption>("semua");
  const {
    searchQuery,
    debouncedSearchQuery,
    currentPage,
    handleSearch,
    handlePageChange,
    resetPage,
  } = usePagedSearch();

  const apiParams = useMemo<TenantListParams>(() => {
    const params: TenantListParams = { page: currentPage, limit: pageSize };
    if (debouncedSearchQuery) {
      params.search = debouncedSearchQuery;
    }
    if (filterStatus === "aktif") {
      params.aktif = true;
    }
    if (filterStatus === "nonaktif") {
      params.aktif = false;
    }
    return params;
  }, [debouncedSearchQuery, filterStatus, currentPage, pageSize]);

  const { data, isLoading, isError, refetch } = useTenantsApi(apiParams);

  const paginatedTenants = useMemo(() => (data?.data ?? []).map(mapTenant), [data]);

  const totalPages = data?.meta.totalPages ?? 1;
  const totalItems = data?.meta.total ?? 0;

  function handleFilterStatusChange(value: FilterOption) {
    setFilterStatus(value);
    resetPage();
  }

  function hasActiveFilter() {
    return filterStatus !== "semua";
  }

  function activeFilterCount() {
    return filterStatus !== "semua" ? 1 : 0;
  }

  return {
    isLoading,
    isError,
    refetch,
    searchQuery,
    filterStatus,
    currentPage,
    totalItems,
    totalPages,
    paginatedTenants,
    handleSearch,
    handlePageChange,
    handleFilterStatusChange,
    hasActiveFilter,
    activeFilterCount,
  };
}
