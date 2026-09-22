"use client";

import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDepositsSection } from "@/hooks/features/admin/deposit/useDepositsSection";
import { DepositFilters } from "./components/DepositFilters";
import { DepositCard } from "./components/DepositCard";
import { DepositTable } from "./components/DepositTable";
import { DepositReceiveDialog } from "./components/DepositReceiveDialog";
import { DepositDeductDialog } from "./components/DepositDeductDialog";
import { DepositRefundDialog } from "./components/DepositRefundDialog";

export function DepositsSection() {
  const {
    penyewaId,
    status,
    deposits,
    tenants,
    isLoading,
    isError,
    refetch,
    receiveOpen,
    setReceiveOpen,
    deductTarget,
    setDeductTarget,
    refundTarget,
    setRefundTarget,
    getTenantName,
    handlePenyewaChange,
    handleStatusChange,
    handleReset,
    hasActiveFilters,
  } = useDepositsSection();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deposit"
        subtitle={`${deposits.length} deposit · FORFEITED hanya tampil, tanpa aksi`}
      >
        <Button onClick={() => setReceiveOpen(true)}>
          <Plus className="h-4 w-4" />
          Terima Deposit
        </Button>
      </PageHeader>

      {/* Mobile */}
      <div className="space-y-4 md:hidden">
        <DepositFilters
          penyewaId={penyewaId}
          status={status}
          tenants={tenants}
          onPenyewaChange={handlePenyewaChange}
          onStatusChange={handleStatusChange}
          onReset={handleReset}
          hasActive={hasActiveFilters}
        />

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse p-4">
                <div className="h-4 w-24 rounded bg-surface-container-highest" />
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-label-md text-destructive">Gagal memuat deposit</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </Card>
        ) : deposits.length === 0 ? (
          <Card className="p-8 text-center text-body-md text-on-surface-variant">
            Tidak ada deposit.
          </Card>
        ) : (
          <div className="space-y-3">
            {deposits.map((d) => (
              <DepositCard
                key={d.id}
                deposit={d}
                tenantName={getTenantName(d.penyewaId)}
                onDeduct={() => setDeductTarget(d)}
                onRefund={() => setRefundTarget(d)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden space-y-4 md:block">
        <div className="flex flex-wrap items-center gap-3">
          <DepositFilters
            penyewaId={penyewaId}
            status={status}
            tenants={tenants}
            onPenyewaChange={handlePenyewaChange}
            onStatusChange={handleStatusChange}
            onReset={handleReset}
            hasActive={hasActiveFilters}
          />
        </div>

        <div className="overflow-hidden rounded-3xl border border-border/30 bg-card shadow-ambient-md">
          {isLoading ? (
            <div className="animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-t border-border/30 px-6 py-4">
                  <div className="h-4 w-24 rounded bg-surface-container-highest" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="border-t border-border/30 p-6 text-center text-body-md text-destructive">
              Gagal memuat
            </div>
          ) : deposits.length === 0 ? (
            <div className="py-12 text-center text-body-md text-muted-foreground">
              Tidak ada deposit.
            </div>
          ) : (
            <DepositTable
              deposits={deposits}
              getTenantName={getTenantName}
              onDeduct={(d) => setDeductTarget(d)}
              onRefund={(d) => setRefundTarget(d)}
            />
          )}
        </div>
      </div>

      <DepositReceiveDialog open={receiveOpen} onOpenChange={setReceiveOpen} tenants={tenants} />
      <DepositDeductDialog
        open={!!deductTarget}
        onOpenChange={(o) => !o && setDeductTarget(null)}
        deposit={deductTarget}
      />
      <DepositRefundDialog
        open={!!refundTarget}
        onOpenChange={(o) => !o && setRefundTarget(null)}
        deposit={refundTarget}
      />
    </div>
  );
}
