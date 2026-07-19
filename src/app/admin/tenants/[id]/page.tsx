"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TenantDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/tenants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Detail Penghuni</h2>
          <p className="text-sm text-slate-500 mt-1">Penghuni #{id}</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Penghuni</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Data penghuni akan ditampilkan di sini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
