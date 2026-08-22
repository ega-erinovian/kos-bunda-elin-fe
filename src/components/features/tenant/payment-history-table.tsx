"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getMonthName } from "@/lib/utils";
import type { Payment, PaymentStatus } from "@/types";

interface PaymentHistoryTableProps {
  payments: Payment[];
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  const statusMap: Record<
    PaymentStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    LUNAS: { label: "Lunas", variant: "default" },
    BELUM_BAYAR: { label: "Belum Bayar", variant: "secondary" },
    TERLAMBAT: { label: "Terlambat", variant: "destructive" },
    SEBAGIAN: { label: "Sebagian", variant: "outline" },
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-500">Belum ada riwayat pembayaran.</div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Periode</TableHead>
          <TableHead>Jumlah</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tanggal Bayar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => {
          const s = statusMap[payment.status];
          return (
            <TableRow key={payment.id}>
              <TableCell>
                {getMonthName(payment.periodeBulan)} {payment.periodeTahun}
              </TableCell>
              <TableCell>{formatCurrency(payment.nominal)}</TableCell>
              <TableCell>
                <Badge variant={s.variant}>{s.label}</Badge>
              </TableCell>
              <TableCell className="text-slate-500">
                {payment.tanggalBayar ? formatDate(payment.tanggalBayar) : "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}