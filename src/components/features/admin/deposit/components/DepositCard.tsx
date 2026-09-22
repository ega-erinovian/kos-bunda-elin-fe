"use client";

import { Scissors, Undo2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DepositStatusBadge } from "./DepositStatusBadge";
import { remainingOf } from "../mappers";
import type { Deposit } from "@/types";

type Props = {
  deposit: Deposit;
  tenantName?: string;
  onDeduct: () => void;
  onRefund: () => void;
};

export function DepositCard({ deposit, tenantName, onDeduct, onRefund }: Props) {
  const canDeduct = deposit.status !== "REFUNDED" && deposit.status !== "FORFEITED";
  const canRefund = deposit.status !== "REFUNDED" && deposit.status !== "FORFEITED";
  const remaining = remainingOf(deposit);

  return (
    <Card variant="bordered" className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DepositStatusBadge status={deposit.status} />
          </div>
          <p className="mt-2 truncate text-label-md font-semibold text-on-surface">
            {tenantName ?? deposit.penyewaId.slice(0, 8)} · {formatCurrency(deposit.amountReceived)}
          </p>
          <p className="text-label-sm text-on-surface-variant">
            {formatDate(deposit.receivedDate)} · Sisa refundable {formatCurrency(remaining)}
          </p>
          {deposit.deductionAmount > 0 && (
            <p className="text-label-sm text-on-surface-variant">
              Potongan {formatCurrency(deposit.deductionAmount)}
              {deposit.deductionReason ? ` — ${deposit.deductionReason}` : ""}
            </p>
          )}
          {deposit.refundAmount ? (
            <p className="text-label-sm text-on-surface-variant">
              Refund {formatCurrency(deposit.refundAmount)} ·{" "}
              {deposit.refundDate ? formatDate(deposit.refundDate) : ""}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={onDeduct}
            disabled={!canDeduct}
            className="rounded-lg p-2 text-on-surface-variant hover:text-primary disabled:opacity-40"
            aria-label="Potong deposit"
            title={canDeduct ? "Potong" : `Tidak dapat potong (${deposit.status})`}
          >
            <Scissors className="h-4 w-4" />
          </button>
          <button
            onClick={onRefund}
            disabled={!canRefund}
            className="rounded-lg p-2 text-on-surface-variant hover:text-primary disabled:opacity-40"
            aria-label="Refund deposit"
            title={canRefund ? "Refund" : `Tidak dapat refund (${deposit.status})`}
          >
            <Undo2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
