"use client";

import {
  Line,
  LineChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardReport } from "@/types";

type Props = {
  data: DashboardReport | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse p-6">
            <div className="h-4 w-24 rounded bg-surface-container-highest" />
            <div className="mt-3 h-6 w-32 rounded bg-surface-container-highest" />
          </Card>
        ))}
      </div>
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
  payload?: { payload: { month: string; billedRevenue: number; cashRevenue: number } }[];
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-ambient-md">
      <p className="text-label-md font-semibold text-on-surface">{row.month}</p>
      <p className="text-label-sm text-on-surface-variant">
        Tagihan {formatCurrency(row.billedRevenue)}
      </p>
      <p className="text-label-sm text-on-surface-variant">
        Tunai {formatCurrency(row.cashRevenue)}
      </p>
    </div>
  );
}

function ExpenseTrendTooltip({
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

export function ReportsDashboardPanel({ data, isLoading, isError, onRetry }: Props) {
  if (isLoading) return <Skeleton />;
  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-label-md text-destructive">Gagal memuat dasbor laporan</p>
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
        Pilih rentang tanggal untuk melihat dasbor.
      </Card>
    );

  const { revenue, expenses, cashFlow } = data;

  return (
    <div className="space-y-6">
      {/* Top metrics — reuse MetricCard visual language without importing it directly (lighter) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/30 bg-card shadow-ambient-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-label-sm font-medium uppercase tracking-widest text-on-surface-variant">
              Pendapatan (cash)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-heading-md text-on-surface">
              {formatCurrency(revenue.cashRevenue)}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">
              Tagihan {formatCurrency(revenue.billedRevenue)} · koleksi{" "}
              {(revenue.collectionRate * 100).toFixed(1)}%
            </p>
            {revenue.otherIncome !== undefined && (
              <p className="mt-1 text-label-sm text-on-surface-variant">
                Lain-lain {formatCurrency(revenue.otherIncome)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-card shadow-ambient-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-label-sm font-medium uppercase tracking-widest text-on-surface-variant">
              Beban
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-heading-md text-on-surface">
              {formatCurrency(expenses.totalExpenses)}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">
              {expenses.byCategory.length} kategori
            </p>
          </CardContent>
        </Card>

        <Card
          className={`border shadow-ambient-sm ${cashFlow.net >= 0 ? "border-primary/20 bg-primary/5" : "border-destructive/20 bg-destructive/5"}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-label-sm font-medium uppercase tracking-widest text-on-surface-variant">
              Arus bersih
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`font-heading text-heading-md ${cashFlow.net >= 0 ? "text-primary" : "text-destructive"}`}
            >
              {formatCurrency(cashFlow.net)}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">
              Masuk {formatCurrency(cashFlow.inflow)} · Keluar {formatCurrency(cashFlow.outflow)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/30 bg-card p-5 shadow-ambient-sm">
          <p className="text-label-sm font-medium uppercase tracking-widest text-on-surface-variant">
            Okupansi
          </p>
          <p className="mt-2 font-heading text-heading-md text-on-surface">
            {(data.occupancyRate * 100).toFixed(0)}%
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-highest">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${data.occupancyRate * 100}%` }}
            />
          </div>
          <p className="mt-2 text-label-sm text-on-surface-variant">Terisi / total aktif</p>
        </Card>

        <Card className="border-border/30 bg-card p-5 shadow-ambient-sm">
          <p className="text-label-sm font-medium uppercase tracking-widest text-on-surface-variant">
            Tunggakan sewa
          </p>
          <p className="mt-2 font-heading text-heading-md text-on-surface">
            {data.overdueRent !== undefined ? formatCurrency(data.overdueRent) : "—"}
          </p>
          <p className="mt-2 text-label-sm text-on-surface-variant">
            {data.overdueRent !== undefined
              ? "Sisa tagihan jatuh tempo < akhir rentang, belum lunas"
              : "Tidak ada data untuk rentang ini"}
          </p>
        </Card>
      </div>

      {/* Revenue trend — optional */}
      {data.revenueTrend && data.revenueTrend.length > 0 && (
        <Card className="border-border/30 bg-card p-6 shadow-ambient-sm">
          <p className="text-label-md font-semibold text-on-surface">Tren pendapatan bulanan</p>
          <p className="text-label-sm text-on-surface-variant">Tagihan vs tunai per bulan</p>
          <div className="mt-4 h-65 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart
                data={data.revenueTrend}
                margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-border)"
                  opacity={0.35}
                />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={64}
                  tickFormatter={(v: number) =>
                    new Intl.NumberFormat("id-ID", { notation: "compact" }).format(v)
                  }
                />
                <Tooltip content={<TrendTooltip />} />
                <Line
                  type="monotone"
                  dataKey="billedRevenue"
                  stroke="var(--color-outline)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="cashRevenue"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex gap-4 text-label-sm">
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="h-2 w-2 rounded-full bg-(--color-outline)" /> Tagihan
            </span>
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="h-2 w-2 rounded-full bg-primary" /> Tunai
            </span>
          </div>
        </Card>
      )}

      {/* Expense trend from dashboard's expenses.trend */}
      {data.expenses.trend && data.expenses.trend.length > 0 && (
        <Card className="border-border/30 bg-card p-6 shadow-ambient-sm">
          <p className="text-label-md font-semibold text-on-surface">Tren beban bulanan</p>
          <div className="mt-4 h-55 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart
                data={data.expenses.trend}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-border)"
                  opacity={0.35}
                />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={64}
                  tickFormatter={(v: number) =>
                    new Intl.NumberFormat("id-ID", { notation: "compact" }).format(v)
                  }
                />
                <Tooltip
                  content={<ExpenseTrendTooltip />}
                  cursor={{ fill: "var(--color-surface-container)" }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="var(--color-tertiary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
