"use client";

import { AlertTriangle, CalendarCheck, DoorOpen, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { MobileMetricCard } from "./metric-card";
import { QuickActionsMobile } from "./quick-actions";

export function DashboardMobile() {
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

      <QuickActionsMobile />
    </div>
  );
}
