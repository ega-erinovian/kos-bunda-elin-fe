"use client";

import { AlertTriangle, CalendarCheck, DoorOpen, TrendingUp, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { useDashboardSummary } from "@/hooks/api/use-dashboard-summary";
import { formatCurrency } from "@/lib/utils";
import { MobileMetricCard } from "./metric-card";
import { ActivityFeedMobile } from "./activity-feed";
import { QuickActionMenu } from "./quick-action-menu";

export function DashboardMobile() {
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

  return (
    <div className="space-y-8 md:hidden">
      <section className="space-y-4">
        <h3 className="font-bold text-heading-sm">Aksi Cepat</h3>
        <QuickActionMenu />
      </section>

      <PageHeader greeting="Halo, Admin" title="Ringkasan Hari Ini" />

      <section className="grid grid-cols-2 gap-4">
        <MobileMetricCard
          label="Total Kamar"
          value={stat(kamar?.total)}
          icon={DoorOpen}
          className="bg-card text-card-foreground"
          iconWrapper="bg-primary/10 text-primary"
        />
        <MobileMetricCard
          label="Terisi"
          value={stat(kamar?.terisi)}
          icon={Users}
          className="bg-primary text-primary-foreground"
          iconWrapper="bg-white/20 text-primary-foreground"
          accent
        />
        <MobileMetricCard
          label="Jatuh Tempo"
          value={stat(pendingCount)}
          icon={CalendarCheck}
          className="bg-secondary text-secondary-foreground"
          iconWrapper="bg-white/40 text-secondary-foreground"
        />
        <MobileMetricCard
          label="Menunggak"
          value={stat(pembayaran?.terlambat)}
          icon={AlertTriangle}
          className="bg-destructive/10 text-destructive"
          iconWrapper="bg-white/40 text-destructive"
        />
      </section>

      <section className="grid gap-4">
        <MobileMetricCard
          label="Total Piutang"
          value={receivablesValue}
          icon={Wallet}
          className="bg-card text-card-foreground"
          iconWrapper="bg-primary/10 text-primary"
          valueClassName="text-heading-lg"
        />
        <MobileMetricCard
          label="Laba Bersih Bulan Ini"
          value={netIncomeValue}
          icon={TrendingUp}
          className="bg-primary text-primary-foreground"
          iconWrapper="bg-white/20 text-primary-foreground"
          accent
          valueClassName="text-heading-lg"
        />
      </section>
      <ActivityFeedMobile />
    </div>
  );
}
