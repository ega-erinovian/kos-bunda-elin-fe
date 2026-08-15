import { formatCurrency } from "@/lib/utils";
import type { Payment } from "../types";

type MobilePaymentCardProps = {
  payment: Payment;
};

export function MobilePaymentCard({ payment }: MobilePaymentCardProps) {
  return (
    <article className="rounded-xl border border-transparent bg-surface-container-lowest p-lg shadow-ambient-md transition-all hover:border-secondary">
      <div className="mb-sm flex items-start justify-between">
        <div>
          <p className="text-[18px] font-semibold text-on-surface">{payment.name}</p>
          <p className="text-label-md text-on-surface-variant">Kamar {payment.room}</p>
        </div>
        <span className="rounded-full bg-tertiary-fixed px-3 py-1 text-label-sm text-on-tertiary-fixed-variant">
          {payment.status === "pending" ? "Pending" : "Overdue"}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="mb-1 text-label-sm text-on-surface-variant">Jatuh Tempo</p>
          <p className="text-body-md font-medium text-on-surface">{payment.dueDate}</p>
        </div>
        <div className="text-right">
          <p className="mb-1 text-label-sm text-on-surface-variant">Jumlah</p>
          <p className="text-[20px] font-bold text-primary">{formatCurrency(payment.amount)}</p>
        </div>
      </div>
    </article>
  );
}
