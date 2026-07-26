"use client";

import { Search, Plus, Filter, Layers } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dummyRooms, PAGE_SIZE } from "./constants";
import { useRooms } from "../../../../hooks/features/admin/useRooms";
import { DesktopRoomRow } from "./components/DesktopRoomRow";
import { Pagination } from "./components/Pagination";

export function DesktopRoomSection() {
  const {
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
  } = useRooms(dummyRooms);

  const empty = paginatedRooms.length === 0;

  return (
    <div className="hidden space-y-6 md:block">
      <PageHeader title="Manajemen Kamar" subtitle="Kelola data kamar kos.">
        <Button size="lg">
          <Plus className="h-4 w-4" />
          Tambah Kamar
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-0 flex-1 basis-60">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            placeholder="Cari kamar atau lantai..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border-outline-variant bg-surface-container-lowest pl-12 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={filterStatus}
            onValueChange={(v) => handleFilterStatusChange(v as typeof filterStatus)}
          >
            <SelectTrigger className="w-35 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground">
              <Filter className="h-4 w-4 shrink-0" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="semua">Semua</SelectItem>
              <SelectItem value="terisi">Terisi</SelectItem>
              <SelectItem value="kosong">Kosong</SelectItem>
              <SelectItem value="perbaikan">Perbaikan</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterFloor === "semua" ? "semua" : String(filterFloor)}
            onValueChange={(v) => handleFilterFloorChange(v === "semua" ? "semua" : Number(v))}
          >
            <SelectTrigger className="w-38.75 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground">
              <Layers className="h-4 w-4 shrink-0" />
              <SelectValue placeholder="Lantai" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="semua">Semua Lantai</SelectItem>
              <SelectItem value="1">Lantai 1</SelectItem>
              <SelectItem value="2">Lantai 2</SelectItem>
              <SelectItem value="3">Lantai 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/30 bg-card shadow-ambient-md">
        <div className="hidden items-center bg-muted/50 md:flex">
          <div className="flex-2 px-6 py-4 text-label-md text-muted-foreground">Kamar</div>
          <div className="flex-1 px-6 py-4 text-label-md text-muted-foreground">Penghuni</div>
          <div className="flex-1 px-6 py-4 text-label-md text-muted-foreground">Lantai</div>
          <div className="flex-1 px-6 py-4 text-label-md text-muted-foreground">Harga</div>
          <div className="flex-[1.5] px-6 py-4 text-label-md text-muted-foreground">Status</div>
          <div className="w-24 px-6 py-4 text-right text-label-md text-muted-foreground">Aksi</div>
        </div>

        {!empty ? (
          paginatedRooms.map((room) => <DesktopRoomRow key={room.id} room={room} />)
        ) : (
          <div className="py-12 text-center text-body-md text-muted-foreground">
            Tidak ada kamar yang ditemukan.
          </div>
        )}

        <Pagination
          variant="desktop"
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredRooms.length}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
