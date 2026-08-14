"use client";

import { useMemo, useState } from "react";
import { useRooms as useRoomsApi } from "@/hooks/api/use-rooms";
import type {
  FilterOption,
  FloorFilter,
  FloorOption,
} from "@/components/features/admin/room/types";
import { PAGE_SIZE } from "@/components/features/admin/room/constants";
import { mapRoom } from "@/components/features/admin/room/mappers";

const ROOMS_LIMIT = 100;

export function useRooms(pageSize: number = PAGE_SIZE) {
  const { data, isLoading, isError, refetch } = useRoomsApi({ limit: ROOMS_LIMIT });

  const rooms = useMemo(() => (data?.data ?? []).map(mapRoom), [data]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterOption>("semua");
  const [filterFloor, setFilterFloor] = useState<FloorFilter>("semua");
  const [currentPage, setCurrentPage] = useState(1);

  const floorOptions = useMemo<FloorOption[]>(
    () => [
      { key: "semua", label: "Semua Lantai" },
      ...[...new Set(rooms.map((room) => room.floor))]
        .sort((a, b) => a - b)
        .map((floor) => ({ key: floor, label: `Lantai ${floor}` })),
    ],
    [rooms],
  );

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !room.number.toLowerCase().includes(q) &&
          !`lantai ${room.floor}`.includes(q)
        )
          return false;
      }
      if (filterStatus !== "semua" && room.status !== filterStatus) return false;
      if (filterFloor !== "semua" && room.floor !== filterFloor) return false;
      return true;
    });
  }, [rooms, searchQuery, filterStatus, filterFloor]);

  const totalPages = Math.ceil(filteredRooms.length / pageSize);
  const paginatedRooms = filteredRooms.slice(
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

  function handleFilterFloorChange(value: FloorFilter) {
    setFilterFloor(value);
    setCurrentPage(1);
  }

  function applyFilters(status: FilterOption, floor: FloorFilter) {
    setFilterStatus(status);
    setFilterFloor(floor);
    setCurrentPage(1);
  }

  function hasActiveFilter() {
    return filterStatus !== "semua" || filterFloor !== "semua";
  }

  function activeFilterCount() {
    return (filterStatus !== "semua" ? 1 : 0) + (filterFloor !== "semua" ? 1 : 0);
  }

  return {
    rooms,
    floorOptions,
    isLoading,
    isError,
    refetch,
    searchQuery,
    filterStatus,
    filterFloor,
    currentPage,
    filteredRooms,
    totalPages,
    paginatedRooms,
    handleSearch,
    handlePageChange,
    handleFilterStatusChange,
    handleFilterFloorChange,
    applyFilters,
    hasActiveFilter,
    activeFilterCount,
  };
}