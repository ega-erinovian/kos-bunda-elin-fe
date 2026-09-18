"use client";

import { useMemo, useState } from "react";
import { useExpenses, useReverseExpense } from "@/hooks/api/use-expenses";
import { useFinanceAccounts } from "@/hooks/api/use-finance-accounts";
import { useFinanceCategories } from "@/hooks/api/use-finance-categories";
import { useAuth } from "@/providers/auth-provider";
import { EXPENSE_PAGE_SIZE } from "@/components/features/admin/expense/constants";
import type { ExpenseListParams, FinancialTransaction } from "@/types";
import toast from "react-hot-toast";

export function useExpensesSection(pageSize: number = EXPENSE_PAGE_SIZE) {
  const { user } = useAuth();
  const isOwner = user?.adminRole === "OWNER";

  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState("semua");
  const [accountId, setAccountId] = useState("semua");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [vendorName, setVendorName] = useState("");

  const query = useMemo<ExpenseListParams>(() => {
    const p: ExpenseListParams = { page, pageSize };
    if (categoryId !== "semua") p.categoryId = categoryId;
    if (accountId !== "semua") p.accountId = accountId;
    if (from) p.from = new Date(from).toISOString();
    if (to) p.to = new Date(to).toISOString();
    if (vendorName.trim()) p.vendorName = vendorName.trim();
    return p;
  }, [page, pageSize, categoryId, accountId, from, to, vendorName]);

  const { data, isLoading, isError, refetch } = useExpenses(query);
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: expenseCats = [] } = useFinanceCategories("EXPENSE");

  const expenses: FinancialTransaction[] = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? expenses.length;

  const [createOpen, setCreateOpen] = useState(false);
  const [editTx, setEditTx] = useState<FinancialTransaction | null>(null);
  const [reverseTx, setReverseTx] = useState<FinancialTransaction | null>(null);
  const [lastReversal, setLastReversal] = useState<FinancialTransaction | null>(null);

  const reverse = useReverseExpense();

  function handlePageChange(next: number) {
    setPage(next);
  }

  function resetPage() {
    setPage(1);
  }

  function handleCategoryChange(v: string) {
    setCategoryId(v);
    resetPage();
  }

  function handleAccountChange(v: string) {
    setAccountId(v);
    resetPage();
  }

  function handleFromChange(v: string) {
    setFrom(v);
    resetPage();
  }

  function handleToChange(v: string) {
    setTo(v);
    resetPage();
  }

  function handleVendorChange(v: string) {
    setVendorName(v);
    resetPage();
  }

  function handleResetFilters() {
    setCategoryId("semua");
    setAccountId("semua");
    setFrom("");
    setTo("");
    setVendorName("");
    resetPage();
  }

  function getCatLabel(id: string) {
    return expenseCats.find((c) => c.id === id)?.code ?? id.slice(0, 8);
  }

  function getAccName(id: string) {
    return accounts.find((a) => a.id === id)?.name ?? id.slice(0, 8);
  }

  function handleReverse(reason: string) {
    if (!reverseTx) return;
    reverse.mutate(
      { id: reverseTx.id, reason },
      {
        onSuccess: (result) => {
          const rev = (result as unknown as { reversal: FinancialTransaction })?.reversal;
          setLastReversal(rev ?? null);
          toast.success("Reversal berhasil — entri penyeimbang dibuat");
          setTimeout(() => {
            setReverseTx(null);
            setLastReversal(null);
          }, 1800);
        },
        onError: (e: unknown) => {
          const msg = e instanceof Error ? e.message : "Gagal reversal";
          toast.error(msg);
        },
      },
    );
  }

  const hasActiveFilters =
    categoryId !== "semua" || accountId !== "semua" || !!from || !!to || !!vendorName;

  return {
    isOwner,
    page,
    pageSize,
    categoryId,
    accountId,
    from,
    to,
    vendorName,
    expenses,
    pagination,
    totalPages,
    total,
    isLoading,
    isError,
    refetch,
    accounts,
    expenseCats,
    createOpen,
    setCreateOpen,
    editTx,
    setEditTx,
    reverseTx,
    setReverseTx,
    lastReversal,
    setLastReversal,
    reverse,
    handlePageChange,
    resetPage,
    handleCategoryChange,
    handleAccountChange,
    handleFromChange,
    handleToChange,
    handleVendorChange,
    handleResetFilters,
    getCatLabel,
    getAccName,
    handleReverse,
    hasActiveFilters,
  };
}
