"use client";

import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FilterOption, FloorFilter } from "./types";
import { PAGE_SIZE } from "./constants";
import { useRooms } from "@/hooks/features/admin/rooms/useRooms";
import { FilterSheet } from "./components/FilterSheet";
import { MobileRoomCard } from "./components/MobileRoomCard";
import { EmptyState } from "./components/EmptyState";
import { Pagination } from "./components/Pagination";
import { RoomListSkeleton } from "./components/RoomListSkeleton";
import { RoomListError } from "./components/RoomListError";

export function MobileRoomSection() {
  const {
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
    applyFilters,
    hasActiveFilter,
    activeFilterCount,
  } = useRooms();

  const [filterOpen, setFilterOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<FilterOption>(filterStatus);
  const [draftFloor, setDraftFloor] = useState<FloorFilter>(filterFloor);

  function openFilterSheet() {
    setDraftStatus(filterStatus);
    setDraftFloor(filterFloor);
    setFilterOpen(true);
  }

  function onApplyFilters() {
    applyFilters(draftStatus, draftFloor);
    setFilterOpen(false);
  }

  function onResetFilters() {
    setDraftStatus("semua");
    setDraftFloor("semua");
  }

  return (
    <div className="space-y-4 md:hidden">
      <h1 className="font-heading text-heading-lg-mobile font-bold text-on-surface">
        Manajemen Kamar
      </h1>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            placeholder="Cari kamar..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-11.5 w-full rounded-xl border-secondary-container pl-10 shadow-[0_4px_20px_-2px_rgba(134,167,137,0.08)]"
          />
        </div>
        <button
          onClick={openFilterSheet}
          className={cn(
            "relative flex h-11.5 w-11.5 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition-colors",
            hasActiveFilter()
              ? "border-primary bg-primary/10 text-primary"
              : "border-outline-variant bg-surface text-on-surface-variant",
          )}
        >
          <Filter className="h-5 w-5" />
          {hasActiveFilter() && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-on-primary">
              {activeFilterCount()}
            </span>
          )}
        </button>
      </div>

      <FilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        draftStatus={draftStatus}
        draftFloor={draftFloor}
        floorOptions={floorOptions}
        onDraftStatusChange={setDraftStatus}
        onDraftFloorChange={setDraftFloor}
        onApply={onApplyFilters}
        onReset={onResetFilters}
      />

      <div className="flex flex-col gap-4 pb-4">
        {isLoading ? (
          <RoomListSkeleton variant="mobile" />
        ) : isError ? (
          <RoomListError onRetry={refetch} />
        ) : paginatedRooms.length > 0 ? (
          paginatedRooms.map((room) => <MobileRoomCard key={room.id} room={room} />)
        ) : (
          <EmptyState />
        )}
      </div>

      <Pagination
        variant="mobile"
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredRooms.length}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />

      <button className="fixed bottom-24 right-4 z-30 flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg transition-colors hover:bg-primary/90 md:hidden">
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
