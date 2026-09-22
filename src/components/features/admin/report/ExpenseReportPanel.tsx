"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useFinanceCategories } from "@/hooks/api/use-finance-categories";
import type { ExpenseReport } from "@/types";

type Props = {
  data: ExpenseReport | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

function Skeleton() {
  return (
    <div className="space-y-4">
      <Card className="animate-pulse p-6">
        <div className="h-6 w-32 rounded bg-surface-container-highest" />
      </Card>
      <Card className="animate-pulse p-6">
        <div className="h-64 rounded bg-surface-container-highest" />
      </Card>
    </div>
  );
}

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { month: string; amount: number } }[];
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-ambient-md">
      <p className="text-label-md font-semibold text-on-surface">{row.month}</p>
      <p className="text-label-sm text-on-surface-variant">{formatCurrency(row.amount)}</p>
    </div>
  );
}

export function ExpenseReportPanel({ data, isLoading, isError, onRetry }: Props) {
  const { data: expCats = [] } = useFinanceCategories("EXPENSE");
  const catNameMap = new Map(expCats.map((c) => [c.id, c.name] as const));

  if (isLoading) return <Skeleton />;
  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-label-md text-destructive">Gagal memuat laporan beban</p>
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

  return (
    <div className="space-y-4">
      <Card className="border-border/30 bg-card shadow-ambient-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-label-md font-medium text-on-surface-variant">
            Total beban
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-heading-md text-on-surface">
            {formatCurrency(data.totalExpenses)}
          </p>
          <p className="mt-1 text-label-sm text-on-surface-variant">
            Tidak termasuk refund deposit (DEPOSIT_REFUND)
          </p>
        </CardContent>
      </Card>

      {/* byCategory */}
      <Card className="border-border/30 bg-card shadow-ambient-sm">
        <CardHeader>
          <CardTitle className="text-label-md font-semibold text-on-surface">
            Rincian per kategori
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.byCategory.length === 0 ? (
            <p className="px-6 pb-6 text-body-md text-on-surface-variant">
              Tidak ada beban di rentang ini.
            </p>
          ) : (
            <>
              {/* Mobile stacked */}
              <div className="space-y-2 px-4 pb-4 md:hidden">
                {data.byCategory.map((row) => (
                  <div
                    key={row.categoryId}
                    className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3"
                  >
                    <span className="text-label-md text-on-surface">
                      {catNameMap.get(row.categoryId) ?? row.categoryId.slice(0, 8)}
                    </span>
                    <span className="font-heading text-label-md font-semibold text-on-surface">
                      {formatCurrency(row.amount)}
                    </span>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden overflow-hidden md:block">
                <div className="divide-y divide-border/30">
                  {data.byCategory.map((row) => (
                    <div
                      key={row.categoryId}
                      className="flex items-center justify-between px-6 py-3"
                    >
                      <span className="text-label-md text-on-surface-variant">
                        {catNameMap.get(row.categoryId) ?? row.categoryId.slice(0, 8)}
                      </span>
                      <span className="font-heading text-label-md font-semibold text-on-surface">
                        {formatCurrency(row.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Trend — optional, BE may omit before enrichment */}
      {data.trend && data.trend.length > 0 && (
        <Card className="border-border/30 bg-card p-6 shadow-ambient-sm">
          <p className="text-label-md font-semibold text-on-surface">Tren beban bulanan</p>
          <p className="text-label-sm text-on-surface-variant">
            Total beban per bulan (dibucket YYYY-MM, nol bila kosong)
          </p>
          <div className="mt-4 h-65 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={data.trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-border)"
                  opacity={0.4}
                />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  width={64}
                  tickFormatter={(v: number) =>
                    new Intl.NumberFormat("id-ID", { notation: "compact" }).format(v)
                  }
                />
                <Tooltip
                  content={<TrendTooltip />}
                  cursor={{ fill: "var(--color-surface-container)" }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
