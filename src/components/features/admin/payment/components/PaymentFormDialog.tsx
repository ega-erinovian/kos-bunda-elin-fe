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
import { useTenants } from "@/hooks/api/use-tenants";
import { useCreatePembayaranForm } from "@/hooks/features/admin/payments/useCreatePembayaranForm";
import { monthSelectOptions } from "../constants";

type PaymentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const fieldClassName = "w-full border-outline-variant bg-surface-container-lowest";

export function PaymentFormDialog({ open, onOpenChange }: PaymentFormDialogProps) {
  const form = useCreatePembayaranForm(open, onOpenChange);
  const tenantsQuery = useTenants({ aktif: true, limit: 100 });
  const tenants = tenantsQuery?.data?.data ?? [];
  const noTenants = !tenantsQuery?.isLoading && tenants.length === 0;

  // Base UI renders the raw value in the trigger unless Root gets an items map
  const tenantItems = Object.fromEntries(
    tenants.map((t) => [t.id, t.kamar?.nomor ? `${t.nama} — Kamar ${t.kamar.nomor}` : t.nama]),
  );
  const monthItems = Object.fromEntries(monthSelectOptions.map((opt) => [opt.key, opt.label]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-112">
        <DialogHeader>
          <DialogTitle>Input Tagihan</DialogTitle>
          <DialogDescription>
            Catat tagihan sewa bulanan untuk penghuni yang sudah ada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="penyewa" className="text-label-md text-on-surface-variant">
              Penghuni
            </Label>
            <Select
              items={tenantItems}
              value={form.penyewaId}
              onValueChange={(v) => v !== null && form.setPenyewaId(v)}
              disabled={tenantsQuery?.isLoading || noTenants}
            >
              <SelectTrigger className={fieldClassName} aria-invalid={!!form.errors.penyewaId}>
                <SelectValue placeholder="Pilih penghuni" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.nama}
                    {tenant.kamar?.nomor ? ` — Kamar ${tenant.kamar.nomor}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tenantsQuery?.isLoading ? (
              <p className="text-label-sm text-outline">Memuat daftar penghuni...</p>
            ) : noTenants ? (
              <p role="alert" className="text-label-sm text-destructive">
                Tidak ada penghuni aktif. Tambahkan penghuni terlebih dahulu.
              </p>
            ) : null}
            {form.errors.penyewaId && (
              <p role="alert" className="text-label-sm text-destructive">
                {form.errors.penyewaId}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="periode-bulan" className="text-label-md text-on-surface-variant">
                Periode Bulan
              </Label>
              <Select items={monthItems} value={form.bulan} onValueChange={(v) => v !== null && form.setBulan(v)}>
                <SelectTrigger id="periode-bulan" className={fieldClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthSelectOptions.map((opt) => (
                    <SelectItem key={opt.key} value={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="periode-tahun" className="text-label-md text-on-surface-variant">
                Periode Tahun
              </Label>
              <Input
                id="periode-tahun"
                type="number"
                min={2020}
                value={form.tahun}
                onChange={(e) => form.setTahun(e.target.value)}
                placeholder="cth: 2026"
                className={fieldClassName}
                aria-invalid={!!form.errors.periodeTahun}
              />
              {form.errors.periodeTahun && (
                <p role="alert" className="text-label-sm text-destructive">
                  {form.errors.periodeTahun}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanggal-jatuh-tempo" className="text-label-md text-on-surface-variant">
              Tanggal Jatuh Tempo
            </Label>
            <Input
              id="tanggal-jatuh-tempo"
              type="date"
              value={form.tanggalJatuhTempo}
              onChange={(e) => form.setTanggalJatuhTempo(e.target.value)}
              className={fieldClassName}
              aria-invalid={!!form.errors.tanggalJatuhTempo}
            />
            {form.errors.tanggalJatuhTempo && (
              <p role="alert" className="text-label-sm text-destructive">
                {form.errors.tanggalJatuhTempo}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nominal" className="text-label-md text-on-surface-variant">
              Nominal Tagihan
            </Label>
            <Input
              id="nominal"
              type="number"
              min={0}
              value={form.nominal}
              onChange={(e) => form.setNominal(e.target.value)}
              placeholder="cth: 1500000"
              className={fieldClassName}
              aria-invalid={!!form.errors.nominal}
            />
            {form.errors.nominal ? (
              <p role="alert" className="text-label-sm text-destructive">
                {form.errors.nominal}
              </p>
            ) : (
              <p className="text-label-xs text-outline">
                Biaya sewa bulanan penghuni untuk periode yang dipilih.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="catatan" className="text-label-md text-on-surface-variant">
              Catatan <span className="text-outline">(opsional)</span>
            </Label>
            <Input
              id="catatan"
              value={form.catatan}
              onChange={(e) => form.setCatatan(e.target.value)}
              placeholder="Keterangan tambahan..."
              className={fieldClassName}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={form.isPending || noTenants}>
              {form.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
