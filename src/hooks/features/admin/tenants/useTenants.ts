"use client";

import { useMemo, useState } from "react";
import { useTenants as useTenantsApi, type TenantListParams } from "@/hooks/api/use-tenants";
import type { FilterOption } from "@/components/features/admin/tenant/types";
import { PAGE_SIZE } from "@/components/features/admin/tenant/constants";
import { mapTenant } from "@/components/features/admin/tenant/mappers";

const TENANTS_LIMIT = 100;

export function useTenants(pageSize: number = PAGE_SIZE) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterOption>("semua");
  const [currentPage, setCurrentPage] = useState(1);

  const apiParams = useMemo<TenantListParams>(() => {
    const params: TenantListParams = { limit: TENANTS_LIMIT };
    if (filterStatus === "aktif") {
      params.aktif = true;
    }
    if (filterStatus === "nonaktif") {
      params.aktif = false;
    }
    return params;
  }, [filterStatus]);

  const { data, isLoading, isError, refetch } = useTenantsApi(apiParams);

  const tenants = useMemo(() => (data?.data ?? []).map(mapTenant), [data]);

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!tenant.name.toLowerCase().includes(q) && !tenant.room.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [tenants, searchQuery]);

  const totalPages = Math.ceil(filteredTenants.length / pageSize);
  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function handleSearch(value: string) {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  function handleFilterStatusChange(value: FilterOption) {
    setFilterStatus(value);
    setCurrentPage(1);
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
    filteredTenants,
    totalPages,
    paginatedTenants,
    handleSearch,
    handlePageChange,
    handleFilterStatusChange,
    hasActiveFilter,
    activeFilterCount,
  };
}
