"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Home, Calendar, Clock } from "lucide-react";

interface RentInfoCardProps {
  roomNumber?: string;
  price: number;
  dueDate: number;
  status: "active" | "overdue" | "paid";
  month?: string;
}

export function RentInfoCard({ roomNumber, price, dueDate, status, month }: RentInfoCardProps) {
  const statusMap: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    active: { label: "Aktif", variant: "default" },
    overdue: { label: "Terlambat", variant: "destructive" },
    paid: { label: "Lunas", variant: "default" },
  };

  const s = statusMap[status] || statusMap.active;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Info Tagihan</CardTitle>
        <Badge variant={s.variant}>{s.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Home className="h-4 w-4 text-slate-500" />
          <span>Kamar {roomNumber || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span>{month || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-slate-500" />
          <span>Jatuh tempo tgl {dueDate}</span>
        </div>
        <p className="text-2xl font-bold">{formatCurrency(price)}</p>
      </CardContent>
    </Card>
  );
}
