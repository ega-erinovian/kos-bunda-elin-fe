"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { depositStatusBadgeClass, depositStatusLabel } from "../mappers";
import type { DepositStatus } from "@/types";

export function DepositStatusBadge({ status }: { status: DepositStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-label-sm text-wrap! max-w-28 h-full",
        depositStatusBadgeClass(status),
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {depositStatusLabel(status)}
    </Badge>
  );
}
