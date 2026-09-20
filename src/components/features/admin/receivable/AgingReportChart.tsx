"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { AGING_BUCKET_FILLS, AGING_BUCKET_LABELS } from "./constants";
import { formatCurrency } from "@/lib/utils";
import type { AgingBucket } from "@/types";

type Props = {
  buckets: AgingBucket[];
  isLoading: boolean;
};

const compactIdr = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function AgingTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: AgingBucket }[];
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-ambient-md">
      <p className="text-label-md font-semibold text-on-surface">
        {AGING_BUCKET_LABELS[row.label]}
      </p>
      <p className="text-label-sm text-on-surface-variant">
        {formatCurrency(row.outstanding)} · {row.count} periode
      </p>
    </div>
  );
}

export function AgingReportChart({ buckets, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card className="animate-pulse p-6">
        <div className="h-64 rounded bg-surface-container-highest" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-label-md font-semibold text-on-surface">Laporan Umur Piutang</h2>
      <p className="text-label-sm text-on-surface-variant">
        Sisa tagihan per kelompok keterlambatan
      </p>
      <div className="mt-4 h-[256px] w-full min-w-0" style={{ minHeight: 256 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={buckets} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={48}
              tickFormatter={(v: number) => compactIdr.format(v)}
            />
            <Tooltip
              content={<AgingTooltip />}
              cursor={{ fill: "var(--color-surface-container)" }}
            />
            <Bar dataKey="outstanding" radius={[8, 8, 0, 0]}>
              {buckets.map((b) => (
                <Cell key={b.label} fill={AGING_BUCKET_FILLS[b.label]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
