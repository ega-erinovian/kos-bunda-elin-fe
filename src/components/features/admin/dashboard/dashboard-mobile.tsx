"use client";

import {
  AlertCircle,
  AlertTriangle,
  CalendarCheck,
  DoorOpen,
  Send,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { useDashboardSummary } from "@/hooks/api/use-dashboard-summary";
import { formatCurrency } from "@/lib/utils";
import { MobileMetricCard } from "./metric-card";
import { QuickActionsMobile } from "./quick-actions";

export function DashboardMobile() {
  const { data, isLoading, isError } = useDashboardSummary();
  const summary = data?.data;

  const finance = summary?.finance;
  const notifications = summary?.notifications;

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

  const remindersValue = isLoading
    ? "…"
    : isError || !notifications
      ? "—"
      : String(notifications.remindersSentToday);

  const failedValue = isLoading
    ? "…"
    : isError || !notifications
      ? "—"
      : String(notifications.failedMessagesCount);

  return (
    <div className="space-y-8 md:hidden">
      <PageHeader greeting="Halo, Admin" title="Ringkasan Hari Ini" />

      <section className="grid grid-cols-2 gap-4">
        <MobileMetricCard
          label="Total Kamar"
          value="20"
          icon={DoorOpen}
          className="bg-card text-card-foreground"
          iconWrapper="bg-primary/10 text-primary"
        />
        <MobileMetricCard
          label="Terisi"
          value="18"
          icon={Users}
          className="bg-primary text-primary-foreground"
          iconWrapper="bg-white/20 text-primary-foreground"
          accent
        />
        <MobileMetricCard
          label="Jatuh Tempo"
          value="3"
          icon={CalendarCheck}
          className="bg-secondary text-secondary-foreground"
          iconWrapper="bg-white/40 text-secondary-foreground"
        />
        <MobileMetricCard
          label="Menunggak"
          value="1"
          icon={AlertTriangle}
          className="bg-destructive/10 text-destructive"
          iconWrapper="bg-white/40 text-destructive"
        />
      </section>

      <section className="grid grid-cols-2 gap-4">
        <MobileMetricCard
          label="Pengingat Hari Ini"
          value={remindersValue}
          icon={Send}
          className="bg-card text-card-foreground"
          iconWrapper="bg-primary/10 text-primary"
          valueClassName="text-heading-lg"
        />
        <Link
          href="/admin/notifications/log?status=FAILED"
          aria-label="Lihat pesan gagal"
          className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MobileMetricCard
            label="Pesan Gagal"
            value={failedValue}
            icon={AlertCircle}
            className="bg-destructive/10 text-destructive"
            iconWrapper="bg-white/40 text-destructive"
            valueClassName="text-heading-lg"
          />
        </Link>
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

      <QuickActionsMobile />
    </div>
  );
}
