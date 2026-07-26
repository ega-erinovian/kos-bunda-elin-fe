"use client"

import { useState } from "react"
import { Search, Plus, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { dummyTenants, PAGE_SIZE, filterOptions } from "./constants"
import { useTenants } from "../../../../hooks/features/admin/useTenants"
import { TenantDetailDialog } from "./components/TenantDetailDialog"
import type { Tenant } from "./types"
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react"

export function DesktopTenantSection() {
  const {
    searchQuery,
    filterStatus,
    currentPage,
    filteredTenants,
    totalPages,
    paginatedTenants,
    handleSearch,
    handlePageChange,
    handleFilterStatusChange,
  } = useTenants(dummyTenants)

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  function openDetail(tenant: Tenant) {
    setSelectedTenant(tenant)
    setDetailOpen(true)
  }

  const empty = paginatedTenants.length === 0
  const from = (currentPage - 1) * PAGE_SIZE + 1
  const to = Math.min(currentPage * PAGE_SIZE, filteredTenants.length)

  return (
    <div className="hidden space-y-6 md:block">
      <PageHeader
        title="Manajemen Penghuni"
        subtitle="Kelola data penghuni kos, status pembayaran, dan informasi kamar."
      >
        <Button size="lg">
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
        <div className="hidden items-center bg-muted/50 md:flex">
          <div className="flex-2 px-6 py-4 text-label-md text-muted-foreground">
            Nama Penghuni
          </div>
          <div className="flex-1 px-6 py-4 text-label-md text-muted-foreground">
            No. Telepon
          </div>
          <div className="flex-1 px-6 py-4 text-label-md text-muted-foreground">
            Kamar
          </div>
          <div className="flex-1 px-6 py-4 text-label-md text-muted-foreground">
            Tanggal Masuk
          </div>
          <div className="flex-1 px-6 py-4 text-label-md text-muted-foreground">
            Biaya Sewa
          </div>
          <div className="flex-[1.5] px-6 py-4 text-label-md text-muted-foreground">
            Jatuh Tempo Berikutnya
          </div>
          <div className="w-24 px-6 py-4 text-right text-label-md text-muted-foreground">
            Aksi
          </div>
        </div>

        {!empty ? (
          paginatedTenants.map((tenant) => (
            <DesktopTenantRow
              key={tenant.id}
              tenant={tenant}
              onDetailClick={() => openDetail(tenant)}
            />
          ))
        ) : (
          <div className="py-12 text-center text-body-md text-muted-foreground">
            Tidak ada penghuni yang ditemukan.
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/30 px-6 py-4">
            <span className="text-sm text-muted-foreground">
              Menampilkan {from}-{to} dari {filteredTenants.length} penghuni
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <TenantDetailDialog
        tenant={selectedTenant}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}

function DesktopTenantRow({
  tenant,
  onDetailClick,
}: {
  tenant: Tenant
  onDetailClick: () => void
}) {
  const dueBadgeVariant = {
    default: "default" as const,
    secondary: "secondary" as const,
    destructive: "destructive" as const,
    outline: "outline" as const,
  }[tenant.dueVariant]

  return (
    <div className="flex flex-col gap-4 border-t border-border/30 px-6 py-4 transition-colors hover:bg-muted/30 md:flex-row md:items-center md:gap-0">
      <div className="flex flex-2 items-center gap-3">
        <button
          onClick={onDetailClick}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
            {tenant.initials}
          </div>
          <span className="text-sm font-semibold text-on-surface transition-colors hover:text-primary">
            {tenant.name}
          </span>
        </button>
      </div>

      <div className="flex-1 text-sm text-muted-foreground">{tenant.phone}</div>

      <div className="flex-1">
        <Badge variant="outline" className="font-medium">
          {tenant.room}
        </Badge>
      </div>

      <div className="flex-1 text-sm text-muted-foreground">{tenant.checkInDate}</div>

      <div className="flex-1 text-sm text-on-surface">
        {formatCurrency(tenant.rentCost)}
      </div>

      <div className="flex-[1.5]">
        <Badge variant={dueBadgeVariant}>{tenant.dueLabel}</Badge>
      </div>

      <div className="flex w-full justify-end gap-2 md:w-24">
        <button

          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:text-primary"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button

          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:text-destructive"
          title="Hapus"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
