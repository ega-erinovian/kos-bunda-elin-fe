"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useCreateRooms } from "@/hooks/features/admin/rooms/useCreateRooms";
import { floorSelectOptions, statusSelectOptions } from "../constants";
import type { RoomStatus } from "../types";

type RoomFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const fieldClassName = "w-full border-outline-variant bg-surface-container-lowest";

export function RoomFormDialog({ open, onOpenChange }: RoomFormDialogProps) {
  const { nomor, setNomor, lantai, setLantai, harga, setHarga, status, setStatus, errors, isPending, handleSubmit } =
    useCreateRooms(open, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-112">
        <DialogHeader>
          <DialogTitle>Tambah Kamar</DialogTitle>
          <DialogDescription>Lengkapi detail kamar baru.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomor-kamar" className="text-label-md text-on-surface-variant">
              Nomor Kamar
            </Label>
            <Input
              id="nomor-kamar"
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              placeholder="cth: 101"
              className={fieldClassName}
              aria-invalid={!!errors.nomor}
            />
            {errors.nomor && (
              <p role="alert" className="text-label-sm text-destructive">
                {errors.nomor}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Lantai</Label>
            <Select value={lantai} onValueChange={(v) => v !== null && setLantai(v)}>
              <SelectTrigger className={fieldClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {floorSelectOptions.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="harga" className="text-label-md text-on-surface-variant">
              Harga
            </Label>
            <Input
              id="harga"
              type="number"
              min={0}
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              placeholder="cth: 500000"
              className={fieldClassName}
              aria-invalid={!!errors.harga}
            />
            {errors.harga && (
              <p role="alert" className="text-label-sm text-destructive">
                {errors.harga}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Status</Label>
            <Select value={status} onValueChange={(v) => v !== null && setStatus(v as RoomStatus)}>
              <SelectTrigger className={fieldClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusSelectOptions.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
