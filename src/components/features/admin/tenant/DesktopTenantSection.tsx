"use client";

import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog";
import { filterOptions, PAGE_SIZE } from "./constants";
import { useTenants } from "@/hooks/features/admin/tenants/useTenants";
import { useMarkTenantKeluar } from "@/hooks/api/use-tenants";
import { TenantDetailDialog } from "./components/TenantDetailDialog";
import { TenantFormDialog } from "./components/TenantFormDialog";
import { DesktopTenantRow } from "./components/DesktopTenantRow";
import { Pagination } from "../room/components/Pagination";
import { RoomListSkeleton } from "../room/components/RoomListSkeleton";
import { RoomListError } from "../room/components/RoomListError";
import toast from "react-hot-toast";
import type { Tenant } from "./types";

export function DesktopTenantSection() {
  const {
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
  } = useTenants();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [tenantToSetKeluar, setTenantToSetKeluar] = useState<Tenant | null>(null);
  const { mutate: markKeluar, isPending: isMarkingKeluar } = useMarkTenantKeluar();

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

  function handleMarkKeluar(tenant: Tenant) {
    markKeluar(
      { id: tenant.id },
      {
        onSuccess: () => {
          toast.success(`${tenant.name} telah diset keluar.`);
          setTenantToSetKeluar(null);
        },
        onError: () => {
          toast.error("Gagal set keluar. Silakan coba lagi.");
        },
      },
    );
  }

  const empty = paginatedTenants.length === 0;

  return (
    <div className="hidden space-y-6 md:block">
      <PageHeader
        title="Manajemen Penghuni"
        subtitle="Kelola data penghuni kos, status pembayaran, dan informasi kamar."
      >
        <Button size="lg" onClick={handleAddTenant}>
          <Plus className="h-4 w-4" />
          Tambah Penghuni
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-0 flex-1 basis-60">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            placeholder="Cari nama atau kamar..."
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
            <SelectTrigger className="w-38.75 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground">
              <Filter className="h-4 w-4 shrink-0" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent align="start">
              {filterOptions.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/30 bg-card shadow-ambient-md">
        <div className="hidden items-center bg-muted/50 px-6 md:flex">
          <div className="w-64 py-4 text-label-md text-muted-foreground">Nama Penghuni</div>
          <div className="w-40 py-4 text-label-md text-muted-foreground">No. Telepon</div>
          <div className="w-24 py-4 text-label-md text-muted-foreground">Kamar</div>
          <div className="w-32 py-4 text-label-md text-muted-foreground">Tanggal Masuk</div>
          <div className="w-32 py-4 text-label-md text-muted-foreground">Biaya Sewa</div>
          <div className="w-44 py-4 text-label-md text-muted-foreground">
            Jatuh Tempo Berikutnya
          </div>
          <div className="w-24 py-4 text-right text-label-md text-muted-foreground">Aksi</div>
        </div>

        {isLoading ? (
          <RoomListSkeleton variant="desktop" />
        ) : isError ? (
          <div className="border-t border-border/30 px-6 py-6">
            <RoomListError onRetry={refetch} title="Gagal memuat data penghuni" />
          </div>
        ) : !empty ? (
          paginatedTenants.map((tenant) => (
            <DesktopTenantRow
              key={tenant.id}
              tenant={tenant}
              onDetailClick={() => openDetail(tenant)}
              onEdit={() => handleEditTenant(tenant.id)}
              onSetKeluar={() => setTenantToSetKeluar(tenant)}
            />
          ))
        ) : (
          <div className="py-12 text-center text-body-md text-muted-foreground">
            Tidak ada penghuni yang ditemukan.
          </div>
        )}

        <Pagination
          variant="desktop"
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTenants.length}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
          itemLabel="penghuni"
        />
      </div>

      <TenantFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingTenantId={editingTenantId}
      />

      <TenantDetailDialog
        tenantId={selectedTenantId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEditFromDetail}
      />

      <DeleteAlertDialog
        open={tenantToSetKeluar !== null}
        onOpenChange={(open) => !open && setTenantToSetKeluar(null)}
        title="Set Penghuni Keluar"
        description={
          tenantToSetKeluar
            ? `${tenantToSetKeluar.name} akan diset keluar dari kamar ${tenantToSetKeluar.room}. Status penghuni akan berubah menjadi tidak aktif. Lanjutkan?`
            : undefined
        }
        confirmLabel="Set Keluar"
        isPending={isMarkingKeluar}
        onConfirm={() => tenantToSetKeluar && handleMarkKeluar(tenantToSetKeluar)}
      />
    </div>
  );
}
