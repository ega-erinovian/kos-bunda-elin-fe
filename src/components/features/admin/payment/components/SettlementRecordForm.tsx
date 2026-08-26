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
import { useSettlementRecordForm } from "@/hooks/features/admin/payments/useSettlementRecordForm";
import { formatCurrency } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

type SettlementRecordFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pembayaranId: string;
  nominal: number;
  totalDibayar: number;
  onSuccess?: () => void;
};

const fieldClassName = "w-full border-outline-variant bg-surface-container-lowest";

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Tunai / Cash" },
  { value: "BANK_TRANSFER", label: "Transfer Bank" },
  { value: "QRIS", label: "QRIS" },
  { value: "E_WALLET", label: "E-Wallet" },
  { value: "OTHER", label: "Lainnya" },
];

export function SettlementRecordForm({
  open,
  onOpenChange,
  pembayaranId,
  nominal,
  totalDibayar,
  onSuccess,
}: SettlementRecordFormProps) {
  const form = useSettlementRecordForm({
    pembayaranId,
    open,
    onOpenChange,
    nominal,
    totalDibayar,
    onSuccess,
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = tomorrow.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-112">
        <DialogHeader>
          <DialogTitle>Bayar Tagihan</DialogTitle>
          <DialogDescription>
            Catat pembayaran untuk tagihan ini. Sisa tagihan:{" "}
            {formatCurrency(form.remainingBalance)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="paymentMethod" className="text-label-md text-on-surface-variant">
                Metode Pembayaran
              </Label>
              <Select
                items={Object.fromEntries(paymentMethodOptions.map((o) => [o.value, o.label]))}
                value={form.paymentMethod}
                onValueChange={(v) => v !== null && form.setPaymentMethod(v as PaymentMethod)}
              >
                <SelectTrigger
                  id="paymentMethod"
                  className={fieldClassName}
                  aria-invalid={!!form.errors.paymentMethod}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethodOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.errors.paymentMethod && (
                <p role="alert" className="text-label-sm text-destructive">
                  {form.errors.paymentMethod}
                </p>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="paymentDate" className="text-label-md text-on-surface-variant">
                Tanggal Bayar
              </Label>
              <Input
                id="paymentDate"
                type="date"
                value={form.paymentDate}
                onChange={(e) => form.setPaymentDate(e.target.value)}
                max={maxDate}
                className={fieldClassName}
                aria-invalid={!!form.errors.paymentDate}
              />
              {form.errors.paymentDate && (
                <p role="alert" className="text-label-sm text-destructive">
                  {form.errors.paymentDate}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="amountPaid" className="text-label-md text-on-surface-variant">
                Nominal Dibayar
              </Label>
              <span className="text-label-sm text-on-surface-variant">
                Sisa: {formatCurrency(form.remainingBalance)}
              </span>
            </div>
            <Input
              id="amountPaid"
              type="number"
              min={1}
              step="0.01"
              value={form.amountPaid}
              onChange={(e) => form.setAmountPaid(e.target.value)}
              placeholder="cth: 1500000"
              className={fieldClassName}
              aria-invalid={!!form.errors.amountPaid}
            />
            {form.errors.amountPaid ? (
              <p role="alert" className="text-label-sm text-destructive">
                {form.errors.amountPaid}
              </p>
            ) : (
              <p className="text-label-xs text-outline">Maks 2 desimal. Harus lebih dari 0.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNumber" className="text-label-md text-on-surface-variant">
              No. Referensi <span className="text-outline">(opsional)</span>
            </Label>
            <Input
              id="referenceNumber"
              value={form.referenceNumber}
              onChange={(e) => form.setReferenceNumber(e.target.value)}
              placeholder="Contoh: TRF987654321"
              className={fieldClassName}
              maxLength={100}
              aria-invalid={!!form.errors.referenceNumber}
            />
            {form.errors.referenceNumber && (
              <p role="alert" className="text-label-sm text-destructive">
                {form.errors.referenceNumber}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-label-md text-on-surface-variant">
              Catatan <span className="text-outline">(opsional)</span>
            </Label>
            <Input
              id="notes"
              value={form.notes}
              onChange={(e) => form.setNotes(e.target.value)}
              placeholder="Keterangan tambahan..."
              className={fieldClassName}
              maxLength={500}
              aria-invalid={!!form.errors.notes}
            />
            {form.errors.notes && (
              <p role="alert" className="text-label-sm text-destructive">
                {form.errors.notes}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={form.isPending}>
              {form.isPending ? "Memproses..." : "Simpan Pembayaran"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
