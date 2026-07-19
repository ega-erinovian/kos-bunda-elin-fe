"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function RoomDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <PageHeader title="Detail Kamar" subtitle={`Kamar #${id}`} backHref="/admin/rooms" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Kamar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Data kamar akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
