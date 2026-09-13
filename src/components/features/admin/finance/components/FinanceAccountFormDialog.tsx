/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
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
import { useCreateFinanceAccount, useUpdateFinanceAccount } from "@/hooks/api/use-finance-accounts";
import { ACCOUNT_TYPE_OPTIONS } from "../constants";
import type { FinancialAccount, FinancialAccountType } from "@/types";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing?: FinancialAccount | null;
};

const fieldCls = "w-full border-outline-variant bg-surface-container-lowest";

export function FinanceAccountFormDialog({ open, onOpenChange, editing }: Props) {
  const isEditing = !!editing;
  const create = useCreateFinanceAccount();
  const update = useUpdateFinanceAccount();

  const [name, setName] = useState("");
  const [type, setType] = useState<FinancialAccountType>("CASH");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [openingBalance, setOpeningBalance] = useState("0");

  useEffect(() => {
    if (open) {
      if (editing) {
        setName(editing.name);
        setType(editing.type);
        setBankName(editing.bankName ?? "");
        setAccountNumber(editing.accountNumber ?? "");
        setOpeningBalance(String(editing.openingBalance));
      } else {
        setName("");
        setType("CASH");
        setBankName("");
        setAccountNumber("");
        setOpeningBalance("0");
      }
    }
  }, [open, editing]);

  const pending = create.isPending || update.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama akun wajib diisi");
      return;
    }
    const payload: any = {
      name: name.trim(),
      type,
      bankName: type === "BANK" ? bankName.trim() || undefined : undefined,
      accountNumber: type === "BANK" ? accountNumber.trim() || undefined : undefined,
      openingBalance: Number(openingBalance) || 0,
    };
    if (isEditing && editing) {
      update.mutate(
        { id: editing.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Akun diperbarui");
            onOpenChange(false);
          },
          onError: (err: any) => toast.error(err.message || "Gagal memperbarui akun"),
        },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.success("Akun dibuat");
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(err.message || "Gagal membuat akun"),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-112">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Akun" : "Tambah Akun"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Ubah detail akun keuangan." : "Tambah akun untuk mencatat transaksi."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Nama Akun</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cash, BCA Utama..."
              className={fieldCls}
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Tipe</Label>
            <Select value={type} onValueChange={(v) => setType(v as FinancialAccountType)}>
              <SelectTrigger className={fieldCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "BANK" && (
            <>
              <div className="space-y-2">
                <Label className="text-label-md text-on-surface-variant">Nama Bank</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="BCA"
                  className={fieldCls}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-label-md text-on-surface-variant">No. Rekening</Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="1234567890"
                  className={fieldCls}
                  maxLength={100}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Saldo Awal</Label>
            <Input
              type="number"
              min={0}
              step={1000}
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              className={fieldCls}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
