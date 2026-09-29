"use client";

import { PageHeader } from "@/components/ui/page-header";
import { CalendarDays, TrendingUp, Wallet } from "lucide-react";
import { useDashboardSummary } from "@/hooks/api/use-dashboard-summary";
import { formatCurrency } from "@/lib/utils";
import { ActivityFeedDesktop } from "./activity-feed";
import { metrics } from "./consts";
import { DesktopMetricCard } from "./metric-card";
import { QuickActionMenu } from "./quick-action-menu";

export function DashboardDesktop() {
  const { data, isLoading, isError } = useDashboardSummary();
  const summary = data?.data;
  const finance = summary?.finance;

  const receivablesValue = isLoading
    ? "…"
    : isError || !finance
      ? "—"
      : formatCurrency(finance.totalReceivables);

  const netIncomeValue = isLoading
    ? "…"
    : isError || !finance
      ? "—"
      : formatCurrency(finance.netOperatingIncomeThisMonth);

  return (
    <div className="hidden md:block space-y-8">
      <PageHeader
        title="Halo, Admin"
        subtitle={
          <p className="flex items-center gap-1 text-body-md text-on-surface-variant">
            <CalendarDays className="h-4 w-4" />
            Senin, 23 Okt 2023
          </p>
        }
      >
        <QuickActionMenu />
      </PageHeader>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {metrics.map((m) => (
          <DesktopMetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            sub={m.sub}
            icon={m.icon}
            iconWrapper={m.iconWrapper}
            decorColor={m.decorColor}
            progress={m.progress}
            danger={m.danger}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DesktopMetricCard
          label="Total Piutang"
          value={receivablesValue}
          icon={Wallet}
          iconWrapper="bg-secondary-container text-on-secondary-container"
          decorColor="bg-primary-container/10"
        />
        <DesktopMetricCard
          label="Laba Bersih Bulan Ini"
          value={netIncomeValue}
          icon={TrendingUp}
          iconWrapper="bg-primary/10 text-primary"
          decorColor="bg-tertiary-fixed-dim/20"
        />
      </section>

      <ActivityFeedDesktop />
    </div>
  );
}
