"use client";

import { useState } from "react";
import {
  useReceivables,
  useReceivableSummary,
  useReceivableAging,
} from "@/hooks/api/use-receivables";
import type { ReceivableByTenant, ReceivableListParams } from "@/types";

export type ReceivableSortKey = "outstanding" | "unpaidPeriods";

function todayInput(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function useReceivablesSection() {
  const [asOf, setAsOf] = useState(todayInput);
  const [sortKey, setSortKey] = useState<ReceivableSortKey>("outstanding");

  const today = todayInput();
  const isFutureAsOf = asOf > today;
  const params: ReceivableListParams = { asOf: new Date(`${asOf}T00:00:00`).toISOString() };
  const enabled = !isFutureAsOf && asOf.length > 0;

  const list = useReceivables(params, enabled);
  const summary = useReceivableSummary(params, enabled);
  const aging = useReceivableAging(params, enabled);

  const raw: ReceivableByTenant[] = list.data?.data ?? [];
  const receivables = [...raw].sort((a, b) =>
    sortKey === "outstanding" ? b.outstanding - a.outstanding : b.unpaidPeriods - a.unpaidPeriods,
  );

  const isLoading = list.isLoading || summary.isLoading || aging.isLoading;
  const isError = list.isError || summary.isError || aging.isError;

  function refetch() {
    list.refetch();
    summary.refetch();
    aging.refetch();
  }

  function handleAsOfChange(v: string) {
    setAsOf(v);
  }

  function handleResetAsOf() {
    setAsOf(todayInput());
  }

  return {
    asOf,
    today,
    isFutureAsOf,
    sortKey,
    setSortKey,
    receivables,
    summary: summary.data?.data ?? null,
    buckets: aging.data?.data.buckets ?? [],
    isLoading,
    isError,
    refetch,
    handleAsOfChange,
    handleResetAsOf,
  };
}
