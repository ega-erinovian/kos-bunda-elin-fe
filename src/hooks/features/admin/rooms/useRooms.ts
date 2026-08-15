"use client";

import { useMemo, useState } from "react";
import { useRooms as useRoomsApi, type RoomListParams } from "@/hooks/api/use-rooms";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterOption>("semua");
  const [filterFloor, setFilterFloor] = useState<FloorFilter>("semua");
  const [currentPage, setCurrentPage] = useState(1);

  const apiParams = useMemo<RoomListParams>(() => {
    const params: RoomListParams = { limit: ROOMS_LIMIT };
    if (filterStatus !== "semua") {
      params.status = filterStatus.toUpperCase() as ApiRoom["status"];
    }
    if (filterFloor !== "semua") {
      params.lantai = String(filterFloor);
    }
    return params;
  }, [filterStatus, filterFloor]);

  const { data, isLoading, isError, refetch } = useRoomsApi(apiParams);
  const { data: optionsData } = useRoomsApi({ limit: ROOMS_LIMIT });

  const rooms = useMemo(() => (data?.data ?? []).map(mapRoom), [data]);
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

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!room.number.toLowerCase().includes(q) && !`lantai ${room.floor}`.includes(q))
          return false;
      }
      return true;
    });
  }, [rooms, searchQuery]);

  const totalPages = Math.ceil(filteredRooms.length / pageSize);
  const paginatedRooms = filteredRooms.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
    hasActiveFilter,
    activeFilterCount,
  };
}
