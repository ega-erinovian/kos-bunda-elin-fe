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
import { useFinanceAccounts } from "@/hooks/api/use-finance-accounts";
import { useFinanceCategories } from "@/hooks/api/use-finance-categories";
import { useCreateExpense, useUpdateExpense } from "@/hooks/api/use-expenses";
import type { FinancialTransaction } from "@/types";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing?: FinancialTransaction | null;
};

const fieldCls = "w-full border-outline-variant bg-surface-container-lowest";

function isValidUrl(s: string): boolean {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

export function ExpenseFormDialog({ open, onOpenChange, editing }: Props) {
  const isEdit = !!editing;
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: expenseCats = [] } = useFinanceCategories("EXPENSE");

  const create = useCreateExpense();
  const update = useUpdateExpense();

  const sortedAccounts = useMemo(
    () => [...accounts].sort((a, b) => a.name.localeCompare(b.name)),
    [accounts],
  );
  const sortedCats = useMemo(
    () => [...expenseCats].sort((a, b) => a.code.localeCompare(b.code)),
    [expenseCats],
  );

  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [vendorName, setVendorName] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [description, setDescription] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setVendorName(editing.vendorName ?? "");
      setReceiptUrl(editing.receiptUrl ?? "");
      setDescription(editing.description ?? "");
      setReferenceNumber(editing.referenceNumber ?? "");
      setAccountId(editing.accountId);
      setCategoryId(editing.categoryId);
      setAmount(String(editing.amount));
      setTransactionDate(new Date(editing.transactionDate).toISOString().split("T")[0]);
    } else {
      setAccountId(sortedAccounts[0]?.id ?? "");
      setCategoryId("");
      setAmount("");
      setTransactionDate(new Date().toISOString().split("T")[0]);
      setVendorName("");
      setReceiptUrl("");
      setDescription("");
      setReferenceNumber("");
    }
  }, [open, editing, sortedAccounts]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!vendorName.trim()) return toast.error("Nama vendor wajib diisi");
    if (vendorName.trim().length > 200) return toast.error("Nama vendor max 200 karakter");
    if (receiptUrl.trim()) {
      if (receiptUrl.trim().length > 500) return toast.error("receiptUrl max 500");
      if (!isValidUrl(receiptUrl.trim())) return toast.error("receiptUrl harus URL valid");
    }
    if (description.trim().length > 500) return toast.error("Deskripsi max 500");
    if (referenceNumber.trim().length > 100) return toast.error("No. referensi max 100");

    if (isEdit && editing) {
      update.mutate(
        {
          id: editing.id,
          vendorName: vendorName.trim(),
          receiptUrl: receiptUrl.trim() ? receiptUrl.trim() : null,
          description: description.trim() ? description.trim() : null,
        },
        {
          onSuccess: () => {
            toast.success("Pengeluaran diperbarui");
            onOpenChange(false);
          },
          onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : "Gagal memperbarui";
            toast.error(msg);
          },
        },
      );
      return;
    }

    if (!accountId) return toast.error("Pilih akun");
    if (!categoryId) return toast.error("Pilih kategori");
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Nominal harus > 0");
    if (!transactionDate) return toast.error("Tanggal wajib diisi");
    const d = new Date(transactionDate);
    if (Number.isNaN(d.getTime())) return toast.error("Tanggal tidak valid");
    if (d > new Date()) return toast.error("Tanggal tidak boleh di masa depan");

    create.mutate(
      {
        accountId,
        categoryId,
        amount: amt,
        transactionDate: new Date(transactionDate).toISOString(),
        vendorName: vendorName.trim(),
        receiptUrl: receiptUrl.trim() || undefined,
        description: description.trim() || undefined,
        referenceNumber: referenceNumber.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Pengeluaran dibuat");
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "Gagal membuat pengeluaran";
          toast.error(msg);
        },
      },
    );
  }

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-112">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Pengeluaran" : "Tambah Pengeluaran"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Hanya vendor, receiptUrl, dan deskripsi yang dapat diubah."
              : "Vendor wajib diisi — receiptUrl opsional (URL). Tanpa upload pipeline."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-label-md text-on-surface-variant">Akun *</Label>
                  <Select value={accountId} onValueChange={(v) => v && setAccountId(v)}>
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
                    Kategori (EXPENSE) *
                  </Label>
                  <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
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
                  <Label className="text-label-md text-on-surface-variant">Nominal *</Label>
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
                  <Label className="text-label-md text-on-surface-variant">Tanggal *</Label>
                  <Input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className={fieldCls}
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Nama Vendor *</Label>
            <Input
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="Contoh: PLN / Toko Bangunan"
              className={fieldCls}
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Receipt URL (opsional)</Label>
            <Input
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder="https://example.com/receipt.pdf"
              className={fieldCls}
              maxLength={500}
              type="url"
            />
          </div>

          {!isEdit && (
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
          )}

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

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : isEdit ? "Simpan" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
