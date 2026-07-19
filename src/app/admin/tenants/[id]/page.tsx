"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function TenantDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <PageHeader title="Detail Penghuni" subtitle={`Penghuni #${id}`} backHref="/admin/tenants" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Penghuni</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Data penghuni akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
