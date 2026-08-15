import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { PaymentRowDropdown } from "./PaymentRowDropdown";
import type { Payment } from "../types";

type PaymentRowProps = {
  payment: Payment;
};

export function PaymentRow({ payment }: PaymentRowProps) {
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
        <span className="text-body-md font-medium text-on-surface">
          {formatCurrency(payment.amount)}
        </span>
        <Badge
          variant={payment.status === "overdue" ? "destructive" : "secondary"}
          className="capitalize"
        >
          {payment.status === "pending" ? "Pending" : "Overdue"}
        </Badge>
        <PaymentRowDropdown payment={payment} />
      </div>
    </div>
  );
}
