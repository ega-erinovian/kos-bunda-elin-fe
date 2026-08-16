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
import { useCreateTenant } from "@/hooks/features/admin/tenants/useCreateTenant";
import { useUpdateTenant } from "@/hooks/features/admin/tenants/useUpdateTenant";
import { useRooms } from "@/hooks/api/use-rooms";

type TenantFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTenantId?: string | null;
};

const fieldClassName = "w-full border-outline-variant bg-surface-container-lowest";

export function TenantFormDialog({
  open,
  onOpenChange,
  editingTenantId = null,
}: TenantFormDialogProps) {
  const { data: roomsData } = useRooms({ limit: 100, status: "KOSONG" });
  const availableRooms = roomsData?.data ?? [];

  const createForm = useCreateTenant(open, onOpenChange);
  const updateForm = useUpdateTenant(open, editingTenantId, onOpenChange);
  const {
    nama,
    setNama,
    noHp,
    setNoHp,
    kamarId,
    setKamarId,
    tanggalMulaiSewa,
    setTanggalMulaiSewa,
    nominalSewa,
    setNominalSewa,
    tanggalJatuhTempo,
    setTanggalJatuhTempo,
    errors,
    isPending,
    handleSubmit,
  } = editingTenantId ? updateForm : createForm;
  const isLoadingTenant = editingTenantId ? updateForm.isLoading : false;
  const isEditing = editingTenantId !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-112">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Penghuni" : "Tambah Penghuni"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Ubah detail penghuni yang sudah ada." : "Lengkapi detail penghuni baru."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama" className="text-label-md text-on-surface-variant">
              Nama Lengkap
            </Label>
            <Input
              id="nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="cth: Budi Santoso"
              className={fieldClassName}
              aria-invalid={!!errors.nama}
            />
            {errors.nama && (
              <p role="alert" className="text-label-sm text-destructive">
                {errors.nama}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="noHp" className="text-label-md text-on-surface-variant">
              No. Telepon
            </Label>
            <Input
              id="noHp"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="cth: 08123456789"
              className={fieldClassName}
              aria-invalid={!!errors.noHp}
            />
            {errors.noHp && (
              <p role="alert" className="text-label-sm text-destructive">
                {errors.noHp}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-label-md text-on-surface-variant">Kamar</Label>
            <Select value={kamarId} onValueChange={(v) => v !== null && setKamarId(v)}>
              <SelectTrigger className={fieldClassName}>
                <SelectValue placeholder="Pilih kamar" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    Kamar {room.nomor} - Lantai {room.lantai}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.kamarId && (
              <p role="alert" className="text-label-sm text-destructive">
                {errors.kamarId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanggalMulaiSewa" className="text-label-md text-on-surface-variant">
              Tanggal Masuk
            </Label>
            <Input
              id="tanggalMulaiSewa"
              type="date"
              value={tanggalMulaiSewa}
              onChange={(e) => setTanggalMulaiSewa(e.target.value)}
              className={fieldClassName}
              aria-invalid={!!errors.tanggalMulaiSewa}
            />
            {errors.tanggalMulaiSewa && (
              <p role="alert" className="text-label-sm text-destructive">
                {errors.tanggalMulaiSewa}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nominalSewa" className="text-label-md text-on-surface-variant">
              Nominal Sewa (per bulan)
            </Label>
            <Input
              id="nominalSewa"
              type="number"
              min={0}
              value={nominalSewa}
              onChange={(e) => setNominalSewa(e.target.value)}
              placeholder="cth: 1000000"
              className={fieldClassName}
              aria-invalid={!!errors.nominalSewa}
            />
            {errors.nominalSewa && (
              <p role="alert" className="text-label-sm text-destructive">
                {errors.nominalSewa}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanggalJatuhTempo" className="text-label-md text-on-surface-variant">
              Tanggal Jatuh Tempo (1-28)
            </Label>
            <Input
              id="tanggalJatuhTempo"
              type="number"
              min={1}
              max={28}
              value={tanggalJatuhTempo}
              onChange={(e) => setTanggalJatuhTempo(e.target.value)}
              placeholder="cth: 15"
              className={fieldClassName}
              aria-invalid={!!errors.tanggalJatuhTempo}
            />
            {errors.tanggalJatuhTempo && (
              <p role="alert" className="text-label-sm text-destructive">
                {errors.tanggalJatuhTempo}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || isLoadingTenant}>
              {isPending ? "Menyimpan..." : isLoadingTenant ? "Memuat..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
