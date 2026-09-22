"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useFinanceCategories } from "@/hooks/api/use-finance-categories";
import type { FinancialTransaction } from "@/types";

type Props = {
  data: FinancialTransaction[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  typeFilter: string;
  categoryFilter: string;
  onTypeChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
};

function Skeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse p-4">
          <div className="h-4 w-32 rounded bg-surface-container-highest" />
        </Card>
      ))}
    </div>
  );
}

export function TransactionsReportPanel({
  data,
  isLoading,
  isError,
  onRetry,
  typeFilter,
  categoryFilter,
  onTypeChange,
  onCategoryChange,
}: Props) {
  const { data: incomeCats = [] } = useFinanceCategories("INCOME");
  const { data: expenseCats = [] } = useFinanceCategories("EXPENSE");
  const allCats = [...incomeCats, ...expenseCats];
  const catMap = new Map(allCats.map((c) => [c.id, c.name] as const));

  const hasActive = typeFilter !== "semua" || categoryFilter !== "semua";

  if (isLoading) return <Skeleton />;
  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-label-md text-destructive">Gagal memuat transaksi</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Coba lagi
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={typeFilter} onValueChange={(v) => v && onTypeChange(v)}>
          <SelectTrigger className="w-36 border-border bg-background">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua tipe</SelectItem>
            <SelectItem value="INCOME">Pemasukan</SelectItem>
            <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => v && onCategoryChange(v)}>
          <SelectTrigger className="w-44 border-border bg-background">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua kategori</SelectItem>
            {allCats.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onTypeChange("semua");
              onCategoryChange("semua");
            }}
          >
            Reset
          </Button>
        )}

        <span className="ml-auto text-label-sm text-on-surface-variant">{data.length} baris</span>
      </div>

      {data.length === 0 ? (
        <Card className="p-8 text-center text-body-md text-on-surface-variant">
          Tidak ada transaksi di rentang ini.
        </Card>
      ) : (
        <>
          {/* Mobile */}
          <div className="space-y-3 md:hidden">
            {data.map((tx) => (
              <Card key={tx.id} className="border-border/30 bg-card p-4 shadow-ambient-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label-md font-medium text-on-surface">
                      {catMap.get(tx.categoryId) ?? tx.categoryId.slice(0, 8)}
                    </p>
                    <p className="mt-0.5 text-label-sm text-on-surface-variant">
                      {formatDate(tx.transactionDate)}
                    </p>
                    {tx.description && (
                      <p className="mt-1 line-clamp-2 text-label-sm text-on-surface-variant">
                        {tx.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-label-sm font-semibold ${tx.type === "INCOME" ? "bg-primary/10 text-primary" : "bg-error-container text-on-error-container"}`}
                  >
                    {tx.type === "INCOME" ? "+" : "−"} {formatCurrency(tx.amount)}
                  </span>
                </div>
                <p className="mt-2 text-label-sm text-on-surface-variant">
                  {tx.source} {tx.referenceNumber ? `· ${tx.referenceNumber}` : ""}
                </p>
              </Card>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-3xl border border-border/30 bg-card shadow-ambient-md md:block">
            <div className="divide-y divide-border/30">
              {data.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label-md font-medium text-on-surface">
                      {catMap.get(tx.categoryId) ?? tx.categoryId.slice(0, 8)}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      {formatDate(tx.transactionDate)} · {tx.source}{" "}
                      {tx.referenceNumber ? `· ${tx.referenceNumber}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-label-md font-semibold ${tx.type === "INCOME" ? "bg-primary/10 text-primary" : "bg-error-container text-on-error-container"}`}
                  >
                    {tx.type === "INCOME" ? "+" : "−"} {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
