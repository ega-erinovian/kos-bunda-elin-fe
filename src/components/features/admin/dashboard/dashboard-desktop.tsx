"use client";

import { PageHeader } from "@/components/ui/page-header";
import {
  AlertTriangle,
  CalendarDays,
  DoorOpen,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useDashboardSummary } from "@/hooks/api/use-dashboard-summary";
import { formatCurrency } from "@/lib/utils";
import { ActivityFeedDesktop } from "./activity-feed";
import { DesktopMetricCard } from "./metric-card";
import { QuickActionMenu } from "./quick-action-menu";

const todayLabel = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(new Date());

export function DashboardDesktop() {
  const { data, isLoading, isError } = useDashboardSummary();
  const summary = data?.data;
  const finance = summary?.finance;
  const kamar = summary?.kamar;
  const pembayaran = summary?.pembayaran;

  const stat = (v?: number) => (isLoading ? "…" : isError || v === undefined ? "—" : String(v));

  const pendingCount = pembayaran ? pembayaran.belumBayar + pembayaran.sebagian : undefined;

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

  const terisiValue = stat(kamar?.terisi);
  const occupancyProgress =
    isLoading || isError || kamar?.occupancyRate === undefined
      ? undefined
      : Math.round(kamar.occupancyRate * 100);

  return (
    <div className="hidden md:block space-y-8">
      <PageHeader
        title="Halo, Admin"
        subtitle={
          <p className="flex items-center gap-1 text-body-md text-on-surface-variant">
            <CalendarDays className="h-4 w-4" />
            {todayLabel}
          </p>
        }
      >
        <QuickActionMenu />
      </PageHeader>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DesktopMetricCard
          label="Total Kamar"
          value={stat(kamar?.total)}
          sub={`/ ${terisiValue} Terisi`}
          icon={DoorOpen}
          iconWrapper="bg-secondary-container text-on-secondary-container"
          decorColor="bg-primary-container/10"
          progress={occupancyProgress}
        />
        <DesktopMetricCard
          label="Pembayaran Mendatang"
          value={stat(pendingCount)}
          sub="Belum Bayar"
          icon={ReceiptText}
          iconWrapper="bg-surface-container-high text-on-surface-variant"
          decorColor="bg-tertiary-fixed-dim/20"
        />
        <DesktopMetricCard
          label="Menunggak"
          value={stat(pembayaran?.terlambat)}
          sub="Menunggak"
          icon={AlertTriangle}
          iconWrapper="bg-error-container text-on-error-container"
          decorColor="bg-error-container/30"
          danger
        />
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
