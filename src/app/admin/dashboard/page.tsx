"use client";

import { DashboardMobile } from "@/components/features/admin/dashboard/dashboard-mobile";
import { DashboardDesktop } from "@/components/features/admin/dashboard/dashboard-desktop";

export default function AdminDashboardPage() {
  return (
    <div>
      <DashboardMobile />
      <DashboardDesktop />
    </div>
  );
}
