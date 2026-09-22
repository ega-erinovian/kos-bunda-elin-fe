import type { Deposit, DepositStatus } from "@/types";

export function depositStatusLabel(status: DepositStatus): string {
  switch (status) {
    case "HELD":
      return "Ditahan";
    case "PARTIALLY_REFUNDED":
      return "Sebagian Kembali";
    case "REFUNDED":
      return "Dikembalikan";
    case "FORFEITED":
      return "Hangus";
  }
}

export function depositStatusBadgeClass(status: DepositStatus): string {
  switch (status) {
    case "HELD":
      return "border-border bg-surface text-on-surface-variant";
    case "PARTIALLY_REFUNDED":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "REFUNDED":
      return "border-primary/20 bg-primary text-on-primary";
    case "FORFEITED":
      return "border-destructive/20 bg-destructive/10 text-destructive";
  }
}

export function remainingOf(d: Deposit): number {
  return Math.max(0, d.amountReceived - (d.deductionAmount ?? 0) - (d.refundAmount ?? 0));
}

export function refundableOf(d: Deposit): number {
  return Math.max(0, d.amountReceived - (d.deductionAmount ?? 0) - (d.refundAmount ?? 0));
}
