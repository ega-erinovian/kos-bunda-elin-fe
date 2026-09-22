"use client";

import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CashFlowReport } from "@/types";

type Props = {
  data: CashFlowReport | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

function Skeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="animate-pulse p-6">
          <div className="h-4 w-24 rounded bg-surface-container-highest" />
          <div className="mt-3 h-6 w-32 rounded bg-surface-container-highest" />
        </Card>
      ))}
    </div>
  );
}

export function CashFlowReportPanel({ data, isLoading, isError, onRetry }: Props) {
  if (isLoading) return <Skeleton />;
  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-label-md text-destructive">Gagal memuat laporan arus kas</p>
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

  const positive = data.net >= 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/30 bg-card shadow-ambient-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-label-md font-medium text-on-surface-variant">
              <span className="rounded-full bg-primary/10 p-1.5 text-primary">
                <ArrowUpCircle className="h-4 w-4" />
              </span>
              Arus masuk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-heading-md text-on-surface">
              {formatCurrency(data.inflow)}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">
              Semua INCOME termasuk deposit
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-card shadow-ambient-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-label-md font-medium text-on-surface-variant">
              <span className="rounded-full bg-error-container p-1.5 text-on-error-container">
                <ArrowDownCircle className="h-4 w-4" />
              </span>
              Arus keluar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-heading-md text-on-surface">
              {formatCurrency(data.outflow)}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">
              Semua EXPENSE termasuk refund deposit
            </p>
          </CardContent>
        </Card>

        <Card
          className={`border shadow-ambient-sm ${positive ? "border-primary/20 bg-primary/5" : "border-destructive/20 bg-destructive/5"}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-label-md font-medium text-on-surface-variant">
              <span
                className={`rounded-full p-1.5 ${positive ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}
              >
                <Scale className="h-4 w-4" />
              </span>
              Arus bersih
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`font-heading text-heading-md ${positive ? "text-primary" : "text-destructive"}`}
            >
              {formatCurrency(data.net)}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">
              {positive ? "Surplus di rentang ini" : "Defisit di rentang ini"}
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="rounded-lg border border-border/30 bg-surface-container-low px-4 py-3 text-label-sm text-on-surface-variant">
        Deposit diterima dan refund deposit adalah pergerakan kas nyata — selalu muncul di arus kas,
        tetapi tidak pernah di pendapatan sewa atau laba rugi.
      </p>
    </div>
  );
}
