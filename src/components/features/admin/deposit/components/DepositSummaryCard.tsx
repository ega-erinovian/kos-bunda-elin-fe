"use client";

import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { useDeposits } from "@/hooks/api/use-deposits";
import { DepositStatusBadge } from "./DepositStatusBadge";
import { remainingOf } from "../mappers";

type Props = {
  penyewaId: string;
};

export function DepositSummaryCard({ penyewaId }: Props) {
  const { data, isLoading, isError } = useDeposits({ penyewaId });
  const deposits = data?.data ?? [];

  if (isLoading) {
    return (
      <Card variant="bordered" className="p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-6 w-24" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card variant="bordered" className="p-4">
        <p className="text-label-sm text-destructive">Gagal memuat deposit</p>
      </Card>
    );
  }

  if (deposits.length === 0) {
    return (
      <Card variant="bordered" className="p-4">
        <div className="flex items-center gap-2 text-label-md font-medium text-on-surface">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PiggyBank className="h-4 w-4" />
          </span>
          Deposit
        </div>
        <p className="mt-2 text-label-sm text-on-surface-variant">
          Belum ada deposit untuk penghuni ini.
        </p>
        <Link
          href="/admin/finance/deposits"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3")}
        >
          Kelola Deposit
        </Link>
      </Card>
    );
  }

  const totalReceived = deposits.reduce((s, d) => s + d.amountReceived, 0);
  const totalDeduction = deposits.reduce((s, d) => s + (d.deductionAmount ?? 0), 0);
  const totalRefund = deposits.reduce((s, d) => s + (d.refundAmount ?? 0), 0);
  const totalRefundable = deposits.reduce((s, d) => s + remainingOf(d), 0);
  const heldCount = deposits.filter((d) => d.status === "HELD").length;

  return (
    <Card variant="bordered" className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-label-md font-medium text-on-surface">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PiggyBank className="h-4 w-4" />
          </span>
          Deposit
          <span className="text-label-sm font-normal text-on-surface-variant">
            · {deposits.length} catatan
          </span>
        </div>
        <Link
          href="/admin/finance/deposits"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-7 px-2")}
        >
          Lihat semua
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/40 p-3">
          <p className="text-label-sm text-on-surface-variant">Diterima</p>
          <p className="mt-1 font-heading text-heading-md font-semibold text-on-surface">
            {formatCurrency(totalReceived)}
          </p>
        </div>
        <div className="rounded-xl bg-muted/40 p-3">
          <p className="text-label-sm text-on-surface-variant">Refundable</p>
          <p className="mt-1 font-heading text-heading-md font-semibold text-primary">
            {formatCurrency(totalRefundable)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-label-sm text-on-surface-variant">
        <span>Potongan {formatCurrency(totalDeduction)}</span>
        <span>·</span>
        <span>Refund {formatCurrency(totalRefund)}</span>
        {heldCount > 0 && (
          <>
            <span>·</span>
            <span>{heldCount} HELD</span>
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {deposits.slice(0, 4).map((d) => (
          <DepositStatusBadge key={d.id} status={d.status} />
        ))}
        {deposits.length > 4 && (
          <span className="text-label-sm text-on-surface-variant">+{deposits.length - 4} lagi</span>
        )}
      </div>
    </Card>
  );
}
