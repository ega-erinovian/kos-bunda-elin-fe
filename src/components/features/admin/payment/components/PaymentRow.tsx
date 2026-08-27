import { StatusBadge } from "../StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { PaymentRowDropdown } from "./PaymentRowDropdown";
import type { Payment } from "../types";

type PaymentRowProps = {
  payment: Payment;
  totalDibayar?: number;
  onEdit?: (payment: Payment) => void;
};

export function PaymentRow({ payment, totalDibayar = 0, onEdit }: PaymentRowProps) {
  const isPartial =
    payment.status === "partial" && totalDibayar > 0 && totalDibayar < payment.amount;

  return (
    <div className="flex cursor-pointer items-center justify-between rounded-lg border border-outline-variant/30 p-4 transition-colors hover:bg-primary/5 group">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-label-md text-on-surface-variant">
          {payment.initials}
        </div>
        <div>
          <h4 className="text-label-md text-on-surface transition-colors group-hover:text-primary">
            {payment.name}
          </h4>
          <p className="text-label-sm text-on-surface-variant">
            Room {payment.room} &middot; {payment.dueDate}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className="text-body-md font-medium text-on-surface">
            {isPartial
              ? formatCurrency(payment.amount - totalDibayar)
              : formatCurrency(payment.amount)}
          </span>
          {isPartial && (
            <p className="text-label-xs text-on-surface-variant">
              {formatCurrency(totalDibayar)} / {formatCurrency(payment.amount)}
            </p>
          )}
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
        <PaymentRowDropdown payment={payment} onEdit={onEdit} />
      </div>
    </div>
  );
}
