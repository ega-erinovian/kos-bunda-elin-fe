/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
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
import { useFinanceAccounts } from "@/hooks/api/use-finance-accounts";
import { useFinanceCategories } from "@/hooks/api/use-finance-categories";
import { useCreateFinanceTransaction } from "@/hooks/api/use-finance-transactions";
import toast from "react-hot-toast";

type Props = { open: boolean; onOpenChange: (o: boolean) => void };

const fieldCls = "w-full border-outline-variant bg-surface-container-lowest";

export function FinanceTransactionFormDialog({ open, onOpenChange }: Props) {
  const { data: accounts = [] } = useFinanceAccounts();
  const create = useCreateFinanceTransaction();

  const [source, setSource] = useState<"MANUAL_INCOME" | "MANUAL_EXPENSE">("MANUAL_EXPENSE");
  const categoryType = source === "MANUAL_INCOME" ? "INCOME" : "EXPENSE";
  const { data: categories = [] } = useFinanceCategories(categoryType as any);

  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [description, setDescription] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  const sortedAccounts = useMemo(
    () => [...accounts].sort((a, b) => a.name.localeCompare(b.name)),
    [accounts],
  );
  const sortedCats = useMemo(
    () => [...categories].sort((a, b) => a.code.localeCompare(b.code)),
    [categories],
  );

  useEffect(() => {
    if (open) {
      setAccountId(sortedAccounts[0]?.id ?? "");
      setCategoryId("");
      setAmount("");
      setTransactionDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setReferenceNumber("");
    }
  }, [open, sortedAccounts]);

  useEffect(() => {
    // reset category when source changes
    setCategoryId("");
  }, [source]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId) return toast.error("Pilih akun");
    if (!categoryId) return toast.error("Pilih kategori");
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Nominal harus > 0");
    if (!transactionDate) return toast.error("Tanggal wajib diisi");
    const d = new Date(transactionDate);
    const max = new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (d > max) return toast.error("Tanggal tidak boleh di masa depan");

    create.mutate(
      {
        accountId,
        categoryId,
        amount: amt,
        transactionDate: new Date(transactionDate).toISOString(),
        description: description.trim() || undefined,
        referenceNumber: referenceNumber.trim() || undefined,
        source,
      },
      {
        onSuccess: () => {
          toast.success("Transaksi dibuat");
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(err.message || "Gagal membuat transaksi"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-112">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
          <DialogDescription>
            Hanya MANUAL_INCOME / MANUAL_EXPENSE — RENT_PAYMENT dibuat otomatis dari pembayaran.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Sumber</Label>
            <Select
              value={source}
              onValueChange={(v) => {
                if (v !== null) setSource(v as any);
              }}
            >
              <SelectTrigger className={fieldCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL_INCOME">Pemasukan Manual</SelectItem>
                <SelectItem value="MANUAL_EXPENSE">Pengeluaran Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-label-md text-on-surface-variant">Akun</Label>
              <Select
                value={accountId}
                onValueChange={(v) => {
                  if (v !== null) setAccountId(v);
                }}
              >
                <SelectTrigger className={fieldCls}>
                  <SelectValue placeholder="Pilih akun" />
                </SelectTrigger>
                <SelectContent>
                  {sortedAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-label-md text-on-surface-variant">
                Kategori ({categoryType})
              </Label>
              <Select
                value={categoryId}
                onValueChange={(v) => {
                  if (v !== null) setCategoryId(v);
                }}
              >
                <SelectTrigger className={fieldCls}>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {sortedCats.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-label-md text-on-surface-variant">Nominal</Label>
              <Input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500000"
                className={fieldCls}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-label-md text-on-surface-variant">Tanggal</Label>
              <Input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className={fieldCls}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Deskripsi (opsional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keterangan"
              className={fieldCls}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">
              No. Referensi (opsional)
            </Label>
            <Input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="REF-001"
              className={fieldCls}
              maxLength={100}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
