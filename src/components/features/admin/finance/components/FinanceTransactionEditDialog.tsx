"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  description: string;
  reference: string;
  onDescriptionChange: (v: string) => void;
  onReferenceChange: (v: string) => void;
  onSave: () => void;
  isPending: boolean;
};

export function FinanceTransactionEditDialog({
  open,
  onOpenChange,
  description,
  reference,
  onDescriptionChange,
  onReferenceChange,
  onSave,
  isPending,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-112">
        <DialogHeader>
          <DialogTitle>Edit Transaksi</DialogTitle>
          <DialogDescription>
            Hanya deskripsi, referensi, atau kategori — nominal & akun tidak dapat diubah.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Deskripsi</Label>
            <Input
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              maxLength={500}
              className="border-outline-variant bg-surface-container-lowest"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Referensi</Label>
            <Input
              value={reference}
              onChange={(e) => onReferenceChange(e.target.value)}
              maxLength={100}
              className="border-outline-variant bg-surface-container-lowest"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={onSave} disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
