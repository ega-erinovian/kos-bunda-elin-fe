"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RoomDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/rooms">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Detail Kamar</h2>
          <p className="text-sm text-slate-500 mt-1">Kamar #{id}</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Kamar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Data kamar akan ditampilkan di sini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
