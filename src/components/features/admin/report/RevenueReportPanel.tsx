"use client";

import { Banknote, HandCoins, Percent, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { RevenueReport } from "@/types";

type Props = {
  data: RevenueReport | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

function Skeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse p-5">
          <div className="h-4 w-28 rounded bg-surface-container-highest" />
          <div className="mt-3 h-6 w-36 rounded bg-surface-container-highest" />
        </Card>
      ))}
    </div>
  );
}

export function RevenueReportPanel({ data, isLoading, isError, onRetry }: Props) {
  if (isLoading) return <Skeleton />;
  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-label-md text-destructive">Gagal memuat laporan pendapatan</p>
        <button
          onClick={onRetry}
          className="mt-3 text-label-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Coba lagi
        </button>
      </Card>
    );
  }
  if (!data) {
    return (
      <Card className="p-8 text-center text-body-md text-on-surface-variant">
        Pilih rentang tanggal untuk melihat data.
      </Card>
    );
  }

  const diverges = data.billedRevenue !== data.cashRevenue;

  return (
    <div className="space-y-4">
      {/* Billed vs Cash — never merged, per PLAN §7 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/30 bg-card shadow-ambient-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-label-md font-medium text-on-surface-variant">
              <span className="rounded-full bg-primary/10 p-1.5 text-primary">
                <Banknote className="h-4 w-4" />
              </span>
              Tagihan (billed)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-heading-md text-on-surface">
              {formatCurrency(data.billedRevenue)}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">
              Jumlah nominal dengan jatuh tempo di rentang terpilih
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-card shadow-ambient-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-label-md font-medium text-on-surface-variant">
              <span className="rounded-full bg-secondary-container p-1.5 text-on-secondary-container">
                <HandCoins className="h-4 w-4" />
              </span>
              Tunai diterima (cash)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-heading-md text-on-surface">
              {formatCurrency(data.cashRevenue)}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">
              Jumlah pembayaran yang masuk di rentang terpilih
            </p>
          </CardContent>
        </Card>
      </div>

      {diverges && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-label-sm text-amber-900">
          Tagihan dan tunai berbeda — ada tagihan yang baru dibayar sebagian di rentang ini.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/30 bg-surface-container-low p-4">
          <p className="flex items-center gap-2 text-label-sm font-medium text-on-surface-variant">
            <TrendingUp className="h-4 w-4" />
            Ekspektasi
          </p>
          <p className="mt-2 font-heading text-body-md font-semibold text-on-surface">
            {formatCurrency(data.expectedRevenue)}
          </p>
        </Card>
        <Card className="border-border/30 bg-surface-container-low p-4">
          <p className="flex items-center gap-2 text-label-sm font-medium text-on-surface-variant">
            <Percent className="h-4 w-4" />
            Tingkat koleksi
          </p>
          <p className="mt-2 font-heading text-body-md font-semibold text-on-surface">
            {(data.collectionRate * 100).toFixed(1)}%
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, data.collectionRate * 100)}%` }}
            />
          </div>
        </Card>
        <Card className="border-border/30 bg-surface-container-low p-4">
          <p className="text-label-sm font-medium text-on-surface-variant">Pendapatan lain</p>
          <p className="mt-2 font-heading text-body-md font-semibold text-on-surface">
            {data.otherIncome !== undefined ? formatCurrency(data.otherIncome) : "—"}
          </p>
          <p className="mt-1 text-label-sm text-on-surface-variant">
            {data.otherIncome !== undefined
              ? "Di luar sewa & deposit, cash-basis"
              : "Tidak ada data untuk rentang ini"}
          </p>
        </Card>
      </div>

      {data.otherIncome !== undefined && (
        <p className="text-label-sm text-on-surface-variant">
          Pendapatan lain dihitung dari transaksi INCOME dengan{" "}
          <Badge variant="outline">source</Badge> di luar RENT_PAYMENT dan DEPOSIT.
        </p>
      )}
    </div>
  );
}
