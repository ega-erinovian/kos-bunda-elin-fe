"use client";

import { Scissors, Undo2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DepositStatusBadge } from "./DepositStatusBadge";
import { remainingOf } from "../mappers";
import type { Deposit } from "@/types";

type Props = {
  deposits: Deposit[];
  getTenantName: (id: string) => string;
  onDeduct: (d: Deposit) => void;
  onRefund: (d: Deposit) => void;
};

export function DepositTable({ deposits, getTenantName, onDeduct, onRefund }: Props) {
  return (
    <>
      <div className="flex bg-muted/50 px-6 text-label-md text-muted-foreground">
        <div className="w-36 py-4">Penghuni</div>
        <div className="w-32 py-4">Diterima</div>
        <div className="w-32 py-4">Status</div>
        <div className="w-32 py-4">Potongan</div>
        <div className="w-32 py-4">Refund</div>
        <div className="w-32 py-4">Sisa</div>
        <div className="flex-1 py-4">Alasan</div>
        <div className="w-24 py-4 text-right">Aksi</div>
      </div>

      {deposits.map((d) => {
        const canDeduct = d.status !== "REFUNDED" && d.status !== "FORFEITED";
        const canRefund = d.status !== "REFUNDED" && d.status !== "FORFEITED";
        return (
          <div
            key={d.id}
            className="flex items-center border-t border-border/30 px-6 py-4 hover:bg-muted/30"
          >
            <div className="w-36 truncate text-label-md font-medium text-on-surface pe-2">
              {getTenantName(d.penyewaId)}
            </div>
            <div className="w-32 text-label-md text-on-surface">
              {formatCurrency(d.amountReceived)}
              <div className="text-label-sm text-on-surface-variant mt-0.5">
                {formatDate(d.receivedDate)}
              </div>
            </div>
            <div className="w-32">
              <DepositStatusBadge status={d.status} />
            </div>
            <div className="w-32 text-label-md text-on-surface">
              {d.deductionAmount > 0 ? formatCurrency(d.deductionAmount) : "—"}
            </div>
            <div className="w-32 text-label-md text-on-surface">
              {d.refundAmount ? formatCurrency(d.refundAmount) : "—"}
              {d.refundDate ? (
                <div className="text-label-sm text-on-surface-variant">
                  {formatDate(d.refundDate)}
                </div>
              ) : null}
            </div>
            <div className="w-32 text-label-md font-semibold text-on-surface">
              {formatCurrency(remainingOf(d))}
            </div>
            <div className="flex-1 truncate pr-4 text-label-sm text-on-surface-variant">
              {d.deductionReason || "—"}
            </div>
            <div className="flex w-24 justify-end gap-1">
              <button
                onClick={() => onDeduct(d)}
                disabled={!canDeduct}
                className="rounded-lg p-2 text-on-surface-variant hover:text-primary disabled:opacity-40 cursor-pointer"
                aria-label="Potong"
              >
                <Scissors className="h-4 w-4" />
              </button>
              <button
                onClick={() => onRefund(d)}
                disabled={!canRefund}
                className="rounded-lg p-2 text-on-surface-variant hover:text-primary disabled:opacity-40 cursor-pointer"
                aria-label="Refund"
              >
                <Undo2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
