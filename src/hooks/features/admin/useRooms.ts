"use client";

import { useState, useMemo } from "react";
import type { Room, FilterOption, FloorFilter } from "../../../components/features/admin/room/types";
import { PAGE_SIZE } from "../../../components/features/admin/room/constants";

export function useRooms(rooms: Room[], pageSize: number = PAGE_SIZE) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterOption>("semua");
  const [filterFloor, setFilterFloor] = useState<FloorFilter>("semua");
  const [currentPage, setCurrentPage] = useState(1);

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
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterFloor,
    setFilterFloor,
    currentPage,
    setCurrentPage,
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
