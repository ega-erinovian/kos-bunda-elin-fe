"use client";

import { useMemo, useState } from "react";
import { useRooms as useRoomsApi, type RoomListParams } from "@/hooks/api/use-rooms";
import { usePagedSearch } from "@/hooks/usePagedSearch";
import type {
  FilterOption,
  FloorFilter,
  FloorOption,
} from "@/components/features/admin/room/types";
import type { Room as ApiRoom } from "@/types";
import { PAGE_SIZE } from "@/components/features/admin/room/constants";
import { mapRoom } from "@/components/features/admin/room/mappers";

const ROOMS_LIMIT = 100;

export function useRooms(pageSize: number = PAGE_SIZE) {
  const [filterStatus, setFilterStatus] = useState<FilterOption>("semua");
  const [filterFloor, setFilterFloor] = useState<FloorFilter>("semua");
  const {
    searchQuery,
    debouncedSearchQuery,
    currentPage,
    handleSearch,
    handlePageChange,
    resetPage,
  } = usePagedSearch();

  const apiParams = useMemo<RoomListParams>(() => {
    const params: RoomListParams = { page: currentPage, limit: pageSize };
    if (debouncedSearchQuery) {
      params.search = debouncedSearchQuery;
    }
    if (filterStatus !== "semua") {
      params.status = filterStatus.toUpperCase() as ApiRoom["status"];
    }
    if (filterFloor !== "semua") {
      params.lantai = String(filterFloor);
    }
    return params;
  }, [debouncedSearchQuery, filterStatus, filterFloor, currentPage, pageSize]);

  const { data, isLoading, isError, refetch } = useRoomsApi(apiParams);
  const { data: optionsData } = useRoomsApi({ limit: ROOMS_LIMIT });

  const paginatedRooms = useMemo(() => (data?.data ?? []).map(mapRoom), [data]);
  const allRooms = useMemo(() => (optionsData?.data ?? []).map(mapRoom), [optionsData]);

  const floorOptions = useMemo<FloorOption[]>(
    () => [
      { key: "semua", label: "Semua Lantai" },
      ...[...new Set(allRooms.map((room) => room.floor))]
        .sort((a, b) => a - b)
        .map((floor) => ({ key: floor, label: `Lantai ${floor}` })),
    ],
    [allRooms],
  );

  const totalPages = data?.meta.totalPages ?? 1;
  const totalItems = data?.meta.total ?? 0;

  function handleFilterStatusChange(value: FilterOption) {
    setFilterStatus(value);
    resetPage();
  }

  function handleFilterFloorChange(value: FloorFilter) {
    setFilterFloor(value);
    resetPage();
  }

  function hasActiveFilter() {
    return filterStatus !== "semua" || filterFloor !== "semua";
  }

  function activeFilterCount() {
    return (filterStatus !== "semua" ? 1 : 0) + (filterFloor !== "semua" ? 1 : 0);
  }

  return {
    floorOptions,
    isLoading,
    isError,
    refetch,
    searchQuery,
    filterStatus,
    filterFloor,
    currentPage,
    totalItems,
    totalPages,
    paginatedRooms,
    handleSearch,
    handlePageChange,
    handleFilterStatusChange,
    handleFilterFloorChange,
    hasActiveFilter,
    activeFilterCount,
  };
}
