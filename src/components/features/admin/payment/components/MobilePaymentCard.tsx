"use client";

import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "../StatusBadge";
import { PaymentRowDropdown } from "./PaymentRowDropdown";
import type { Payment } from "../types";

type MobilePaymentCardProps = {
  payment: Payment;
  totalDibayar?: number;
  onEdit?: (payment: Payment) => void;
};

export function MobilePaymentCard({ payment, totalDibayar = 0, onEdit }: MobilePaymentCardProps) {
  const isPartial =
    payment.status === "partial" && totalDibayar > 0 && totalDibayar < payment.amount;

  return (
    <article className="rounded-xl border bg-surface-container-lowest p-lg shadow-ambient-md transition-all border-secondary">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-[18px] font-semibold text-on-surface">{payment.name}</p>
          <p className="text-label-md text-on-surface-variant">Kamar {payment.room}</p>
        </div>
        <div className="flex items-center gap-1">
          <StatusBadge
            status={
              payment.status === "overdue"
                ? "TERLAMBAT"
                : payment.status === "paid"
                  ? "LUNAS"
                  : payment.status === "partial"
                    ? "SEBAGIAN"
                    : "BELUM_BAYAR"
            }
          />
          <PaymentRowDropdown payment={payment} onEdit={onEdit} />
        </div>
      </div>
      <p className="text-sm font-medium text-secondary-foreground">{payment.dueDate}</p>
      <div className="mt-4 flex items-end justify-end">
        <div className="text-right">
          <p className="mb-1 text-label-sm text-on-surface-variant">
            {isPartial ? "Sisa Tagihan" : "Jumlah"}
          </p>
          <p className="text-[20px] font-bold text-primary">
            {isPartial
              ? formatCurrency(payment.amount - totalDibayar)
              : formatCurrency(payment.amount)}
          </p>
          {isPartial && (
            <p className="text-label-xs text-on-surface-variant">
              {formatCurrency(totalDibayar)} / {formatCurrency(payment.amount)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
