"use client";

import { RentInfoCard } from "@/components/features/tenant/rent-info-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PushNotificationManager } from "@/components/features/pwa/push-notification-manager";
import { usePayments } from "@/hooks/api/use-payments";
import { useAuth } from "@/providers/auth-provider";
import { getMonthName } from "@/lib/utils";
import { Bell } from "lucide-react";

export default function TenantDashboardPage() {
  const { user } = useAuth();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const paymentsQuery = usePayments({
    penyewaId: user?.id,
    periodeBulan: currentMonth,
    periodeTahun: currentYear,
  });

  const currentPayment = paymentsQuery?.data?.data?.[0];

  const getDueDate = (dueDateStr?: string) => {
    if (!dueDateStr) return 10;
    const date = new Date(dueDateStr);
    return date.getDate();
  };

  const getStatus = (status?: string) => {
    if (status === "LUNAS") return "paid";
    if (status === "TERLAMBAT") return "overdue";
    return "active";
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Tagihan Saya" subtitle="Informasi tagihan kos Anda." />

      {paymentsQuery?.isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500 text-center">Memuat data tagihan...</p>
          </CardContent>
        </Card>
      ) : (
        <RentInfoCard
          roomNumber={currentPayment?.penyewa.kamar.nomor}
          price={currentPayment?.nominal || 0}
          dueDate={getDueDate(currentPayment?.tanggalJatuhTempo)}
          status={getStatus(currentPayment?.status)}
          month={
            currentPayment
              ? `${getMonthName(currentPayment.periodeBulan)} ${currentPayment.periodeTahun}`
              : undefined
          }
        />
      )}

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
