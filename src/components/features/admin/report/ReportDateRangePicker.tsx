"use client";

import { CalendarRange, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Props = {
  from: string;
  to: string;
  todayStr: string;
  rangeError: string | null;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onReset: () => void;
};

export function ReportDateRangePicker({
  from,
  to,
  todayStr,
  rangeError,
  onFromChange,
  onToChange,
  onReset,
}: Props) {
  const hasCustom = rangeError === null && from && to;

  return (
    <Card className="border-border/30 bg-card p-4 shadow-ambient-sm md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-label-sm font-medium text-on-surface-variant">
            <CalendarRange className="h-4 w-4 text-primary" />
            Periode laporan
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="report-from" className="sr-only">
                Dari
              </label>
              <Input
                id="report-from"
                type="date"
                aria-label="Tanggal mulai"
                value={from}
                max={todayStr}
                onChange={(e) => onFromChange(e.target.value)}
                className="h-9 w-37 border-border bg-background text-label-md md:w-40"
              />
              <span className="text-label-sm text-on-surface-variant">—</span>
              <label htmlFor="report-to" className="sr-only">
                Sampai
              </label>
              <Input
                id="report-to"
                type="date"
                aria-label="Tanggal selesai"
                value={to}
                max={todayStr}
                onChange={(e) => onToChange(e.target.value)}
                className="h-9 w-37 border-border bg-background text-label-md md:w-40"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={onReset} className="w-fit shrink-0">
              <RotateCcw className="h-3.5 w-3.5" />
              Bulan ini
            </Button>
          </div>
          <p className="text-label-sm text-on-surface-variant">
            Maksimal 3 tahun. Deposit tidak dihitung sebagai pendapatan sewa, tetap masuk di arus
            kas.
          </p>
        </div>

        <div className="hidden md:block">
          <p className="text-right text-label-sm text-on-surface-variant">
            {hasCustom ? "Rentang aktif" : "Menampilkan"}
          </p>
          <p className="text-right text-label-md font-semibold text-on-surface">
            {from && to ? `${from} → ${to}` : "—"}
          </p>
        </div>
      </div>

      {rangeError && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-label-sm text-destructive"
        >
          {rangeError}
        </p>
      )}
    </Card>
  );
}
