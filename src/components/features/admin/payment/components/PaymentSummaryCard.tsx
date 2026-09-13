"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, getMonthName } from "@/lib/utils";
import type { Payment } from "@/types";

function formatMethodDate(iso: string): string {
  try {
    return formatDate(iso);
  } catch {
    return iso;
  }
}

function DetailRow({
  label,
  value,
  showDivider = false,
  valueClassName,
}: {
  label: string;
  value: string;
  showDivider?: boolean;
  valueClassName?: string;
}) {
  return (
    <>
      {showDivider && <hr className="border-outline-variant/30" />}
      <div className="flex items-center justify-between gap-4">
        <span className="shrink-0 text-label-md text-on-surface-variant">{label}</span>
        <span className={`text-right text-body-md text-on-surface ${valueClassName ?? ""}`}>
          {value}
        </span>
      </div>
    </>
  );
}

type PaymentSummaryCardProps = {
  payment: Payment;
};

export function PaymentSummaryCard({ payment }: PaymentSummaryCardProps) {
  const periodeLabel = `${getMonthName(payment.periodeBulan)} ${payment.periodeTahun}`;
  const nominal = payment.nominal;
  const totalDibayar = payment.totalDibayar ?? 0;
  const sisa = nominal - totalDibayar;
  const isOverpaid = totalDibayar > nominal;
  const isLunas = payment.status === "LUNAS";
  const isSebagian = payment.status === "SEBAGIAN";
  const progress = nominal > 0 ? Math.min((totalDibayar / nominal) * 100, 100) : 0;

  return (
    <div className="rounded-2xl border border-surface-variant/50 bg-surface-container-low p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-label-md font-semibold text-on-surface">
          Ringkasan Tagihan
        </h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-highest px-2.5 py-1 text-label-sm font-medium text-on-surface-variant">
          <CalendarDays className="h-3.5 w-3.5" />
          {periodeLabel}
        </span>
      </div>
      <Separator className="my-3 bg-outline-variant/30" />

      <div className="rounded-xl bg-surface-container-lowest p-4 shadow-ambient-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-label-sm text-on-surface-variant">Total Tagihan</p>
            <p className="mt-1 font-heading text-heading-md font-bold leading-none text-on-surface">
              {formatCurrency(nominal)}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-label-sm text-on-surface-variant">
              <Clock3 className="h-3.5 w-3.5" />
              Jatuh tempo {formatMethodDate(payment.tanggalJatuhTempo)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-label-sm text-on-surface-variant">
              {isLunas ? "Sudah dibayar" : isSebagian ? "Terbayar" : "Dibayar"}
            </p>
            <p
              className={`mt-1 font-heading text-heading-md font-bold leading-none ${isOverpaid ? "text-destructive" : isLunas ? "text-primary" : "text-on-surface"}`}
            >
              {formatCurrency(totalDibayar)}
            </p>
            <p
              className={`mt-1 text-label-sm font-medium ${sisa === 0 ? "text-primary" : sisa > 0 ? "text-on-surface-variant" : "text-destructive"}`}
            >
              {sisa === 0
                ? "Lunas"
                : sisa > 0
                  ? `Sisa ${formatCurrency(sisa)}`
                  : `Kelebihan ${formatCurrency(Math.abs(sisa))}`}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-label-sm">
            <span className="text-on-surface-variant">Progress</span>
            <span className={`font-medium ${isOverpaid ? "text-destructive" : "text-on-surface"}`}>
              {nominal > 0 ? Math.round((totalDibayar / nominal) * 100) : 0}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div
              className={`h-full rounded-full transition-all ${isOverpaid ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-label-sm text-on-surface-variant">
            <span>{formatCurrency(totalDibayar)}</span>
            <span>{formatCurrency(nominal)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <DetailRow label="Periode" value={periodeLabel} />
        <DetailRow
          label="Jatuh Tempo"
          value={formatMethodDate(payment.tanggalJatuhTempo)}
          showDivider
        />
        <DetailRow
          label="Tanggal Bayar"
          value={payment.tanggalBayar ? formatMethodDate(payment.tanggalBayar) : "-"}
          showDivider
        />
        <DetailRow label="Nominal" value={formatCurrency(nominal)} showDivider />
        <DetailRow label="Total Dibayar" value={formatCurrency(totalDibayar)} showDivider />
        <DetailRow
          label="Sisa Tagihan"
          value={sisa <= 0 ? "Lunas" : formatCurrency(sisa)}
          showDivider
          valueClassName={
            sisa <= 0 ? "font-semibold text-primary" : isOverpaid ? "text-destructive" : ""
          }
        />
        {payment.catatan ? (
          <DetailRow label="Catatan" value={payment.catatan} showDivider />
        ) : (
          <DetailRow label="Catatan" value="-" showDivider />
        )}
      </div>
    </div>
  );
}
