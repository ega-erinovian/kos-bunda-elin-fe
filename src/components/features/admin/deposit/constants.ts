import type { DepositStatus } from "@/types";

export const DEPOSIT_STATUS_OPTIONS: { value: DepositStatus | "semua"; label: string }[] = [
  { value: "semua", label: "Semua Status" },
  { value: "HELD", label: "Ditahan" },
  { value: "PARTIALLY_REFUNDED", label: "Sebagian Dikembalikan" },
  { value: "REFUNDED", label: "Dikembalikan" },
  { value: "FORFEITED", label: "Hangus" },
];
