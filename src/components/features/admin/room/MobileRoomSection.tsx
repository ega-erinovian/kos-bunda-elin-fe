"use client";

import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAGE_SIZE } from "./constants";
import { useRooms } from "@/hooks/features/admin/rooms/useRooms";
import { useDeleteRoom } from "@/hooks/api/use-rooms";
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog";
import { FilterSheet } from "./components/FilterSheet";
import { MobileRoomCard } from "./components/MobileRoomCard";
import { EmptyState } from "./components/EmptyState";
import { Pagination } from "./components/Pagination";
import { RoomListSkeleton } from "./components/RoomListSkeleton";
import { RoomListError } from "./components/RoomListError";
import { RoomFormDialog } from "./components/RoomFormDialog";
import { SearchInput } from "../../../ui/SearchInput";
import toast from "react-hot-toast";
import type { Room } from "./types";

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
    totalItems,
    totalPages,
    paginatedRooms,
    handleSearch,
    handlePageChange,
    handleFilterStatusChange,
    handleFilterFloorChange,
    hasActiveFilter,
    activeFilterCount,
  } = useRooms();

  const [filterOpen, setFilterOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const { mutate: deleteRoom, isPending: isDeleting } = useDeleteRoom();

  function onResetFilters() {
    handleFilterStatusChange("semua");
    handleFilterFloorChange("semua");
  }

  function handleAddRoom() {
    setEditingRoomId(null);
    setFormOpen(true);
  }

  function handleEditRoom(id: string) {
    setEditingRoomId(id);
    setFormOpen(true);
  }

  function handleDeleteRoom(room: Room) {
    deleteRoom(room.id, {
      onSuccess: () => {
        toast.success(`Kamar ${room.number} telah dihapus.`);
        setRoomToDelete(null);
      },
      onError: () => {
        toast.error("Gagal menghapus kamar. Silakan coba lagi.");
      },
    });
  }

  return (
    <div className="space-y-4 md:hidden">
      <h1 className="font-heading text-heading-lg-mobile font-bold text-on-surface">
        Manajemen Kamar
      </h1>

      <div className="flex items-center gap-2">
        <SearchInput
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Cari kamar..."
          wrapperClassName="flex-1"
          iconClassName="left-3"
          className="h-11.5 border-secondary-container shadow-[0_4px_20px_-2px_rgba(134,167,137,0.08)]"
        />
        <button
          onClick={() => setFilterOpen(true)}
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
        filterStatus={filterStatus}
        filterFloor={filterFloor}
        floorOptions={floorOptions}
        onStatusChange={handleFilterStatusChange}
        onFloorChange={handleFilterFloorChange}
        onReset={onResetFilters}
      />

      <div className="flex flex-col gap-4 pb-4">
        {isLoading ? (
          <RoomListSkeleton variant="mobile" />
        ) : isError ? (
          <RoomListError onRetry={refetch} />
        ) : paginatedRooms.length > 0 ? (
          paginatedRooms.map((room) => (
            <MobileRoomCard
              key={room.id}
              room={room}
              onEdit={() => handleEditRoom(room.id)}
              onDelete={() => setRoomToDelete(room)}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>

      <Pagination
        variant="mobile"
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />

      <button
        onClick={handleAddRoom}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg transition-colors hover:bg-primary/90 md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      <RoomFormDialog open={formOpen} onOpenChange={setFormOpen} editingRoomId={editingRoomId} />

      <DeleteAlertDialog
        open={roomToDelete !== null}
        onOpenChange={(open) => !open && setRoomToDelete(null)}
        title="Hapus Kamar"
        description={
          roomToDelete
            ? `Kamar ${roomToDelete.number} pada lantai ${roomToDelete.floor} akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`
            : undefined
        }
        isPending={isDeleting}
        onConfirm={() => roomToDelete && handleDeleteRoom(roomToDelete)}
      />
    </div>
  );
}
