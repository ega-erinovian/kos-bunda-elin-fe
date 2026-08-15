"use client";

import { useState, useMemo } from "react";
import type { Tenant, FilterOption } from "../../../components/features/admin/tenant/types";
import { PAGE_SIZE } from "../../../components/features/admin/tenant/constants";

export function useTenants(tenants: Tenant[], pageSize: number = PAGE_SIZE) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterOption>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!tenant.name.toLowerCase().includes(q) && !tenant.room.toLowerCase().includes(q))
          return false;
      }
      if (filterStatus === "lunas" && tenant.dueVariant !== "default") return false;
      if (filterStatus === "telat" && tenant.dueVariant !== "destructive") return false;
      if (filterStatus === "menunggak" && tenant.dueVariant !== "secondary") return false;
      return true;
    });
  }, [tenants, searchQuery, filterStatus]);

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
    return filterStatus !== "all";
  }

  function activeFilterCount() {
    return filterStatus !== "all" ? 1 : 0;
  }

  return {
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
