import type { FinancialTransaction } from "@/types";

export function isReversed(tx: FinancialTransaction): boolean {
  return (tx.description ?? "").includes("Reversed by");
}
