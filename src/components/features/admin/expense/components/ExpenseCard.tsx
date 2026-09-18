"use client";

import { ExternalLink, Pencil, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { isReversed } from "../mappers";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { FinancialTransaction } from "@/types";

type Props = {
  tx: FinancialTransaction;
  accountName: string;
  categoryLabel: string;
  isOwner: boolean;
  onEdit: () => void;
  onReverse: () => void;
};

export function ExpenseCard({ tx, accountName, categoryLabel, isOwner, onEdit, onReverse }: Props) {
  const reversed = isReversed(tx);

  return (
    <Card variant="bordered" className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="destructive">EXPENSE</Badge>
            {reversed && (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                Reversed
              </Badge>
            )}
          </div>
          <p className="mt-2 truncate text-label-md font-semibold text-on-surface">
            {tx.vendorName ?? "—"} · {formatCurrency(tx.amount)}
          </p>
          <p className="text-label-sm text-on-surface-variant">
            {formatDate(tx.transactionDate)} · {accountName} · {categoryLabel}
          </p>
          {tx.receiptUrl && (
            <a
              href={tx.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-label-sm text-primary hover:underline"
            >
              Kwitansi <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {tx.description && <p className="mt-1 text-label-sm text-on-surface">{tx.description}</p>}
          {tx.referenceNumber && (
            <p className="text-label-sm text-on-surface-variant">Ref: {tx.referenceNumber}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={onEdit}
            className="rounded-lg p-2 text-on-surface-variant hover:text-primary"
            aria-label="Edit pengeluaran"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {isOwner ? (
            <button
              onClick={onReverse}
              disabled={reversed}
              className="rounded-lg p-2 text-on-surface-variant hover:text-destructive disabled:opacity-40"
              aria-label="Reversal pengeluaran"
              title={reversed ? "Sudah direversal" : "Reversal (OWNER)"}
            >
              <Undo2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
