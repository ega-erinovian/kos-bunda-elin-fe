"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useReceivablesSection } from "@/hooks/features/admin/receivable/useReceivablesSection";
import { ReceivablesFilters } from "./ReceivablesFilters";
import { ReceivablesSummaryCards } from "./ReceivablesSummaryCards";
import { ReceivableTenantCard } from "./ReceivableTenantCard";
import { ReceivableTenantTable } from "./ReceivableTenantTable";
import { AgingReportChart } from "./AgingReportChart";

export function ReceivablesSection() {
  const {
    asOf,
    today,
    isFutureAsOf,
    sortKey,
    setSortKey,
    receivables,
    summary,
    buckets,
    isLoading,
    isError,
    refetch,
    handleAsOfChange,
    handleResetAsOf,
  } = useReceivablesSection();

  const filters = (
    <ReceivablesFilters
      asOf={asOf}
      today={today}
      isFutureAsOf={isFutureAsOf}
      sortKey={sortKey}
      onAsOfChange={handleAsOfChange}
      onSortKeyChange={setSortKey}
      onReset={handleResetAsOf}
    />
  );

  const listBody = isLoading ? (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="animate-pulse p-4">
          <div className="h-4 w-24 rounded bg-surface-container-highest" />
        </Card>
      ))}
    </div>
  ) : isError ? (
    <Card className="border-destructive/20 bg-destructive/5 p-6 text-center">
      <p className="text-label-md text-destructive">Gagal memuat piutang</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
        Coba lagi
      </Button>
    </Card>
  ) : receivables.length === 0 ? (
    <Card className="p-8 text-center text-body-md text-on-surface-variant">
      Tidak ada piutang pada tanggal ini.
    </Card>
  ) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Piutang"
        subtitle={`${summary?.unpaidPeriodCount ?? 0} periode belum bayar · ${receivables.length} penghuni`}
      />

      {filters}
      <ReceivablesSummaryCards summary={summary} isLoading={isLoading} />
      <AgingReportChart buckets={buckets} isLoading={isLoading} />

      {/* Mobile list */}
      <div className="space-y-4 md:hidden">
        {listBody ?? (
          <div className="space-y-3">
            {receivables.map((row) => (
              <ReceivableTenantCard key={row.penyewaId} row={row} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop list */}
      <div className="hidden md:block">
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
          ) : receivables.length === 0 ? (
            <div className="py-12 text-center text-body-md text-muted-foreground">
              Tidak ada piutang pada tanggal ini.
            </div>
          ) : (
            <ReceivableTenantTable rows={receivables} />
          )}
        </div>
      </div>
    </div>
  );
}
