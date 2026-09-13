"use client";

import { useEffect, useState } from "react";
import { Check, Info, Pencil, Trash2, MoreVertical, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SettlementRecordForm } from "./SettlementRecordForm";
import { PaymentDetailDialog } from "./PaymentDetailDialog";
import { PaymentDetailDrawer } from "./PaymentDetailDrawer";
import { WhatsAppComposer } from "@/components/features/whatsapp/WhatsAppComposer";
import { usePayment } from "@/hooks/api/use-payments";
import {
  paymentToDefaultTemplate,
  paymentToWhatsAppVars,
  type WhatsAppVars,
} from "@/lib/whatsapp";
import type { Payment } from "../types";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);
  return isMobile;
}

type PaymentRowDropdownProps = {
  payment: Payment;
  onEdit?: (payment: Payment) => void;
  onBayar?: (payment: Payment) => void;
};

export function PaymentRowDropdown({ payment, onEdit, onBayar }: PaymentRowDropdownProps) {
  const isPaid = payment.status === "paid";
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: waData } = usePayment(payment.id, { enabled: waOpen });
  const apiPayment = waData ?? null;
  const waVars: WhatsAppVars | null = apiPayment ? paymentToWhatsAppVars(apiPayment) : null;
  const waDefaultTemplate = apiPayment ? paymentToDefaultTemplate(apiPayment) : undefined;

  const handleBayar = () => {
    if (onBayar) {
      onBayar(payment);
    } else {
      setSettlementOpen(true);
    }
  };

  const handleDetailOpenChange = (open: boolean) => {
    setDetailOpen(open);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center justify-center rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary data-open:bg-primary/10 data-open:text-primary">
          <MoreVertical className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {isPaid ? (
            <>
              <DropdownMenuItem onClick={() => setDetailOpen(true)}>
                <Info className="h-4 w-4" />
                Detail Pembayaran
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setWaOpen(true)}>
                <MessageCircle className="h-4 w-4" />
                Kirim via WhatsApp
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={handleBayar}>
                <Check className="h-4 w-4" />
                Bayar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setWaOpen(true)}>
                <MessageCircle className="h-4 w-4" />
                Kirim via WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDetailOpen(true)}>
                <Info className="h-4 w-4" />
                Detail Pembayaran
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit?.(payment)}>
                <Pencil className="h-4 w-4" />
                Edit Tagihan
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => console.log("Delete:", payment.id)}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {!onBayar && !isPaid && (
        <SettlementRecordForm
          open={settlementOpen}
          onOpenChange={setSettlementOpen}
          pembayaranId={payment.id}
          nominal={payment.amount}
          totalDibayar={payment.totalDibayar ?? 0}
        />
      )}

      {detailOpen &&
        (isMobile ? (
          <PaymentDetailDrawer
            paymentId={payment.id}
            open={detailOpen}
            onOpenChange={handleDetailOpenChange}
          />
        ) : (
          <PaymentDetailDialog
            paymentId={payment.id}
            open={detailOpen}
            onOpenChange={handleDetailOpenChange}
          />
        ))}

      {waOpen &&
        (waVars && apiPayment ? (
          <WhatsAppComposer
            open={waOpen}
            onOpenChange={setWaOpen}
            phone={apiPayment.penyewa.noHp}
            vars={waVars}
            defaultTemplateId={waDefaultTemplate}
            title={`WhatsApp — ${apiPayment.penyewa.nama}`}
          />
        ) : (
          <WhatsAppComposer
            open={waOpen}
            onOpenChange={setWaOpen}
            phone=""
            vars={{
              nama: payment.name,
              kamar: payment.room,
              periode: "-",
              nominal: String(payment.amount),
              sisaTagihan: String(payment.amount - (payment.totalDibayar ?? 0)),
              totalDibayar: String(payment.totalDibayar ?? 0),
              tanggalJatuhTempo: "-",
            }}
            defaultTemplateId="reminder_jatuh_tempo"
          />
        ))}
    </>
  );
}
