import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "../StatusBadge";
import type { Payment } from "../types";

type MobilePaymentCardProps = {
  payment: Payment;
  totalDibayar?: number;
};

export function MobilePaymentCard({ payment, totalDibayar = 0 }: MobilePaymentCardProps) {
  const isPartial =
    payment.status === "partial" && totalDibayar > 0 && totalDibayar < payment.amount;

  return (
    <article className="rounded-xl border border-transparent bg-surface-container-lowest p-lg shadow-ambient-md transition-all hover:border-secondary">
      <div className="mb-sm flex items-start justify-between">
        <div>
          <p className="text-[18px] font-semibold text-on-surface">{payment.name}</p>
          <p className="text-label-md text-on-surface-variant">Kamar {payment.room}</p>
        </div>
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
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="mb-1 text-label-sm text-on-surface-variant">Jatuh Tempo</p>
          <p className="text-body-md font-medium text-on-surface">{payment.dueDate}</p>
        </div>
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
