"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import type { IncomeStatementReport } from "@/types";

type Props = {
  data: IncomeStatementReport | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

function Skeleton() {
  return (
    <Card className="animate-pulse p-6">
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-surface-container-highest" />
        <div className="h-6 w-24 rounded bg-surface-container-highest" />
      </div>
    </Card>
  );
}

export function IncomeStatementReportPanel({ data, isLoading, isError, onRetry }: Props) {
  if (isLoading) return <Skeleton />;
  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-label-md text-destructive">Gagal memuat laporan laba rugi</p>
        <button
          onClick={onRetry}
          className="mt-3 text-label-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Coba lagi
        </button>
      </Card>
    );
  }
  if (!data)
    return (
      <Card className="p-8 text-center text-body-md text-on-surface-variant">
        Pilih rentang tanggal untuk melihat data.
      </Card>
    );

  const profit = data.netOperatingIncome >= 0;

  return (
    <Card className="overflow-hidden border-border/30 bg-card shadow-ambient-md">
      <CardHeader className="bg-surface-container-low/50">
        <CardTitle className="font-heading text-body-md font-semibold text-on-surface">
          Laporan Laba Rugi — operasional
        </CardTitle>
        <p className="text-label-sm text-on-surface-variant">
          Hanya pendapatan sewa + pendapatan lain vs beban operasional. Deposit dikecualikan.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/30">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-body-md text-on-surface">Total pendapatan</p>
              <p className="text-label-sm text-on-surface-variant">
                Cash sewa + pendapatan lain di rentang ini
              </p>
            </div>
            <p className="font-heading text-heading-md font-semibold text-on-surface">
              {formatCurrency(data.totalIncome)}
            </p>
          </div>

          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-body-md text-on-surface">Total beban</p>
              <p className="text-label-sm text-on-surface-variant">Tanpa refund deposit</p>
            </div>
            <p className="font-heading text-heading-md font-semibold text-on-surface">
              {formatCurrency(data.totalExpenses)}
            </p>
          </div>

          <Separator />

          <div
            className={`flex items-center justify-between px-6 py-5 ${profit ? "bg-primary/5" : "bg-destructive/5"}`}
          >
            <div>
              <p className="text-label-md font-medium uppercase tracking-widest text-on-surface-variant">
                Laba operasi bersih
              </p>
              <p className="text-label-sm text-on-surface-variant">Pendapatan − beban</p>
            </div>
            <p
              className={`font-heading text-heading-md font-semibold ${profit ? "text-primary" : "text-destructive"}`}
            >
              {formatCurrency(data.netOperatingIncome)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
