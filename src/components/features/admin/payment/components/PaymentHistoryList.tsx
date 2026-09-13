"use client";

import { CalendarDays, CreditCard, FileText, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentRecord } from "@/types";

function getMethodLabel(method: PaymentRecord["paymentMethod"]): string {
  const map: Record<PaymentRecord["paymentMethod"], string> = {
    CASH: "Tunai",
    BANK_TRANSFER: "Transfer Bank",
    QRIS: "QRIS",
    E_WALLET: "E-Wallet",
    OTHER: "Lainnya",
  };
  return map[method] ?? "Tunai";
}

function formatMethodDate(iso: string): string {
  try {
    return formatDate(iso);
  } catch {
    return iso;
  }
}

type PaymentHistoryListProps = {
  records: PaymentRecord[];
};

export function PaymentHistoryList({ records }: PaymentHistoryListProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-label-md font-semibold text-on-surface">Riwayat Pembayaran</h3>
        <Badge variant="secondary" className="rounded-full font-medium">
          {records.length} transaksi
        </Badge>
      </div>

      {records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-low/60 p-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant">
            <Wallet className="h-5 w-5" />
          </div>
          <p className="mt-3 text-body-md font-medium text-on-surface">Belum ada pembayaran</p>
          <p className="mt-1 text-label-md text-on-surface-variant">Pembayaran yang dicatat akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {records.map((r) => (
            <div
              key={r.id}
              className="flex gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3.5 shadow-ambient-sm transition-colors hover:bg-surface-container-low md:p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-label-md font-semibold text-on-surface">{getMethodLabel(r.paymentMethod)}</span>
                  <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm font-medium text-on-surface-variant">
                    {formatCurrency(r.amountPaid)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-label-sm text-on-surface-variant">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatMethodDate(r.paymentDate)}
                  </span>
                  {r.referenceNumber && (
                    <span className="inline-flex items-center gap-1 truncate">
                      <FileText className="h-3.5 w-3.5" />
                      {r.referenceNumber}
                    </span>
                  )}
                </div>
                {r.notes && (
                  <p className="mt-1.5 line-clamp-2 rounded-lg bg-surface-container-low px-2.5 py-1.5 text-label-md leading-relaxed text-on-surface-variant">
                    {r.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
