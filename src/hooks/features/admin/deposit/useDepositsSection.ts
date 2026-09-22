"use client";

import { useMemo, useState } from "react";
import { useDeposits } from "@/hooks/api/use-deposits";
import { useTenants } from "@/hooks/api/use-tenants";
import type { DepositListParams, Deposit } from "@/types";

export function useDepositsSection() {
  const [penyewaId, setPenyewaId] = useState("semua");
  const [status, setStatus] = useState("semua");

  const query = useMemo<DepositListParams>(() => {
    const p: DepositListParams = {};
    if (penyewaId !== "semua") p.penyewaId = penyewaId;
    if (status !== "semua") p.status = status as DepositListParams["status"];
    return p;
  }, [penyewaId, status]);

  const { data, isLoading, isError, refetch } = useDeposits(query);
  const deposits: Deposit[] = data?.data ?? [];

  const { data: tenantsRes } = useTenants({ limit: 100 });
  const tenants = useMemo(() => tenantsRes?.data ?? [], [tenantsRes]);

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [deductTarget, setDeductTarget] = useState<Deposit | null>(null);
  const [refundTarget, setRefundTarget] = useState<Deposit | null>(null);

  function getTenantName(id: string) {
    return tenants.find((t) => t.id === id)?.nama ?? id.slice(0, 8);
  }

  function handlePenyewaChange(v: string) {
    setPenyewaId(v);
  }
  function handleStatusChange(v: string) {
    setStatus(v);
  }
  function handleReset() {
    setPenyewaId("semua");
    setStatus("semua");
  }

  const hasActiveFilters = penyewaId !== "semua" || status !== "semua";

  return {
    penyewaId,
    status,
    deposits,
    tenants,
    isLoading,
    isError,
    refetch,
    receiveOpen,
    setReceiveOpen,
    deductTarget,
    setDeductTarget,
    refundTarget,
    setRefundTarget,
    getTenantName,
    handlePenyewaChange,
    handleStatusChange,
    handleReset,
    hasActiveFilters,
  };
}
