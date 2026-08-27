"use client";

import { usePaymentRecords } from "@/hooks/api/use-payment-records";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowRight, CreditCard, FileText } from "lucide-react";
import Link from "next/link";
import type { PaymentRecord } from "@/types";

interface PaymentHistoryListProps {
  pembayaranId: string;
  nominal: number;
}

export function PaymentHistoryList({ pembayaranId, nominal }: PaymentHistoryListProps) {
  const { data: records, isLoading, error } = usePaymentRecords(pembayaranId);

  if (error) {
    return (
      <Card className="border-outline-variant/30 shadow-ambient-sm">
        <CardContent className="p-6">
          <p className="text-center text-label-sm text-on-surface-variant">
            Gagal memuat riwayat pembayaran
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-outline-variant/30 shadow-ambient-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-label-sm text-on-surface-variant">Memuat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasRecords = records && records.length > 0;

  if (!hasRecords) {
    return (
      <Card className="border-outline-variant/30 shadow-ambient-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <FileText className="h-8 w-8 text-outline-variant" />
            <p className="text-label-sm text-on-surface-variant">Belum ada riwayat pembayaran</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPaid = records.reduce((sum: number, r: PaymentRecord) => sum + r.amountPaid, 0);
  const progress = nominal > 0 ? (totalPaid / nominal) * 100 : 0;

  return (
    <Card className="border-outline-variant/30 shadow-ambient-sm">
      <CardHeader>
        <div className="flex gap-2">
          <CardTitle className="text-heading-sm flex-1">Riwayat Pembayaran</CardTitle>
          <Badge variant="secondary" className="text-body-sm">
            {records.length} transaksi
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.map((record: PaymentRecord) => (
            <div
              key={record.id}
              className="flex items-center justify-between rounded-lg border border-outline-variant/30 p-4 transition-colors hover:bg-surface-container-lowest/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high">
                  {getPaymentMethodIcon(record.paymentMethod)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-label-md font-medium text-on-surface truncate">
                      {getPaymentMethodLabel(record.paymentMethod)}
                    </span>
                    {record.referenceNumber && (
                      <span className="text-label-xs text-on-surface-variant truncate">
                        {record.referenceNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-label-xs text-on-surface-variant">
                    {format(new Date(record.paymentDate), "dd MMM yyyy", {
                      locale: id,
                    })}
                    {record.createdByAdmin && (
                      <span className="ml-2">oleh {record.createdByAdmin.nama}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-body-md font-medium text-on-surface">
                    {formatCurrency(record.amountPaid)}
                  </span>
                  {record.notes && (
                    <p className="text-label-xs text-on-surface-variant truncate max-w-[120px]">
                      {record.notes}
                    </p>
                  )}
                </div>

                <Link
                  href={`/admin/finance/transactions/${record.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Navigate to transaction details once Phase 3 is complete
                  }}
                >
                  <Button size="sm" variant="outline" className="h-8 px-2">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {progress > 0 && progress < 100 && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-label-xs text-on-surface-variant">
              <span>Progress</span>
              <span>
                {formatCurrency(totalPaid)} / {formatCurrency(nominal)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getPaymentMethodIcon(method: PaymentRecord["paymentMethod"]) {
  const icons: Record<PaymentRecord["paymentMethod"], React.ReactNode> = {
    CASH: <CreditCard className="h-5 w-5" />,
    BANK_TRANSFER: <CreditCard className="h-5 w-5" />,
    QRIS: <CreditCard className="h-5 w-5" />,
    E_WALLET: <CreditCard className="h-5 w-5" />,
    OTHER: <FileText className="h-5 w-5" />,
  };
  return icons[method] || icons["CASH"];
}

function getPaymentMethodLabel(method: PaymentRecord["paymentMethod"]): string {
  const labels: Record<PaymentRecord["paymentMethod"], string> = {
    CASH: "Tunai",
    BANK_TRANSFER: "Transfer Bank",
    QRIS: "QRIS",
    E_WALLET: "E-Wallet",
    OTHER: "Lainnya",
  };
  return labels[method] || "Tunai";
}
