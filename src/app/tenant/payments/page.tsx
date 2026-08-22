"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PaymentHistoryTable } from "@/components/features/tenant/payment-history-table";
import { usePayments } from "@/hooks/api/use-payments";
import { useAuth } from "@/providers/auth-provider";

export default function TenantPaymentsPage() {
  const { user } = useAuth();
  const {
    data: payments,
    isLoading,
    error,
  } = usePayments({
    penyewaId: user?.id,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Riwayat Pembayaran" subtitle="Daftar pembayaran kos Anda sebelumnya." />
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Riwayat</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500 text-center py-8">Memuat riwayat pembayaran...</p>
          ) : error ? (
            <p className="text-sm text-destructive text-center py-8">
              Gagal memuat riwayat pembayaran.
            </p>
          ) : (
            <PaymentHistoryTable payments={payments?.data || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
