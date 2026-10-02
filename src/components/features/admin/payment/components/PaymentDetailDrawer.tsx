"use client";

import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import {
  WhatsAppComposer,
  type WhatsAppRequest,
} from "@/components/features/whatsapp/WhatsAppComposer";
import { PaymentDetailContent } from "./PaymentDetailContent";

type PaymentDetailDrawerProps = {
  paymentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PaymentDetailDrawer({ paymentId, open, onOpenChange }: PaymentDetailDrawerProps) {
  const [wa, setWa] = useState<WhatsAppRequest | null>(null);

  if (!paymentId) return null;

  function handleWaOpen(req: WhatsAppRequest) {
    setWa(req);
    onOpenChange(false);
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle swipeDirection="down">
        <DrawerContent className="rounded-t-4xl px-4 pb-8">
          <DrawerHeader className="px-0 pb-2">
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-surface-variant" />
            <DrawerTitle className="text-left font-heading text-heading-md text-on-surface">
              Detail Pembayaran
            </DrawerTitle>
            <p className="text-left text-label-md text-on-surface-variant">
              Ringkasan tagihan dan riwayat transaksi.
            </p>
          </DrawerHeader>
          <div className="max-h-[72dvh] overflow-y-auto overscroll-contain pr-1">
            <PaymentDetailContent paymentId={paymentId} onWaOpen={handleWaOpen} />
          </div>
        </DrawerContent>
      </Drawer>
      {wa && (
        <WhatsAppComposer
          open
          onOpenChange={(o) => {
            if (!o) setWa(null);
          }}
          phone={wa.phone}
          vars={wa.vars}
          defaultTemplateId={wa.templateId}
          title={wa.title}
        />
      )}
    </>
  );
}
