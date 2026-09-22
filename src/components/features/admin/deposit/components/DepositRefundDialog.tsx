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
import { useRefundDeposit } from "@/hooks/api/use-deposits";
import type { Deposit } from "@/types";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  deposit: Deposit | null;
};

const fieldCls = "w-full border-outline-variant bg-surface-container-lowest";

export function DepositRefundDialog({ open, onOpenChange, deposit }: Props) {
  const refund = useRefundDeposit();
  const [amount, setAmount] = useState("");
  const [refundDate, setRefundDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (!open) return;
    if (deposit) {
      setAmount(deposit.refundAmount ? String(deposit.refundAmount) : "");
      setRefundDate(
        deposit.refundDate
          ? new Date(deposit.refundDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      );
    } else {
      setAmount("");
      setRefundDate(new Date().toISOString().split("T")[0]);
    }
  }, [open, deposit]);

  if (!deposit) return null;

  const amtNum = Number(amount);
  const deduction = deposit.deductionAmount ?? 0;
  const maxRefundable = Math.max(0, deposit.amountReceived - deduction);
  const wouldExceed =
    !Number.isNaN(amtNum) && amtNum > 0 && deduction + amtNum > deposit.amountReceived + 1e-9;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rAmt = Number(amount);
    if (!rAmt || rAmt <= 0) return toast.error("Nominal refund harus > 0");
    if (!refundDate) return toast.error("Tanggal refund wajib diisi");
    const d = new Date(refundDate);
    if (Number.isNaN(d.getTime())) return toast.error("Tanggal tidak valid");
    if (d.getTime() > Date.now() + 24 * 60 * 60 * 1000)
      return toast.error("Tanggal tidak boleh di masa depan");
    if (deduction + rAmt > deposit!.amountReceived + 1e-9) {
      return toast.error(
        `Refund + potongan (${deduction + rAmt}) melebihi diterima (${deposit!.amountReceived})`,
      );
    }
    refund.mutate(
      { id: deposit!.id, refundAmount: rAmt, refundDate: d.toISOString() },
      {
        onSuccess: () => {
          toast.success("Refund disimpan");
          onOpenChange(false);
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Gagal refund"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-112 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Refund Deposit</DialogTitle>
          <DialogDescription>
            Maksimal refundable sekarang: {formatCurrency(maxRefundable)}. Status akan jadi REFUNDED
            bila potongan + refund mencapai diterima.
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-muted/30 p-3 mb-4">
          <p className="wrap-break-word text-label-sm text-on-surface-variant">
            Diterima {formatCurrency(deposit.amountReceived)} · Potongan {formatCurrency(deduction)}{" "}
            · Sudah refund {formatCurrency(deposit.refundAmount ?? 0)}
          </p>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3!">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label className="text-label-md text-on-surface-variant">Nominal Refund *</Label>
              <Input
                type="number"
                min={1}
                max={maxRefundable}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={String(maxRefundable)}
                className={fieldCls}
                required
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label className="text-label-md text-on-surface-variant">Tanggal Refund *</Label>
              <Input
                type="date"
                value={refundDate}
                onChange={(e) => setRefundDate(e.target.value)}
                className={fieldCls}
                required
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {wouldExceed && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-label-sm wrap-break-word text-amber-700">
              Potongan ({formatCurrency(deduction)}) + refund ({formatCurrency(amtNum)}) melebihi
              diterima — kurangi nilai.
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={refund.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={refund.isPending || wouldExceed}>
              {refund.isPending ? "Menyimpan..." : "Refund"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
