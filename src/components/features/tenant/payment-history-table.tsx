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
import type { Payment } from "@/types";

interface PaymentHistoryTableProps {
  payments: Payment[];
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    paid: { label: "Lunas", variant: "default" },
    pending: { label: "Menunggu", variant: "secondary" },
    late: { label: "Terlambat", variant: "destructive" },
    partial: { label: "Sebagian", variant: "outline" },
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-500">
        Belum ada riwayat pembayaran.
      </div>
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
          const s = statusMap[payment.status] || statusMap.pending;
          return (
            <TableRow key={payment.id}>
              <TableCell>
                {getMonthName(payment.month)} {payment.year}
              </TableCell>
              <TableCell>{formatCurrency(payment.amount)}</TableCell>
              <TableCell>
                <Badge variant={s.variant}>{s.label}</Badge>
              </TableCell>
              <TableCell className="text-slate-500">
                {payment.paidAt ? formatDate(payment.paidAt) : "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
