"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { FinancialTransaction } from "@/types";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  transaction: FinancialTransaction | null;
  onConfirm: (reason: string) => void;
  isPending?: boolean;
  lastReversal?: FinancialTransaction | null;
  title?: string;
};

export function ReverseTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onConfirm,
  isPending,
  lastReversal,
  title = "Reversal Transaksi",
}: Props) {
  const [reason, setReason] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Alasan wajib diisi");
      return;
    }
    if (reason.length > 500) {
      toast.error("Alasan max 500 karakter");
      return;
    }
    onConfirm(reason.trim());
  }

  function handleOpenChange(o: boolean) {
    if (!o) setReason("");
    onOpenChange(o);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-112">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {transaction
              ? `Buat entri penyeimbang untuk ${formatCurrency(transaction.amount)} — transaksi asal tetap terlihat dengan tag Reversed.`
              : "Alasan reversal wajib diisi."}
          </DialogDescription>
        </DialogHeader>

        {transaction && (
          <Card className="bg-muted/30 p-3">
            <p className="text-label-sm text-on-surface-variant">
              {transaction.vendorName ?? transaction.description ?? "—"} ·{" "}
              {formatCurrency(transaction.amount)} · {transaction.source}
            </p>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Alasan reversal *</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Salah input nominal"
              maxLength={500}
              className="border-outline-variant bg-surface-container-lowest"
              required
            />
            <p className="text-label-sm text-on-surface-variant">{reason.length}/500</p>
          </div>

          {lastReversal && (
            <Card className="border-primary/20 bg-primary/5 p-3">
              <p className="text-label-sm font-medium text-primary">Reversal berhasil</p>
              <p className="text-label-sm text-on-surface-variant">
                {lastReversal.description} · {formatCurrency(lastReversal.amount)}
              </p>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={!!isPending}
            >
              Batal
            </Button>
            <Button type="submit" variant="destructive" disabled={!!isPending}>
              {isPending ? "Memproses..." : "Reversal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
