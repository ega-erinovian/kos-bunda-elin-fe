"use client";

import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useExpensesSection } from "@/hooks/features/admin/expense/useExpensesSection";
import { ExpenseFormDialog } from "./components/ExpenseFormDialog";
import { ReverseTransactionDialog } from "./components/ReverseTransactionDialog";
import { ExpenseCard } from "./components/ExpenseCard";
import { ExpenseFilters } from "./components/ExpenseFilters";
import { ExpenseTable } from "./components/ExpenseTable";

export function ExpensesSection() {
  const {
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
  } = useExpensesSection();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengeluaran"
        subtitle={`${total} pengeluaran · halaman ${page} dari ${totalPages}`}
      >
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Pengeluaran
        </Button>
      </PageHeader>

      {/* Mobile */}
      <div className="space-y-4 md:hidden">
        <ExpenseFilters
          categoryId={categoryId}
          accountId={accountId}
          from={from}
          to={to}
          vendorName={vendorName}
          expenseCats={expenseCats}
          accounts={accounts}
          onCategoryChange={handleCategoryChange}
          onAccountChange={handleAccountChange}
          onFromChange={handleFromChange}
          onToChange={handleToChange}
          onVendorChange={handleVendorChange}
          onReset={handleResetFilters}
          hasActive={hasActiveFilters}
        />

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse p-4">
                <div className="h-4 w-24 rounded bg-surface-container-highest" />
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-label-md text-destructive">Gagal memuat pengeluaran</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </Card>
        ) : expenses.length === 0 ? (
          <Card className="p-8 text-center text-body-md text-on-surface-variant">
            Tidak ada pengeluaran.
          </Card>
        ) : (
          <div className="space-y-3">
            {expenses.map((tx) => (
              <ExpenseCard
                key={tx.id}
                tx={tx}
                accountName={getAccName(tx.accountId)}
                categoryLabel={getCatLabel(tx.categoryId)}
                isOwner={isOwner}
                onEdit={() => setEditTx(tx)}
                onReverse={() => {
                  setLastReversal(null);
                  setReverseTx(tx);
                }}
              />
            ))}
          </div>
        )}

        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => handlePageChange(Math.max(1, page - 1))}
            >
              ‹
            </Button>
            <span className="text-label-sm text-on-surface-variant">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            >
              ›
            </Button>
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden space-y-4 md:block">
        <div className="flex flex-wrap items-center gap-3">
          <ExpenseFilters
            categoryId={categoryId}
            accountId={accountId}
            from={from}
            to={to}
            vendorName={vendorName}
            expenseCats={expenseCats}
            accounts={accounts}
            onCategoryChange={handleCategoryChange}
            onAccountChange={handleAccountChange}
            onFromChange={handleFromChange}
            onToChange={handleToChange}
            onVendorChange={handleVendorChange}
            onReset={handleResetFilters}
            hasActive={hasActiveFilters}
          />
        </div>

        <div className="overflow-hidden rounded-3xl border border-border/30 bg-card shadow-ambient-md">
          {isLoading ? (
            <div className="animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-t border-border/30 px-6 py-4">
                  <div className="h-4 w-24 rounded bg-surface-container-highest" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="border-t border-border/30 p-6 text-center text-body-md text-destructive">
              Gagal memuat
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-12 text-center text-body-md text-muted-foreground">
              Tidak ada pengeluaran.
            </div>
          ) : (
            <ExpenseTable
              expenses={expenses}
              isOwner={isOwner}
              getCatLabel={getCatLabel}
              getAccName={getAccName}
              onEdit={(tx) => setEditTx(tx)}
              onReverse={(tx) => {
                setLastReversal(null);
                setReverseTx(tx);
              }}
            />
          )}

          {pagination && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/30 px-6 py-4">
              <span className="text-sm text-muted-foreground">
                Menampilkan {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} dari{" "}
                {total}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                >
                  ‹
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                >
                  ›
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ExpenseFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ExpenseFormDialog
        open={!!editTx}
        onOpenChange={(o) => !o && setEditTx(null)}
        editing={editTx}
      />

      <ReverseTransactionDialog
        open={!!reverseTx}
        onOpenChange={(o) => !o && setReverseTx(null)}
        transaction={reverseTx}
        onConfirm={handleReverse}
        isPending={reverse.isPending}
        lastReversal={lastReversal}
      />
    </div>
  );
}
