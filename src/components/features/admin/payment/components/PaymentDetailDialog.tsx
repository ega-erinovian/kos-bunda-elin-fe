"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentDetailContent } from "./PaymentDetailContent";

type PaymentDetailDialogProps = {
  paymentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PaymentDetailDialog({ paymentId, open, onOpenChange }: PaymentDetailDialogProps) {
  if (!paymentId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-140 overflow-hidden p-0">
        <div className="max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 z-10 border-b border-outline-variant/20 bg-popover px-6 pb-4 pt-6">
            <DialogTitle className="font-heading text-heading-md text-on-surface">
              Detail Pembayaran
            </DialogTitle>
            <p className="text-label-md text-on-surface-variant">Ringkasan tagihan dan riwayat transaksi.</p>
          </DialogHeader>
          <div className="p-6">
            <PaymentDetailContent paymentId={paymentId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
