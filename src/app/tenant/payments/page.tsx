"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PaymentHistoryTable } from "@/components/features/tenant/payment-history-table";

export default function TenantPaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Riwayat Pembayaran" subtitle="Daftar pembayaran kos Anda sebelumnya." />
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Riwayat</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentHistoryTable payments={[]} />
        </CardContent>
      </Card>
    </div>
  );
}
