"use client";

import { CalendarClock, Landmark, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  DesktopMetricCard,
  MobileMetricCard,
} from "@/components/features/admin/dashboard/metric-card";
import { formatCurrency } from "@/lib/utils";
import type { ReceivableSummary } from "@/types";

type Props = {
  summary: ReceivableSummary | null;
  isLoading: boolean;
};

export function ReceivablesSummaryCards({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse p-6">
            <div className="h-4 w-24 rounded bg-surface-container-highest" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:hidden">
        <MobileMetricCard
          label="Total Piutang"
          value={formatCurrency(summary?.totalOutstanding ?? 0)}
          icon={Wallet}
          iconWrapper="bg-error-container text-on-error-container"
          className="bg-card"
          accent={false}
        />
        <MobileMetricCard
          label="Periode Belum Bayar"
          value={`${summary?.unpaidPeriodCount ?? 0}`}
          icon={CalendarClock}
          iconWrapper="bg-surface-container-high text-on-surface-variant"
          className="bg-card"
          accent={false}
        />
      </div>
      <div className="hidden gap-6 md:grid md:grid-cols-3">
        <DesktopMetricCard
          label="Total Piutang"
          value={formatCurrency(summary?.totalOutstanding ?? 0)}
          icon={Wallet}
          iconWrapper="bg-error-container text-on-error-container"
          decorColor="bg-error-container/30"
          danger
        />
        <DesktopMetricCard
          label="Periode Belum Bayar"
          value={`${summary?.unpaidPeriodCount ?? 0}`}
          sub="periode"
          icon={CalendarClock}
          iconWrapper="bg-surface-container-high text-on-surface-variant"
          decorColor="bg-tertiary-fixed-dim/20"
        />
        <DesktopMetricCard
          label="Total Properti"
          value={formatCurrency(summary?.propertyTotal ?? 0)}
          icon={Landmark}
          iconWrapper="bg-secondary-container text-on-secondary-container"
          decorColor="bg-primary-container/10"
        />
      </div>
    </>
  );
}
