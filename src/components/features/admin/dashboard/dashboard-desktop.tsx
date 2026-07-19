"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/ui/page-header";
import { CalendarDays, ChevronDown, Megaphone, Plus, StickyNotePlus, UserPlus } from "lucide-react";
import { ActivityFeedDesktop } from "./activity-feed";
import { metrics } from "./consts";
import { DesktopMetricCard } from "./metric-card";
import { PushLogsDesktop } from "./push-logs";

export function DashboardDesktop() {
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

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ActivityFeedDesktop />
        <PushLogsDesktop />
      </section>
    </div>
  );
}
