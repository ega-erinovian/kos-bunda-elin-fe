"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ReceivableByTenant } from "@/types";

type Props = {
  rows: ReceivableByTenant[];
};

export function ReceivableTenantTable({ rows }: Props) {
  return (
    <>
      <div className="flex bg-muted/50 px-6 text-label-md text-muted-foreground">
        <div className="flex-1 py-4">Penghuni</div>
        <div className="w-36 py-4">Periode Belum Bayar</div>
        <div className="w-44 py-4">Sisa Tagihan</div>
        <div className="w-16 py-4 text-right">Aksi</div>
      </div>

      {rows.map((row) => (
        <Link
          key={row.penyewaId}
          href={`/admin/payments?penyewaId=${row.penyewaId}`}
          className="flex items-center border-t border-border/30 px-6 py-4 hover:bg-muted/30 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <div className="flex-1 text-label-md font-medium text-on-surface">{row.nama}</div>
          <div className="w-36 text-label-md text-on-surface">{row.unpaidPeriods} periode</div>
          <div className="w-44 text-label-md font-semibold text-destructive">
            {formatCurrency(row.outstanding)}
          </div>
          <div className="flex w-16 justify-end">
            <ChevronRight className="h-4 w-4 text-on-surface-variant" />
          </div>
        </Link>
      ))}
    </>
  );
}
