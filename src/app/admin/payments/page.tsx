"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  paid: { label: "Lunas", variant: "success" },
  pending: { label: "Menunggu", variant: "warning" },
  late: { label: "Terlambat", variant: "destructive" },
  partial: { label: "Sebagian", variant: "secondary" },
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pembayaran</h2>
        <p className="text-sm text-slate-500 mt-1">
          Pantau status pembayaran penghuni.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riwayat Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Penghuni</TableHead>
                <TableHead>Kamar</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                  Belum ada data pembayaran.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
