"use client";

import { Building2, CalendarDays, Clock3, CreditCard, FileText, Phone, Wallet } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "../StatusBadge";
import { usePayment } from "@/hooks/api/use-payments";
import { formatCurrency, formatDate, getInitials, getMonthName } from "@/lib/utils";
import type { Payment, PaymentRecord } from "@/types";

type PaymentDetailContentProps = {
  paymentId: string;
};

function getMethodLabel(method: PaymentRecord["paymentMethod"]): string {
  const map: Record<PaymentRecord["paymentMethod"], string> = {
    CASH: "Tunai",
    BANK_TRANSFER: "Transfer Bank",
    QRIS: "QRIS",
    E_WALLET: "E-Wallet",
    OTHER: "Lainnya",
  };
  return map[method] ?? "Tunai";
}

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

export function PaymentDetailContent({ paymentId }: PaymentDetailContentProps) {
  const { data, isLoading, isError } = usePayment(paymentId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {/* header skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2 py-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        {/* summary skeleton */}
        <div className="rounded-2xl border border-surface-variant/50 bg-surface-container-low p-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        {/* records skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <FileText className="h-6 w-6" />
        </div>
        <p className="mt-3 text-body-md font-medium text-on-surface">Gagal memuat detail pembayaran</p>
        <p className="mt-1 text-label-md text-on-surface-variant">
          Silakan coba lagi atau periksa koneksi Anda.
        </p>
      </div>
    );
  }

  // usePayment unwraps ApiResponse and returns Payment directly (unlike useTenant which returns ApiResponse)
  // handle both shapes defensively
  const payment = ((data as unknown as Payment)?.penyewa
    ? (data as unknown as Payment)
    : ((data as unknown as { data: Payment })?.data as Payment)) as Payment;
  const records = (payment.paymentRecords ?? [])
    .slice()
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  const initials = getInitials(payment.penyewa.nama);
  const periodeLabel = `${getMonthName(payment.periodeBulan)} ${payment.periodeTahun}`;
  const nominal = payment.nominal;
  const totalDibayar = payment.totalDibayar ?? 0;
  const sisa = nominal - totalDibayar;
  const isOverpaid = totalDibayar > nominal;
  const isLunas = payment.status === "LUNAS";
  const isSebagian = payment.status === "SEBAGIAN";
  const progress = nominal > 0 ? Math.min((totalDibayar / nominal) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Identity header */}
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
      </div>

      {/* Summary card - calm surface per DESIGN.md */}
      <div className="rounded-2xl border border-surface-variant/50 bg-surface-container-low p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-label-md font-semibold text-on-surface">Ringkasan Tagihan</h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-highest px-2.5 py-1 text-label-sm font-medium text-on-surface-variant">
            <CalendarDays className="h-3.5 w-3.5" />
            {periodeLabel}
          </span>
        </div>
        <Separator className="my-3 bg-outline-variant/30" />

        {/* Financial hero */}
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

          {/* progress */}
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

        {/* Detail rows */}
        <div className="mt-4 flex flex-col gap-3">
          <DetailRow label="Periode" value={periodeLabel} />
          <DetailRow label="Jatuh Tempo" value={formatMethodDate(payment.tanggalJatuhTempo)} showDivider />
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
            valueClassName={sisa <= 0 ? "font-semibold text-primary" : isOverpaid ? "text-destructive" : ""}
          />
          {payment.catatan ? (
            <DetailRow label="Catatan" value={payment.catatan} showDivider />
          ) : (
            <DetailRow label="Catatan" value="-" showDivider />
          )}
        </div>
      </div>

      {/* Payment records */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-label-md font-semibold text-on-surface">Riwayat Pembayaran</h3>
          <Badge variant="secondary" className="rounded-full font-medium">
            {records.length} transaksi
          </Badge>
        </div>

        {records.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-low/60 p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant">
              <Wallet className="h-5 w-5" />
            </div>
            <p className="mt-3 text-body-md font-medium text-on-surface">Belum ada pembayaran</p>
            <p className="mt-1 text-label-md text-on-surface-variant">
              Pembayaran yang dicatat akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {records.map((r) => (
              <div
                key={r.id}
                className="flex gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3.5 shadow-ambient-sm transition-colors hover:bg-surface-container-low md:p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-label-md font-semibold text-on-surface">
                      {getMethodLabel(r.paymentMethod)}
                    </span>
                    <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm font-medium text-on-surface-variant">
                      {formatCurrency(r.amountPaid)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-label-sm text-on-surface-variant">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatMethodDate(r.paymentDate)}
                    </span>
                    {r.referenceNumber && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <FileText className="h-3.5 w-3.5" />
                        {r.referenceNumber}
                      </span>
                    )}
                  </div>
                  {r.notes && (
                    <p className="mt-1.5 line-clamp-2 rounded-lg bg-surface-container-low px-2.5 py-1.5 text-label-md leading-relaxed text-on-surface-variant">
                      {r.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
