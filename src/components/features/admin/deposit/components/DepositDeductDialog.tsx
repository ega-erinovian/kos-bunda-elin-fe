/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useDeductDeposit } from "@/hooks/api/use-deposits";
import type { Deposit } from "@/types";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  deposit: Deposit | null;
};

const fieldCls = "w-full border-outline-variant bg-surface-container-lowest";

export function DepositDeductDialog({ open, onOpenChange, deposit }: Props) {
  const deduct = useDeductDeposit();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open || !deposit) return;
    setAmount(String(deposit.deductionAmount ?? 0));
    setReason(deposit.deductionReason ?? "");
  }, [open, deposit]);

  if (!deposit) return null;

  const amtNum = Number(amount);
  const refund = deposit.refundAmount ?? 0;
  const wouldExceed = !Number.isNaN(amtNum) && amtNum + refund > deposit.amountReceived + 1e-9;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dAmt = Number(amount);
    if (Number.isNaN(dAmt) || dAmt < 0) return toast.error("Potongan harus >= 0");
    if (!reason.trim()) return toast.error("Alasan wajib diisi");
    if (reason.trim().length > 500) return toast.error("Alasan max 500");
    if (dAmt + refund > deposit!.amountReceived + 1e-9) {
      return toast.error(
        `Potongan + refund (${dAmt + refund}) melebihi diterima (${deposit!.amountReceived})`,
      );
    }
    deduct.mutate(
      { id: deposit!.id, deductionAmount: dAmt, deductionReason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("Potongan disimpan");
          onOpenChange(false);
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Gagal potong"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-112">
        <DialogHeader>
          <DialogTitle>Potong Deposit</DialogTitle>
          <DialogDescription>
            Mengganti nilai potongan; status tetap HELD. Refund yang sudah ada:{" "}
            {formatCurrency(refund)}.
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-muted/30 p-3 mb-4">
          <p className="text-label-sm text-on-surface-variant">
            Diterima {formatCurrency(deposit.amountReceived)} · Sisa refundable{" "}
            {formatCurrency(
              Math.max(0, deposit.amountReceived - (deposit.deductionAmount ?? 0) - refund),
            )}
          </p>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Potongan (Rp) *</Label>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={fieldCls}
              required
            />
            {wouldExceed && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-label-sm text-amber-700">
                Potongan + refund melebihi diterima — kurangi nilai.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Alasan *</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Kerusakan pintu / kebersihan"
              className={fieldCls}
              maxLength={500}
              required
            />
            <p className="text-label-sm text-on-surface-variant">{reason.length}/500</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={deduct.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={deduct.isPending || wouldExceed}>
              {deduct.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
