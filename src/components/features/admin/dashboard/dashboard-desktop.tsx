"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/ui/page-header";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Megaphone,
  Plus,
  Send,
  StickyNotePlus,
  TrendingUp,
  UserPlus,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useDashboardSummary } from "@/hooks/api/use-dashboard-summary";
import { formatCurrency } from "@/lib/utils";
import { ActivityFeedDesktop } from "./activity-feed";
import { metrics } from "./consts";
import { DesktopMetricCard } from "./metric-card";

export function DashboardDesktop() {
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
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary-container px-6 py-3 text-label-md text-on-primary-container shadow-sm transition-colors hover:bg-primary/90 hover:text-white" />
            }
          >
            <Plus className="h-5 w-5" />
            New Action
            <ChevronDown className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 rounded-xl p-1">
            <DropdownMenuItem className="rounded-lg px-4 py-3 text-label-md cursor-pointer">
              <UserPlus /> Tambah Penghuni
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg px-4 py-3 text-label-md cursor-pointer">
              <StickyNotePlus /> Catat Pembayaran
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg px-4 py-3 text-label-md cursor-pointer">
              <Megaphone /> Kirim Broadcast
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
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

      <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <DesktopMetricCard
          label="Pengingat Hari Ini"
          value={remindersValue}
          icon={Send}
          iconWrapper="bg-secondary-container text-on-secondary-container"
          decorColor="bg-primary-container/10"
        />
        <Link
          href="/admin/notifications/log?status=FAILED"
          aria-label="Lihat pesan gagal"
          className="block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <DesktopMetricCard
            label="Pesan Gagal"
            value={failedValue}
            sub="perlu perhatian"
            icon={AlertCircle}
            iconWrapper="bg-error-container text-on-error-container"
            decorColor="bg-error-container/30"
            danger={!!notifications && notifications.failedMessagesCount > 0}
          />
        </Link>
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
