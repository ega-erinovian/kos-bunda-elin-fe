"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTenants } from "@/hooks/features/admin/tenants/useTenants";
import { MobileTenantCard } from "./components/MobileTenantCard";
import { TenantDetailDrawer } from "./components/TenantDetailDrawer";
import { TenantFormDialog } from "./components/TenantFormDialog";
import { Pagination } from "../room/components/Pagination";
import { RoomListSkeleton } from "../room/components/RoomListSkeleton";
import { RoomListError } from "../room/components/RoomListError";
import { PAGE_SIZE } from "./constants";
import type { Tenant } from "./types";

export function MobileTenantSection() {
  const {
    isLoading,
    isError,
    refetch,
    searchQuery,
    currentPage,
    filteredTenants,
    totalPages,
    paginatedTenants,
    handleSearch,
    handlePageChange,
  } = useTenants();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  function handleAddTenant() {
    setEditingTenantId(null);
    setFormOpen(true);
  }

  function handleEditTenant(id: string) {
    setEditingTenantId(id);
    setFormOpen(true);
  }

  function handleEditFromDetail(id: string) {
    setDetailOpen(false);
    handleEditTenant(id);
  }

  function openDetail(tenant: Tenant) {
    setSelectedTenantId(tenant.id);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-4 md:hidden">
      <h1 className="text-heading-lg-mobile font-bold text-on-surface">Tenants</h1>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
        <Input
          placeholder="Cari nama atau kamar..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-[46px] w-full rounded-xl border-outline-variant bg-surface-container-lowest pl-12 shadow-[0_4px_20px_-2px_rgba(134,167,137,0.08)]"
        />
      </div>

      <div className="flex flex-col gap-3 pb-4">
        {isLoading ? (
          <RoomListSkeleton variant="mobile" />
        ) : isError ? (
          <RoomListError onRetry={refetch} title="Gagal memuat data penghuni" />
        ) : paginatedTenants.length > 0 ? (
          paginatedTenants.map((tenant) => (
            <MobileTenantCard key={tenant.id} tenant={tenant} onClick={openDetail} />
          ))
        ) : (
          <div className="py-12 text-center text-body-md text-on-surface-variant">
            Penghuni tidak ditemukan.
          </div>
        )}
      </div>

      <Pagination
        variant="mobile"
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredTenants.length}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        itemLabel="penghuni"
      />

      <button
        onClick={handleAddTenant}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg transition-colors hover:bg-primary/90 md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      <TenantFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingTenantId={editingTenantId}
      />

      <TenantDetailDrawer
        tenantId={selectedTenantId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEditFromDetail}
      />
    </div>
  );
}
