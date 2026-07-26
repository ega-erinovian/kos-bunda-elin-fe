"use client"

import { useState } from "react"
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { dummyTenants, PAGE_SIZE } from "./constants"
import { useTenants } from "./hooks/useTenants"
import { MobileTenantCard } from "./components/MobileTenantCard"
import { TenantDetailDrawer } from "./components/TenantDetailDrawer"
import type { Tenant } from "./types"

export function MobileTenantSection() {
  const {
    searchQuery,
    currentPage,
    filteredTenants,
    totalPages,
    paginatedTenants,
    handleSearch,
    handlePageChange,
  } = useTenants(dummyTenants)

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  function openDetail(tenant: Tenant) {
    setSelectedTenant(tenant)
    setDetailOpen(true)
  }

  const from = (currentPage - 1) * PAGE_SIZE + 1
  const to = Math.min(currentPage * PAGE_SIZE, filteredTenants.length)

  return (
    <div className="space-y-4 md:hidden">
      <h1 className="text-heading-lg-mobile font-bold text-on-surface">
        Tenants
      </h1>

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
        {paginatedTenants.length > 0 ? (
          paginatedTenants.map((tenant) => (
            <MobileTenantCard
              key={tenant.id}
              tenant={tenant}
              onClick={openDetail}
            />
          ))
        ) : (
          <div className="py-12 text-center text-body-md text-on-surface-variant">
            Penghuni tidak ditemukan.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-label-sm text-on-surface-variant">
            {from}-{to} dari {filteredTenants.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <button className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg transition-colors hover:bg-primary/90 md:hidden">
        <Plus className="h-6 w-6" />
      </button>

      <TenantDetailDrawer
        tenant={selectedTenant}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
