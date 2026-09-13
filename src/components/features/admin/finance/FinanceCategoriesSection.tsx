"use client";

import { useState } from "react";
import { Pencil, Plus, Tag } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFinanceCategories } from "@/hooks/api/use-finance-categories";
import { FinanceCategoryFormDialog } from "./components/FinanceCategoryFormDialog";
import type { FinancialCategory, CategoryType } from "@/types";

export function FinanceCategoriesSection() {
  const [tab, setTab] = useState<CategoryType>("EXPENSE");
  const { data: categories = [], isLoading, isError, refetch } = useFinanceCategories(tab);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialCategory | null>(null);

  function handleAdd() {
    setEditing(null);
    setOpen(true);
  }
  function handleEdit(c: FinancialCategory) {
    setEditing(c);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori Keuangan"
        subtitle="Kategori pemasukan & pengeluaran — kode unik A-Z + _ ."
      >
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["INCOME", "EXPENSE"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-label-md font-medium transition-colors ${tab === t ? "bg-primary text-on-primary" : "border border-outline-variant bg-surface text-on-surface-variant hover:bg-muted"}`}
          >
            {t === "INCOME" ? "Pemasukan" : "Pengeluaran"}
          </button>
        ))}
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse p-4">
              <div className="h-4 w-20 rounded bg-surface-container-highest" />
            </Card>
          ))
        ) : isError ? (
          <Card className="border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-label-md text-destructive">Gagal memuat kategori</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </Card>
        ) : categories.length === 0 ? (
          <Card className="p-8 text-center text-body-md text-on-surface-variant">
            Belum ada kategori {tab}.
          </Card>
        ) : (
          categories.map((c) => (
            <Card key={c.id} variant="bordered" className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-label-md font-semibold text-on-surface">{c.code}</p>
                    <p className="truncate text-label-sm text-on-surface-variant">{c.name}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={c.active ? "secondary" : "outline"}>
                    {c.active ? "Aktif" : "Nonaktif"}
                  </Badge>
                  <button
                    onClick={() => handleEdit(c)}
                    aria-label={`Edit ${c.code}`}
                    className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-3xl border border-border/30 bg-card shadow-ambient-md">
          <div className="flex bg-muted/50 px-6">
            <div className="w-40 py-4 text-label-md text-muted-foreground">Kode</div>
            <div className="flex-1 py-4 text-label-md text-muted-foreground">Nama</div>
            <div className="w-28 py-4 text-label-md text-muted-foreground">Status</div>
            <div className="w-24 py-4 text-right text-label-md text-muted-foreground">Aksi</div>
          </div>

          {isLoading ? (
            <div className="animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-t border-border/30 px-6 py-4">
                  <div className="h-4 w-24 rounded bg-surface-container-highest" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="border-t border-border/30 p-6 text-center text-body-md text-destructive">
              Gagal memuat kategori
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-body-md text-muted-foreground">
              Belum ada kategori.
            </div>
          ) : (
            categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center border-t border-border/30 px-6 py-4 hover:bg-muted/30"
              >
                <div className="flex w-40 items-center gap-2">
                  <Tag className="h-4 w-4 text-on-surface-variant" />
                  <span className="text-label-md font-semibold text-on-surface">{c.code}</span>
                </div>
                <div className="flex-1 text-label-md text-on-surface">{c.name}</div>
                <div className="w-28">
                  <Badge variant={c.active ? "secondary" : "outline"}>
                    {c.active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
                <div className="flex w-24 justify-end">
                  <button
                    onClick={() => handleEdit(c)}
                    aria-label={`Edit ${c.code}`}
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

      <FinanceCategoryFormDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        defaultType={tab}
      />
    </div>
  );
}
