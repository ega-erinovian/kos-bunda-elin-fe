"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import {
  useFinanceTransactions,
  useDeleteFinanceTransaction,
  useUpdateFinanceTransaction,
} from "@/hooks/api/use-finance-transactions";
import { useFinanceAccounts } from "@/hooks/api/use-finance-accounts";
import { useFinanceCategories } from "@/hooks/api/use-finance-categories";
import { useReverseFinanceTransaction } from "@/hooks/api/use-expenses";
import { FINANCE_PAGE_SIZE } from "@/components/features/admin/finance/constants";
import type { FinancialTransaction, FinancialTransactionListParams } from "@/types";
import toast from "react-hot-toast";

export function useFinanceTransactionsSection(pageSize: number = FINANCE_PAGE_SIZE) {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("paymentRecordId") || searchParams.get("highlight");

  const { user } = useAuth();
  const isOwner = user?.adminRole === "OWNER";

  const [page, setPage] = useState(1);
  const [type, setType] = useState<string>("semua");
  const [accountId, setAccountId] = useState<string>("semua");
  const [categoryId, setCategoryId] = useState<string>("semua");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const query = useMemo<FinancialTransactionListParams>(() => {
    const p: FinancialTransactionListParams = { page, pageSize };
    if (type !== "semua") p.type = type as FinancialTransactionListParams["type"];
    if (accountId !== "semua") p.accountId = accountId;
    if (categoryId !== "semua") p.categoryId = categoryId;
    if (from) p.from = new Date(from).toISOString();
    if (to) p.to = new Date(to).toISOString();
    return p;
  }, [page, pageSize, type, accountId, categoryId, from, to]);

  const { data, isLoading, isError, refetch } = useFinanceTransactions(query);
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: incomeCats = [] } = useFinanceCategories("INCOME");
  const { data: expenseCats = [] } = useFinanceCategories("EXPENSE");
  const allCats = useMemo(() => [...incomeCats, ...expenseCats], [incomeCats, expenseCats]);

  const txs: FinancialTransaction[] = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? txs.length;

  const [createOpen, setCreateOpen] = useState(false);
  const [editTx, setEditTx] = useState<FinancialTransaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [reverseTx, setReverseTx] = useState<FinancialTransaction | null>(null);
  const [lastReversal, setLastReversal] = useState<FinancialTransaction | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editRef, setEditRef] = useState("");

  const del = useDeleteFinanceTransaction();
  const upd = useUpdateFinanceTransaction();
  const reverse = useReverseFinanceTransaction();

  function resetPage() {
    setPage(1);
  }

  function handlePageChange(next: number) {
    setPage(next);
  }

  function handleTypeChange(v: string) {
    setType(v);
    resetPage();
  }

  function handleAccountChange(v: string) {
    setAccountId(v);
    resetPage();
  }

  function handleCategoryChange(v: string) {
    setCategoryId(v);
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

  function handleResetFilters() {
    setType("semua");
    setAccountId("semua");
    setCategoryId("semua");
    setFrom("");
    setTo("");
    resetPage();
  }

  function getCatName(id: string) {
    return allCats.find((c) => c.id === id)?.code ?? id.slice(0, 8);
  }

  function getAccName(id: string) {
    return accounts.find((a) => a.id === id)?.name ?? id.slice(0, 8);
  }

  function openEdit(tx: FinancialTransaction) {
    setEditTx(tx);
    setEditDesc(tx.description ?? "");
    setEditRef(tx.referenceNumber ?? "");
  }

  function handleUpdate() {
    if (!editTx) return;
    upd.mutate(
      { id: editTx.id, description: editDesc || null, referenceNumber: editRef || null },
      {
        onSuccess: () => {
          toast.success("Transaksi diperbarui");
          setEditTx(null);
        },
        onError: (e: unknown) => {
          const msg = e instanceof Error ? e.message : "Gagal memperbarui";
          toast.error(msg);
        },
      },
    );
  }

  function handleDelete() {
    if (!deleteId) return;
    del.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Transaksi dihapus");
        setDeleteId(null);
      },
      onError: (e: unknown) => {
        const msg = e instanceof Error ? e.message : "Gagal menghapus";
        toast.error(msg);
      },
    });
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
    type !== "semua" || accountId !== "semua" || categoryId !== "semua" || !!from || !!to;

  return {
    highlightId,
    isOwner,
    page,
    pageSize,
    type,
    accountId,
    categoryId,
    from,
    to,
    txs,
    pagination,
    totalPages,
    total,
    isLoading,
    isError,
    refetch,
    accounts,
    allCats,
    createOpen,
    setCreateOpen,
    editTx,
    setEditTx,
    deleteId,
    setDeleteId,
    reverseTx,
    setReverseTx,
    lastReversal,
    setLastReversal,
    editDesc,
    setEditDesc,
    editRef,
    setEditRef,
    del,
    upd,
    reverse,
    handlePageChange,
    handleTypeChange,
    handleAccountChange,
    handleCategoryChange,
    handleFromChange,
    handleToChange,
    handleResetFilters,
    getCatName,
    getAccName,
    openEdit,
    handleUpdate,
    handleDelete,
    handleReverse,
    hasActiveFilters,
  };
}
