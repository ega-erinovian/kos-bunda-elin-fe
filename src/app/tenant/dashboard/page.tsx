"use client";

import { RentInfoCard } from "@/components/features/tenant/rent-info-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PushNotificationManager } from "@/components/features/pwa/push-notification-manager";
import { Bell } from "lucide-react";

export default function TenantDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Tagihan Saya</h2>
        <p className="text-sm text-slate-500 mt-1">
          Informasi tagihan kos Anda.
        </p>
      </div>

      <RentInfoCard price={0} dueDate={10} status="active" />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Notifikasi</CardTitle>
          <Bell className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-3">
            Aktifkan notifikasi untuk mendapatkan pengingat pembayaran otomatis.
          </p>
          <PushNotificationManager />
        </CardContent>
      </Card>
    </div>
  );
}
