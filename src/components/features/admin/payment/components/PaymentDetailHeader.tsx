"use client";

import { Building2, MessageCircle, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../StatusBadge";
import { formatCurrency } from "@/lib/utils";
import type { Payment } from "@/types";

type PaymentDetailHeaderProps = {
  payment: Payment;
  initials: string;
  isOverpaid: boolean;
  totalDibayar: number;
  nominal: number;
  onWaOpen: () => void;
};

export function PaymentDetailHeader({
  payment,
  initials,
  isOverpaid,
  totalDibayar,
  nominal,
  onWaOpen,
}: PaymentDetailHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-14 w-14 shrink-0">
        <AvatarFallback className="bg-muted text-base font-semibold text-on-surface-variant">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h2 className="font-heading text-heading-md leading-none font-semibold text-on-surface">
          {payment.penyewa.nama}
        </h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-label-md text-on-surface-variant">
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            Kamar {payment.penyewa.kamar.nomor}
            {payment.penyewa.kamar.lantai ? ` · Lantai ${payment.penyewa.kamar.lantai}` : ""}
          </span>
          <span className="inline-flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            {payment.penyewa.noHp}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={payment.status} />
          {isOverpaid && (
            <Badge variant="destructive" className="rounded-full">
              Lebih Bayar {formatCurrency(totalDibayar - nominal)}
            </Badge>
          )}
        </div>
      </div>
      <Button
        size="sm"
        onClick={onWaOpen}
        className="shrink-0 self-start bg-whatsapp text-white hover:bg-whatsapp-hover focus-visible:ring-whatsapp/30 md:self-auto"
        aria-label="Kirim via WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Button>
    </div>
  );
}
