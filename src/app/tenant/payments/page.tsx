"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentHistoryTable } from "@/components/features/tenant/payment-history-table";

export default function TenantPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Riwayat Pembayaran</h2>
        <p className="text-sm text-slate-500 mt-1">
          Daftar pembayaran kos Anda sebelumnya.
        </p>
      </div>
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
