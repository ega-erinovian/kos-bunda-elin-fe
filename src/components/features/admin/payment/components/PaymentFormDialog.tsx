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
import { useUpdatePembayaranForm } from "@/hooks/features/admin/payments/useUpdatePembayaranForm";
import { monthSelectOptions } from "../constants";
import type { Payment } from "@/types";

type PaymentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPayment?: Payment | null;
  onSuccess?: () => void;
};

const fieldClassName = "w-full border-outline-variant bg-surface-container-lowest";

export function PaymentFormDialog({
  open,
  onOpenChange,
  editingPayment = null,
  onSuccess,
}: PaymentFormDialogProps) {
  const createForm = useCreatePembayaranForm(open, onOpenChange);
  const updateForm = useUpdatePembayaranForm(open, onOpenChange, editingPayment, onSuccess);
  const form = editingPayment ? updateForm : createForm;
  const isPending = editingPayment ? updateForm.isPending : createForm.isPending;
  const isLoading = editingPayment ? updateForm.isLoading : false;
  const tenantsQuery = useTenants({ aktif: true, limit: 100 });
  const tenants = tenantsQuery?.data?.data ?? [];
  const noTenants = !tenantsQuery?.isLoading && tenants.length === 0;

  const formValues = editingPayment
    ? {
        tanggalJatuhTempo: form.tanggalJatuhTempo,
        catatan: form.catatan,
      }
    : {
        penyewaId: createForm.penyewaId,
        bulan: createForm.bulan,
        tahun: createForm.tahun,
        tanggalJatuhTempo: createForm.tanggalJatuhTempo,
        nominal: createForm.nominal,
        catatan: createForm.catatan,
      };

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-112">
        <DialogHeader>
          <DialogTitle>
            {editingPayment
              ? `Edit Tagihan - ${editingPayment.periodeBulan}/${editingPayment.periodeTahun}`
              : "Input Tagihan"}
          </DialogTitle>
          <DialogDescription>
            {editingPayment
              ? "Ubah detail tagihan yang sudah ada."
              : "Catat tagihan sewa bulanan untuk penghuni yang sudah ada."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            form.handleSubmit(e);
            onSuccess?.();
          }}
          className="space-y-4"
        >
          {!editingPayment && (
            <div className="space-y-2">
              <Label htmlFor="penyewa" className="text-label-md text-on-surface-variant">
                Penghuni
              </Label>
              <Select
                items={Object.fromEntries(
                  tenants.map((t) => [
                    t.id,
                    t.kamar?.nomor ? `${t.nama} — Kamar ${t.kamar.nomor}` : t.nama,
                  ]),
                )}
                value={formValues.penyewaId}
                onValueChange={(v) => v !== null && createForm.setPenyewaId(v)}
                disabled={tenantsQuery?.isLoading || noTenants}
              >
                <SelectTrigger
                  className={fieldClassName}
                  aria-invalid={!!createForm.errors.penyewaId}
                >
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
              {createForm.errors.penyewaId && (
                <p role="alert" className="text-label-sm text-destructive">
                  {createForm.errors.penyewaId}
                </p>
              )}
            </div>
          )}

          {!editingPayment && (
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="periode-bulan" className="text-label-md text-on-surface-variant">
                  Periode Bulan
                </Label>
                <Select
                  items={Object.fromEntries(monthSelectOptions.map((opt) => [opt.key, opt.label]))}
                  value={formValues.bulan}
                  onValueChange={(v) => v !== null && createForm.setBulan(v)}
                >
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
                  max={new Date().getFullYear() + 1}
                  value={formValues.tahun}
                  onChange={(e) => createForm.setTahun(e.target.value)}
                  placeholder="cth: 2026"
                  className={fieldClassName}
                  aria-invalid={!!createForm.errors.periodeTahun}
                />
                {createForm.errors.periodeTahun && (
                  <p role="alert" className="text-label-sm text-destructive">
                    {createForm.errors.periodeTahun}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tanggal-jatuh-tempo" className="text-label-md text-on-surface-variant">
              Tanggal Jatuh Tempo
            </Label>
            <Input
              id="tanggal-jatuh-tempo"
              type="date"
              value={formValues.tanggalJatuhTempo}
              onChange={(e) =>
                editingPayment
                  ? updateForm.setTanggalJatuhTempo(e.target.value)
                  : createForm.setTanggalJatuhTempo(e.target.value)
              }
              max={maxDate.toISOString().split("T")[0]}
              className={fieldClassName}
              aria-invalid={!!form.errors.tanggalJatuhTempo}
            />
            {form.errors.tanggalJatuhTempo && (
              <p role="alert" className="text-label-sm text-destructive">
                {form.errors.tanggalJatuhTempo}
              </p>
            )}
          </div>

          {!editingPayment && (
            <div className="space-y-2">
              <Label htmlFor="nominal" className="text-label-md text-on-surface-variant">
                Nominal Tagihan
              </Label>
              <Input
                id="nominal"
                type="number"
                min={0}
                value={formValues.nominal}
                onChange={(e) => createForm.setNominal(e.target.value)}
                placeholder="cth: 1500000"
                className={fieldClassName}
                aria-invalid={!!createForm.errors.nominal}
              />
              {createForm.errors.nominal ? (
                <p role="alert" className="text-label-sm text-destructive">
                  {createForm.errors.nominal}
                </p>
              ) : (
                <p className="text-label-xs text-outline">
                  Biaya sewa bulanan penghuni untuk periode yang dipilih.
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="catatan" className="text-label-md text-on-surface-variant">
              Catatan <span className="text-outline">(opsional)</span>
            </Label>
            <Input
              id="catatan"
              value={formValues.catatan}
              onChange={(e) =>
                editingPayment
                  ? updateForm.setCatatan(e.target.value)
                  : createForm.setCatatan(e.target.value)
              }
              placeholder="Keterangan tambahan..."
              className={fieldClassName}
              aria-invalid={!!form.errors.catatan}
            />
            {form.errors.catatan && (
              <p role="alert" className="text-label-sm text-destructive">
                {form.errors.catatan}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending || isLoading || (!!editingPayment && noTenants)}
            >
              {isPending
                ? "Menyimpan..."
                : isLoading
                  ? "Memuat..."
                  : editingPayment
                    ? "Simpan"
                    : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
