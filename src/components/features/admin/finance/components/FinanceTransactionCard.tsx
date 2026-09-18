"use client";

import { Pencil, Trash2, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { isReversed } from "@/components/features/admin/expense/mappers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { transactionSourceLabel } from "../mappers";
import type { FinancialTransaction } from "@/types";

type Props = {
  tx: FinancialTransaction;
  accountName: string;
  categoryName: string;
  isOwner: boolean;
  highlighted: boolean;
  onEdit: () => void;
  onReverse: () => void;
  onDelete: () => void;
};

export function FinanceTransactionCard({
  tx,
  accountName,
  categoryName,
  isOwner,
  highlighted,
  onEdit,
  onReverse,
  onDelete,
}: Props) {
  const reversed = isReversed(tx);

  return (
    <Card variant="bordered" className={`p-4 ${highlighted ? "ring-2 ring-primary" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={tx.type === "INCOME" ? "secondary" : "destructive"}>{tx.type}</Badge>
            <span className="text-label-sm text-on-surface-variant">
              {transactionSourceLabel(tx.source)}
            </span>
            {reversed && (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                Reversed
              </Badge>
            )}
          </div>
          <p className="mt-2 text-label-md font-semibold text-on-surface">
            {formatCurrency(tx.amount)}
          </p>
          <p className="text-label-sm text-on-surface-variant">
            {formatDate(tx.transactionDate)} · {accountName} · {categoryName}
          </p>
          {tx.description && <p className="mt-1 text-label-sm text-on-surface">{tx.description}</p>}
          {tx.referenceNumber && (
            <p className="text-label-sm text-on-surface-variant">Ref: {tx.referenceNumber}</p>
          )}
          {tx.paymentRecordId && (
            <p className="text-label-sm text-primary">
              paymentRecord: {tx.paymentRecordId.slice(0, 8)}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="rounded-lg p-2 text-on-surface-variant hover:text-primary"
            aria-label="Edit transaksi"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {isOwner ? (
            <button
              onClick={onReverse}
              disabled={reversed}
              className="rounded-lg p-2 text-on-surface-variant hover:text-destructive disabled:opacity-40"
              aria-label="Reversal transaksi"
              title={reversed ? "Sudah direversal" : "Reversal (OWNER)"}
            >
              <Undo2 className="h-4 w-4" />
            </button>
          ) : null}
          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-on-surface-variant hover:text-destructive"
            aria-label="Hapus transaksi"
            title={isOwner ? "Hapus (OWNER)" : "Hapus"}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
