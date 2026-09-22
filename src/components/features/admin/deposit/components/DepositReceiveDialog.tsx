/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReceiveDeposit } from "@/hooks/api/use-deposits";
import type { Tenant } from "@/types";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tenants: Tenant[];
};

const fieldCls = "w-full border-outline-variant bg-surface-container-lowest";

export function DepositReceiveDialog({ open, onOpenChange, tenants }: Props) {
  const sorted = useMemo(
    () => [...tenants].sort((a, b) => a.nama.localeCompare(b.nama)),
    [tenants],
  );
  const receive = useReceiveDeposit();

  const [penyewaId, setPenyewaId] = useState("");
  const [amount, setAmount] = useState("");
  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (!open) return;
    setPenyewaId(sorted[0]?.id ?? "");
    setAmount("");
    setReceivedDate(new Date().toISOString().split("T")[0]);
  }, [open, sorted]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!penyewaId) return toast.error("Pilih penghuni");
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Nominal harus > 0");
    if (!receivedDate) return toast.error("Tanggal wajib diisi");
    const d = new Date(receivedDate);
    if (Number.isNaN(d.getTime())) return toast.error("Tanggal tidak valid");
    if (d.getTime() > Date.now() + 24 * 60 * 60 * 1000)
      return toast.error("Tanggal tidak boleh di masa depan");

    receive.mutate(
      { penyewaId, amountReceived: amt, receivedDate: d.toISOString() },
      {
        onSuccess: () => {
          toast.success("Deposit diterima");
          onOpenChange(false);
        },
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : "Gagal simpan deposit"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-112">
        <DialogHeader>
          <DialogTitle>Terima Deposit</DialogTitle>
          <DialogDescription>
            Deposit dicatat sebagai HELD; kas masuk DEPOSIT (bukan pendapatan sewa).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Penghuni *</Label>
            <Select value={penyewaId} onValueChange={(v) => v && setPenyewaId(v)}>
              <SelectTrigger className={fieldCls}>
                <SelectValue placeholder="Pilih penghuni" />
              </SelectTrigger>
              <SelectContent>
                {sorted.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label className="text-label-md text-on-surface-variant">Nominal *</Label>
              <Input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1500000"
                className={fieldCls}
                required
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label className="text-label-md text-on-surface-variant">Tanggal Terima *</Label>
              <Input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className={fieldCls}
                required
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={receive.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={receive.isPending}>
              {receive.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
