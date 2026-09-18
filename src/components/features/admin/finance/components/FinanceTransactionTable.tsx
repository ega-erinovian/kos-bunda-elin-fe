"use client";

import { Pencil, Trash2, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isReversed } from "@/components/features/admin/expense/mappers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { transactionSourceLabel } from "../mappers";
import type { FinancialTransaction } from "@/types";

type Props = {
  txs: FinancialTransaction[];
  isOwner: boolean;
  highlightId: string | null;
  getCatName: (id: string) => string;
  getAccName: (id: string) => string;
  onEdit: (tx: FinancialTransaction) => void;
  onReverse: (tx: FinancialTransaction) => void;
  onDelete: (id: string) => void;
};

export function FinanceTransactionTable({
  txs,
  isOwner,
  highlightId,
  getCatName,
  getAccName,
  onEdit,
  onReverse,
  onDelete,
}: Props) {
  return (
    <>
      <div className="flex bg-muted/50 px-6 text-label-md text-muted-foreground">
        <div className="w-32 py-4">Tanggal</div>
        <div className="w-28 py-4">Tipe / Sumber</div>
        <div className="w-32 py-4">Akun</div>
        <div className="w-36 py-4">Kategori</div>
        <div className="w-36 py-4">Nominal</div>
        <div className="flex-1 py-4">Deskripsi</div>
        <div className="w-24 py-4 text-right">Aksi</div>
      </div>

      {txs.map((tx) => {
        const highlighted =
          !!highlightId && (tx.paymentRecordId === highlightId || tx.id === highlightId);
        const reversed = isReversed(tx);
        return (
          <div
            key={tx.id}
            className={`flex items-center border-t border-border/30 px-6 py-4 hover:bg-muted/30 ${highlighted ? "bg-primary/5" : ""}`}
          >
            <div className="w-32 text-label-sm text-on-surface">
              {formatDate(tx.transactionDate)}
              {reversed && (
                <Badge
                  variant="outline"
                  className="ml-2 border-amber-200 bg-amber-50 text-amber-700"
                >
                  Reversed
                </Badge>
              )}
            </div>
            <div className="w-28">
              <Badge
                variant={tx.type === "INCOME" ? "secondary" : "destructive"}
                className="text-label-sm"
              >
                {tx.type}
              </Badge>
              <p className="mt-1 text-label-sm text-on-surface-variant">
                {transactionSourceLabel(tx.source)}
              </p>
            </div>
            <div className="w-32 text-label-md text-on-surface">{getAccName(tx.accountId)}</div>
            <div className="w-36 text-label-md text-on-surface">{getCatName(tx.categoryId)}</div>
            <div className="w-36 text-label-md font-semibold text-on-surface">
              {formatCurrency(tx.amount)}
            </div>
            <div className="flex-1 truncate pr-4 text-label-sm text-on-surface-variant">
              {tx.description || "-"}
              {tx.referenceNumber ? ` · ${tx.referenceNumber}` : ""}
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
              <button
                onClick={() => onDelete(tx.id)}
                className="rounded-lg p-2 text-on-surface-variant hover:text-destructive"
                title={isOwner ? "Hapus (OWNER)" : "Hapus"}
                aria-label="Hapus"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
