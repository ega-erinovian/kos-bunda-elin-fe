"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WhatsAppComposer } from "@/components/features/whatsapp/WhatsAppComposer";
import { usePayment } from "@/hooks/api/use-payments";
import { getInitials } from "@/lib/utils";
import { paymentToDefaultTemplate, paymentToWhatsAppVars } from "@/lib/whatsapp";
import type { Payment } from "@/types";
import { PaymentDetailHeader } from "./PaymentDetailHeader";
import { PaymentHistoryList } from "./PaymentHistoryList";
import { PaymentSummaryCard } from "./PaymentSummaryCard";

type PaymentDetailContentProps = {
  paymentId: string;
};

export function PaymentDetailContent({ paymentId }: PaymentDetailContentProps) {
  const { data, isLoading, isError } = usePayment(paymentId);
  const [waOpen, setWaOpen] = useState(false);

  const payment = (data as Payment | undefined) ?? null;
  const waVars = payment ? paymentToWhatsAppVars(payment) : null;
  const waDefaultTemplate = payment ? paymentToDefaultTemplate(payment) : undefined;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2 py-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="rounded-2xl border border-surface-variant/50 bg-surface-container-low p-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <FileText className="h-6 w-6" />
        </div>
        <p className="mt-3 text-body-md font-medium text-on-surface">
          Gagal memuat detail pembayaran
        </p>
        <p className="mt-1 text-label-md text-on-surface-variant">
          Silakan coba lagi atau periksa koneksi Anda.
        </p>
      </div>
    );
  }

  const records = (payment.paymentRecords ?? [])
    .slice()
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  const initials = getInitials(payment.penyewa.nama);
  const totalDibayar = payment.totalDibayar ?? 0;
  const isOverpaid = totalDibayar > payment.nominal;

  return (
    <div className="flex flex-col gap-5">
      <PaymentDetailHeader
        payment={payment}
        initials={initials}
        isOverpaid={isOverpaid}
        totalDibayar={totalDibayar}
        nominal={payment.nominal}
        onWaOpen={() => setWaOpen(true)}
      />

      {waVars && (
        <WhatsAppComposer
          open={waOpen}
          onOpenChange={setWaOpen}
          phone={payment.penyewa.noHp}
          vars={waVars}
          defaultTemplateId={waDefaultTemplate}
          title={`WhatsApp — ${payment.penyewa.nama}`}
        />
      )}

      <PaymentSummaryCard payment={payment} />

      <PaymentHistoryList records={records} />
    </div>
  );
}
