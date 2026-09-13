/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog";
import {
  useFinanceTransactions,
  useDeleteFinanceTransaction,
  useUpdateFinanceTransaction,
} from "@/hooks/api/use-finance-transactions";
import { useFinanceAccounts } from "@/hooks/api/use-finance-accounts";
import { useFinanceCategories } from "@/hooks/api/use-finance-categories";
import { FinanceTransactionFormDialog } from "./components/FinanceTransactionFormDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";
import { transactionSourceLabel } from "./mappers";
import type { FinancialTransaction } from "@/types";
import toast from "react-hot-toast";

export function FinanceTransactionsSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightId = searchParams.get("paymentRecordId") || searchParams.get("highlight");

  const [page, setPage] = useState(1);
  const [type, setType] = useState<string>("semua");
  const [accountId, setAccountId] = useState<string>("semua");
  const [categoryId, setCategoryId] = useState<string>("semua");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const pageSize = 10;

  const query = useMemo(() => {
    const p: any = { page, pageSize };
    if (type !== "semua") p.type = type;
    if (accountId !== "semua") p.accountId = accountId;
    if (categoryId !== "semua") p.categoryId = categoryId;
    if (from) p.from = new Date(from).toISOString();
    if (to) p.to = new Date(to).toISOString();
    return p;
  }, [page, type, accountId, categoryId, from, to]);

  const { data, isLoading, isError, refetch } = useFinanceTransactions(query);
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: incomeCats = [] } = useFinanceCategories("INCOME");
  const { data: expenseCats = [] } = useFinanceCategories("EXPENSE");
  const allCats = [...incomeCats, ...expenseCats];

  const txs: FinancialTransaction[] = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? txs.length;

  const [createOpen, setCreateOpen] = useState(false);
  const [editTx, setEditTx] = useState<FinancialTransaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const del = useDeleteFinanceTransaction();
  const upd = useUpdateFinanceTransaction();

  function resetPage() {
    setPage(1);
  }

  function getCatName(id: string) {
    return allCats.find((c) => c.id === id)?.code ?? id.slice(0, 8);
  }
  function getAccName(id: string) {
    return accounts.find((a) => a.id === id)?.name ?? id.slice(0, 8);
  }

  const [editDesc, setEditDesc] = useState("");
  const [editRef, setEditRef] = useState("");

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
        onError: (e: any) => toast.error(e.message || "Gagal memperbarui"),
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
      onError: (e: any) => toast.error(e.message || "Gagal menghapus"),
    });
  }

  const Filters = (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={type}
        onValueChange={(v) => {
          if (v !== null) setType(v);
          resetPage();
        }}
      >
        <SelectTrigger className="w-36 border-border bg-background">
          <Filter className="h-4 w-4" />
          <SelectValue placeholder="Tipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">Semua Tipe</SelectItem>
          <SelectItem value="INCOME">Pemasukan</SelectItem>
          <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={accountId}
        onValueChange={(v) => {
          if (v !== null) setAccountId(v);
          resetPage();
        }}
      >
        <SelectTrigger className="w-40 border-border bg-background">
          <SelectValue placeholder="Akun" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">Semua Akun</SelectItem>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={categoryId}
        onValueChange={(v) => {
          if (v !== null) setCategoryId(v);
          resetPage();
        }}
      >
        <SelectTrigger className="w-44 border-border bg-background">
          <SelectValue placeholder="Kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">Semua Kategori</SelectItem>
          {allCats.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={from}
        onChange={(e) => {
          setFrom(e.target.value);
          resetPage();
        }}
        className="h-8 w-36 border-border bg-background"
        placeholder="Dari"
      />
      <Input
        type="date"
        value={to}
        onChange={(e) => {
          setTo(e.target.value);
          resetPage();
        }}
        className="h-8 w-36 border-border bg-background"
        placeholder="Sampai"
      />
      {(type !== "semua" || accountId !== "semua" || categoryId !== "semua" || from || to) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setType("semua");
            setAccountId("semua");
            setCategoryId("semua");
            setFrom("");
            setTo("");
            resetPage();
          }}
        >
          Reset
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaksi Keuangan"
        subtitle={`${total} transaksi · halaman ${page} dari ${totalPages}`}
      >
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </Button>
      </PageHeader>

      {highlightId && (
        <Card className="border-primary/20 bg-primary/5 p-3">
          <p className="text-label-sm text-primary">
            Highlight paymentRecordId: {highlightId} — transaksi terkait disorot di daftar.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-7"
            onClick={() => router.push("/admin/finance/transactions")}
          >
            Hapus highlight
          </Button>
        </Card>
      )}

      {/* Mobile variant */}
      <div className="md:hidden space-y-4">
        <div>{Filters}</div>

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
            <p className="text-label-md text-destructive">Gagal memuat transaksi</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </Card>
        ) : txs.length === 0 ? (
          <Card className="p-8 text-center text-body-md text-on-surface-variant">
            Tidak ada transaksi.
          </Card>
        ) : (
          <div className="space-y-3">
            {txs.map((tx) => {
              const highlighted =
                highlightId && (tx.paymentRecordId === highlightId || tx.id === highlightId);
              return (
                <Card
                  key={tx.id}
                  variant="bordered"
                  className={`p-4 ${highlighted ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={tx.type === "INCOME" ? "secondary" : "destructive"}>
                          {tx.type}
                        </Badge>
                        <span className="text-label-sm text-on-surface-variant">
                          {transactionSourceLabel(tx.source as any)}
                        </span>
                      </div>
                      <p className="mt-2 text-label-md font-semibold text-on-surface">
                        {formatCurrency(tx.amount)}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        {formatDate(tx.transactionDate)} · {getAccName(tx.accountId)} ·{" "}
                        {getCatName(tx.categoryId)}
                      </p>
                      {tx.description && (
                        <p className="mt-1 text-label-sm text-on-surface">{tx.description}</p>
                      )}
                      {tx.referenceNumber && (
                        <p className="text-label-sm text-on-surface-variant">
                          Ref: {tx.referenceNumber}
                        </p>
                      )}
                      {tx.paymentRecordId && (
                        <p className="text-label-sm text-primary">
                          paymentRecord: {tx.paymentRecordId.slice(0, 8)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(tx)}
                        className="rounded-lg p-2 text-on-surface-variant hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="rounded-lg p-2 text-on-surface-variant hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </Button>
          </div>
        )}
      </div>

      {/* Desktop variant */}
      <div className="hidden md:block space-y-4">
        <div className="flex flex-wrap items-center gap-3">{Filters}</div>

        <div className="overflow-hidden rounded-3xl border border-border/30 bg-card shadow-ambient-md">
          <div className="flex bg-muted/50 px-6 text-label-md text-muted-foreground">
            <div className="w-32 py-4">Tanggal</div>
            <div className="w-28 py-4">Tipe / Sumber</div>
            <div className="w-32 py-4">Akun</div>
            <div className="w-36 py-4">Kategori</div>
            <div className="w-36 py-4">Nominal</div>
            <div className="flex-1 py-4">Deskripsi</div>
            <div className="w-24 py-4 text-right">Aksi</div>
          </div>

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
          ) : txs.length === 0 ? (
            <div className="py-12 text-center text-body-md text-muted-foreground">
              Tidak ada transaksi.
            </div>
          ) : (
            txs.map((tx) => {
              const highlighted =
                highlightId && (tx.paymentRecordId === highlightId || tx.id === highlightId);
              return (
                <div
                  key={tx.id}
                  className={`flex items-center border-t border-border/30 px-6 py-4 hover:bg-muted/30 ${highlighted ? "bg-primary/5" : ""}`}
                >
                  <div className="w-32 text-label-sm text-on-surface">
                    {formatDate(tx.transactionDate)}
                  </div>
                  <div className="w-28">
                    <Badge
                      variant={tx.type === "INCOME" ? "secondary" : "destructive"}
                      className="text-label-sm"
                    >
                      {tx.type}
                    </Badge>
                    <p className="mt-1 text-label-sm text-on-surface-variant">
                      {transactionSourceLabel(tx.source as any)}
                    </p>
                  </div>
                  <div className="w-32 text-label-md text-on-surface">
                    {getAccName(tx.accountId)}
                  </div>
                  <div className="w-36 text-label-md text-on-surface">
                    {getCatName(tx.categoryId)}
                  </div>
                  <div className="w-36 text-label-md font-semibold text-on-surface">
                    {formatCurrency(tx.amount)}
                  </div>
                  <div className="flex-1 text-label-sm text-on-surface-variant truncate pr-4">
                    {tx.description || "-"}
                    {tx.referenceNumber ? ` · ${tx.referenceNumber}` : ""}
                  </div>
                  <div className="flex w-24 justify-end gap-1">
                    <button
                      onClick={() => openEdit(tx)}
                      className="rounded-lg p-2 text-on-surface-variant hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(tx.id)}
                      className="rounded-lg p-2 text-on-surface-variant hover:text-destructive"
                      title="Hapus (OWNER)"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
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
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  ›
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <FinanceTransactionFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Edit dialog */}
      <Dialog open={!!editTx} onOpenChange={(o) => !o && setEditTx(null)}>
        <DialogContent className="max-w-112">
          <DialogHeader>
            <DialogTitle>Edit Transaksi</DialogTitle>
            <DialogDescription>
              Hanya deskripsi, referensi, atau kategori — nominal & akun tidak dapat diubah.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-label-md text-on-surface-variant">Deskripsi</Label>
              <Input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                maxLength={500}
                className="border-outline-variant bg-surface-container-lowest"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-label-md text-on-surface-variant">Referensi</Label>
              <Input
                value={editRef}
                onChange={(e) => setEditRef(e.target.value)}
                maxLength={100}
                className="border-outline-variant bg-surface-container-lowest"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditTx(null)}>
                Batal
              </Button>
              <Button onClick={handleUpdate} disabled={upd.isPending}>
                {upd.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteAlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Hapus Transaksi"
        description="Transaksi akan di-soft delete dan tetap tercatat di audit log. Lanjutkan?"
        isPending={del.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
