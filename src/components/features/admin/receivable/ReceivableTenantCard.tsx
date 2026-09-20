"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ReceivableByTenant } from "@/types";

type Props = {
  row: ReceivableByTenant;
};

export function ReceivableTenantCard({ row }: Props) {
  return (
    <Link
      href={`/admin/payments?penyewaId=${row.penyewaId}`}
      className="block rounded-xl focus-visible:outline-2 focus-visible:outline-primary"
    >
      <Card variant="bordered" className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-label-md font-semibold text-on-surface">{row.nama}</p>
            <p className="text-label-sm text-on-surface-variant">
              {row.unpaidPeriods} periode belum bayar
            </p>
          </div>
          <Badge variant="destructive">{formatCurrency(row.outstanding)}</Badge>
          <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant" />
        </div>
      </Card>
    </Link>
  );
}
