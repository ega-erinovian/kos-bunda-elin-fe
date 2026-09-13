"use client";

import { useState } from "react";
import { Plus, Search, Wallet, Building2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFinanceAccounts } from "@/hooks/api/use-finance-accounts";
import { FinanceAccountFormDialog } from "./components/FinanceAccountFormDialog";
import { accountTypeLabel } from "./mappers";
import { formatCurrency } from "@/lib/utils";
import type { FinancialAccount } from "@/types";

export function FinanceAccountsSection() {
  const { data: accounts = [], isLoading, isError, refetch } = useFinanceAccounts();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialAccount | null>(null);
  const [q, setQ] = useState("");

  const filtered = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(q.toLowerCase()) ||
      a.type.toLowerCase().includes(q.toLowerCase()),
  );

  function handleAdd() {
    setEditing(null);
    setOpen(true);
  }
  function handleEdit(acc: FinancialAccount) {
    setEditing(acc);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Akun Keuangan" subtitle="Kelola akun untuk pencatatan transaksi.">
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Tambah Akun
        </Button>
      </PageHeader>

      {/* Mobile variant */}
      <div className="md:hidden space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            placeholder="Cari akun..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-11.5 rounded-xl border-outline-variant bg-surface-container-lowest pl-10 shadow-ambient-sm"
          />
        </div>

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
            <p className="text-label-md text-destructive">Gagal memuat akun</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border-outline-variant/30 p-8 text-center">
            <p className="text-body-md text-on-surface-variant">Tidak ada akun ditemukan.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((acc) => (
              <Card key={acc.id} variant="bordered" className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${acc.type === "BANK" ? "bg-secondary-container text-on-secondary-container" : "bg-primary/10 text-primary"}`}
                    >
                      {acc.type === "BANK" ? (
                        <Building2 className="h-5 w-5" />
                      ) : (
                        <Wallet className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-label-md font-semibold text-on-surface">{acc.name}</p>
                      <p className="text-label-sm text-on-surface-variant">
                        {accountTypeLabel(acc.type)} {acc.bankName ? `· ${acc.bankName}` : ""}
                      </p>
                      <p className="mt-1 text-label-sm font-medium text-on-surface">
                        {formatCurrency(acc.openingBalance)}
                      </p>
                      {acc.accountNumber && (
                        <p className="text-label-sm text-on-surface-variant">{acc.accountNumber}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={acc.active ? "secondary" : "outline"}>
                      {acc.active ? "Aktif" : "Nonaktif"}
                    </Badge>
                    <button
                      onClick={() => handleEdit(acc)}
                      className="rounded-lg p-2 text-on-surface-variant hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Desktop variant */}
      <div className="hidden md:block space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-0 flex-1 basis-60">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <Input
              placeholder="Cari akun..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border-outline-variant bg-surface-container-lowest pl-12 shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border/30 bg-card shadow-ambient-md">
          <div className="hidden grid-cols-[1.5fr_0.9fr_1fr_0.9fr_72px] items-center gap-4 bg-muted/50 px-6 md:grid">
            <div className="py-4 text-label-md text-muted-foreground">Akun</div>
            <div className="py-4 text-label-md text-muted-foreground">Tipe</div>
            <div className="py-4 text-label-md text-muted-foreground">Saldo Awal</div>
            <div className="py-4 text-label-md text-muted-foreground">Status</div>
            <div className="py-4 text-right text-label-md text-muted-foreground">Aksi</div>
          </div>

          {isLoading ? (
            <div className="animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border-t border-border/30 px-6 py-4"
                >
                  <div className="h-10 w-10 rounded-lg bg-surface-container-highest" />
                  <div className="h-4 w-24 rounded bg-surface-container-highest" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="border-t border-border/30 p-6 text-center">
              <p className="text-body-md text-destructive">Gagal memuat akun</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                Coba lagi
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-body-md text-muted-foreground">
              Tidak ada akun ditemukan.
            </div>
          ) : (
            filtered.map((acc) => (
              <div
                key={acc.id}
                className="grid grid-cols-[1.5fr_0.9fr_1fr_0.9fr_72px] items-center gap-4 border-t border-border/30 px-6 py-4 hover:bg-muted/30"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${acc.type === "BANK" ? "bg-secondary-container text-on-secondary-container" : "bg-primary/10 text-primary"}`}
                  >
                    {acc.type === "BANK" ? (
                      <Building2 className="h-5 w-5" />
                    ) : (
                      <Wallet className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-label-md font-semibold text-on-surface">
                      {acc.name}
                    </p>
                    {acc.type === "BANK" && acc.bankName && (
                      <p className="truncate text-label-sm text-on-surface-variant">
                        {acc.bankName} · {acc.accountNumber}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Badge variant="outline">{accountTypeLabel(acc.type)}</Badge>
                </div>
                <div className="truncate text-label-md text-on-surface">
                  {formatCurrency(acc.openingBalance)}
                </div>
                <div>
                  <Badge variant={acc.active ? "secondary" : "outline"}>
                    {acc.active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleEdit(acc)}
                    aria-label={`Edit ${acc.name}`}
                    className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <FinanceAccountFormDialog open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}
