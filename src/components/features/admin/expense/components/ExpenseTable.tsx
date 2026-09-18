"use client";

import { ExternalLink, Pencil, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isReversed } from "../mappers";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { FinancialTransaction } from "@/types";

type Props = {
  expenses: FinancialTransaction[];
  isOwner: boolean;
  getCatLabel: (id: string) => string;
  getAccName: (id: string) => string;
  onEdit: (tx: FinancialTransaction) => void;
  onReverse: (tx: FinancialTransaction) => void;
};

export function ExpenseTable({
  expenses,
  isOwner,
  getCatLabel,
  getAccName,
  onEdit,
  onReverse,
}: Props) {
  return (
    <>
      <div className="flex bg-muted/50 px-6 text-label-md text-muted-foreground">
        <div className="w-28 py-4">Tanggal</div>
        <div className="w-40 py-4">Vendor</div>
        <div className="w-32 py-4">Kategori</div>
        <div className="w-32 py-4">Akun</div>
        <div className="w-32 py-4">Nominal</div>
        <div className="flex-1 py-4">Deskripsi</div>
        <div className="w-28 py-4 text-right">Aksi</div>
      </div>

      {expenses.map((tx) => {
        const reversed = isReversed(tx);
        return (
          <div
            key={tx.id}
            className="flex items-center border-t border-border/30 px-6 py-4 hover:bg-muted/30"
          >
            <div className="w-28 text-label-sm text-on-surface">
              {formatDate(tx.transactionDate)}
            </div>
            <div className="w-40">
              <p className="truncate text-label-md font-medium text-on-surface">
                {tx.vendorName ?? "—"}
              </p>
              {reversed && (
                <Badge
                  variant="outline"
                  className="mt-1 border-amber-200 bg-amber-50 text-amber-700"
                >
                  Reversed
                </Badge>
              )}
            </div>
            <div className="w-32 text-label-md text-on-surface">{getCatLabel(tx.categoryId)}</div>
            <div className="w-32 text-label-md text-on-surface">{getAccName(tx.accountId)}</div>
            <div className="w-32 text-label-md font-semibold text-on-surface">
              {formatCurrency(tx.amount)}
            </div>
            <div className="flex-1 truncate pr-4 text-label-sm text-on-surface-variant">
              {tx.description || "-"}
              {tx.receiptUrl ? (
                <a
                  href={tx.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 text-primary hover:underline"
                >
                  Kwitansi <ExternalLink className="h-3 w-3 inline" />
                </a>
              ) : null}
            </div>
            <div className="flex w-28 justify-end gap-1">
              <button
                onClick={() => onEdit(tx)}
                className="rounded-lg p-2 text-on-surface-variant hover:text-primary"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {isOwner ? (
                <button
                  onClick={() => onReverse(tx)}
                  disabled={reversed}
                  className="rounded-lg p-2 text-on-surface-variant hover:text-destructive disabled:opacity-40"
                  aria-label="Reversal"
                  title={reversed ? "Sudah direversal" : "Reversal (OWNER)"}
                >
                  <Undo2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </>
  );
}
