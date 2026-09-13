"use client";

import { useAddPayment } from "@/hooks/api/use-payment-records";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useFinanceAccounts } from "@/hooks/api/use-finance-accounts";
import type { PaymentMethod, CreatePaymentRecordInput } from "@/types";

interface PaymentRecordFormProps {
  pembayaranId: string;
  nominal: number;
  totalDibayar: number;
  initialPaymentDate?: string;
  onSuccess?: () => void;
}

export function PaymentRecordForm({
  pembayaranId,
  nominal,
  totalDibayar,
  initialPaymentDate,
  onSuccess,
}: PaymentRecordFormProps) {
  const mutation = useAddPayment({
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const { data: accounts = [] } = useFinanceAccounts();

  const remainingBalance = nominal - totalDibayar;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const input: CreatePaymentRecordInput = {
      pembayaranId,
      paymentMethod: (formData.get("paymentMethod") as PaymentMethod) || "CASH",
      paymentDate: formData.get("paymentDate") as string,
      amountPaid: Number(formData.get("amountPaid")),
      referenceNumber: formData.get("referenceNumber")?.toString() || undefined,
      notes: formData.get("notes")?.toString() || undefined,
      financialAccountId: formData.get("financialAccountId")?.toString() || undefined,
    };

    mutation.mutate(input);
  };

  return (
    <Card className="border-outline-variant/30 shadow-ambient-sm">
      <CardHeader>
        <CardTitle className="text-heading-sm">Catat Pembayaran</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="paymentMethod" className="text-label-sm font-medium">
                Metode Pembayaran
              </Label>
              <Select name="paymentMethod" required defaultValue="CASH">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Tunai / Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Transfer Bank</SelectItem>
                  <SelectItem value="QRIS">QRIS</SelectItem>
                  <SelectItem value="E_WALLET">E-Wallet</SelectItem>
                  <SelectItem value="OTHER">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="paymentDate" className="text-label-sm font-medium">
                Tanggal Bayar
              </Label>
              <Input
                id="paymentDate"
                name="paymentDate"
                type="date"
                required
                defaultValue={initialPaymentDate || new Date().toISOString().split("T")[0]}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="amountPaid" className="text-label-sm font-medium">
                Nominal Dibayar
              </Label>
              <span className="text-label-sm text-on-surface-variant">
                Sisa: {formatCurrency(remainingBalance)}
              </span>
            </div>
            <Input
              id="amountPaid"
              name="amountPaid"
              type="number"
              required
              min="1"
              step="1000"
              defaultValue={remainingBalance}
              className="h-10 font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNumber" className="text-label-sm font-medium">
              No. Referensi (Opsional)
            </Label>
            <Input
              id="referenceNumber"
              name="referenceNumber"
              type="text"
              placeholder="Contoh: TRF987654321"
              className="h-10"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-label-sm font-medium">
              Catatan (Opsional)
            </Label>
            <Input
              id="notes"
              name="notes"
              type="text"
              placeholder="Keterangan tambahan..."
              className="h-10"
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="financialAccountId" className="text-label-sm font-medium">
              Akun Keuangan (Opsional)
            </Label>
            <Select name="financialAccountId">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih akun (default: Cash)" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} — {acc.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-label-sm text-on-surface-variant">
              Jika kosong, otomatis pakai Cash.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Memproses..." : "Simpan Pembayaran"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
