/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateFinanceCategory,
  useUpdateFinanceCategory,
} from "@/hooks/api/use-finance-categories";
import type { FinancialCategory, CategoryType } from "@/types";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing?: FinancialCategory | null;
  defaultType?: CategoryType;
};

const fieldCls = "w-full border-outline-variant bg-surface-container-lowest";

export function FinanceCategoryFormDialog({
  open,
  onOpenChange,
  editing,
  defaultType = "EXPENSE",
}: Props) {
  const create = useCreateFinanceCategory();
  const update = useUpdateFinanceCategory();
  const isEditing = !!editing;

  const [type, setType] = useState<CategoryType>(defaultType);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      if (editing) {
        setType(editing.type);
        setCode(editing.code);
        setName(editing.name);
      } else {
        setType(defaultType);
        setCode("");
        setName("");
      }
    }
  }, [open, editing, defaultType]);

  const pending = create.isPending || update.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !/^[A-Z_]+$/.test(code.trim())) {
      toast.error("Code harus huruf kapital dan underscore (contoh: OTHER_EXPENSE)");
      return;
    }
    if (!name.trim()) {
      toast.error("Nama kategori wajib diisi");
      return;
    }
    if (isEditing && editing) {
      update.mutate(
        { id: editing.id, code: code.trim(), name: name.trim() },
        {
          onSuccess: () => {
            toast.success("Kategori diperbarui");
            onOpenChange(false);
          },
          onError: (err: any) => toast.error(err.message || "Gagal memperbarui"),
        },
      );
    } else {
      create.mutate(
        { type, code: code.trim(), name: name.trim() },
        {
          onSuccess: () => {
            toast.success("Kategori dibuat");
            onOpenChange(false);
          },
          onError: (err: any) => toast.error(err.message || "Gagal membuat kategori"),
        },
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-112">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Ubah kode/nama kategori."
              : "Kode = huruf kapital + underscore, unik per properti."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div className="space-y-2">
              <Label className="text-label-md text-on-surface-variant">Tipe</Label>
              <Select value={type} onValueChange={(v) => setType(v as CategoryType)}>
                <SelectTrigger className={fieldCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Pemasukan</SelectItem>
                  <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Kode</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CONTOH: LISTRIK"
              className={fieldCls}
              maxLength={50}
              required
            />
            <p className="text-label-sm text-on-surface-variant">
              Hanya A-Z dan _ (contoh: OTHER_EXPENSE)
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Nama</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Listrik"
              className={fieldCls}
              maxLength={100}
              required
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
