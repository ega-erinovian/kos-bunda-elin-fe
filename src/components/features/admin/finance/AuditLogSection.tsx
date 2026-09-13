/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { Search, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLog } from "@/hooks/api/use-audit-log";
import { formatDate } from "@/lib/utils";
import { AuditLogDetail, AuditActionBadge } from "./components/AuditLogDetail";

export function AuditLogSection() {
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState<string>("semua");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [entityId, setEntityId] = useState("");

  const pageSize = 20;

  const query = useMemo(() => {
    const p: any = { page, pageSize };
    if (entity !== "semua") p.entity = entity;
    if (entityId.trim()) p.entityId = entityId.trim();
    if (from) p.from = new Date(from).toISOString();
    if (to) p.to = new Date(to).toISOString();
    return p;
  }, [page, entity, entityId, from, to, pageSize]);

  const { data, isLoading, isError, refetch } = useAuditLog(query);
  const logs = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? logs.length;

  function resetPage() {
    setPage(1);
  }

  const isForbidden = (data as any)?.status === 403;

  const Filters = (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={entity}
        onValueChange={(v) => {
          if (v !== null) setEntity(v);
          resetPage();
        }}
      >
        <SelectTrigger className="w-44 border-border bg-background">
          <SelectValue placeholder="Entity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">Semua Entity</SelectItem>
          <SelectItem value="FinancialTransaction">FinancialTransaction</SelectItem>
          <SelectItem value="FinancialAccount">FinancialAccount</SelectItem>
          <SelectItem value="FinancialCategory">FinancialCategory</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <Input
          placeholder="Entity ID..."
          value={entityId}
          onChange={(e) => {
            setEntityId(e.target.value);
            resetPage();
          }}
          className="h-8 w-40 border-border bg-background pl-8"
        />
      </div>

      <Input
        type="date"
        value={from}
        onChange={(e) => {
          setFrom(e.target.value);
          resetPage();
        }}
        className="h-8 w-36 border-border bg-background"
      />
      <Input
        type="date"
        value={to}
        onChange={(e) => {
          setTo(e.target.value);
          resetPage();
        }}
        className="h-8 w-36 border-border bg-background"
      />

      {(entity !== "semua" || entityId || from || to) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEntity("semua");
            setEntityId("");
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

  if (isForbidden) {
    return (
      <div className="space-y-6">
        <PageHeader title="Audit Log" subtitle="Hanya OWNER dapat melihat log audit." />
        <Card className="border-destructive/20 bg-destructive/5 p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
          <p className="mt-3 text-body-md font-medium text-destructive">
            Akses ditolak — hanya OWNER.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        subtitle={`${total} entri · halaman ${page} dari ${totalPages} — hanya OWNER`}
      >
        <Badge variant="outline" className="hidden md:inline-flex">
          OWNER only
        </Badge>
      </PageHeader>

      {/* Mobile */}
      <div className="md:hidden space-y-4">
        <div>{Filters}</div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse p-4">
                <div className="h-4 w-32 rounded bg-surface-container-highest" />
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-label-md text-destructive">Gagal memuat audit log</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </Card>
        ) : logs.length === 0 ? (
          <Card className="p-8 text-center text-body-md text-on-surface-variant">
            Tidak ada log.
          </Card>
        ) : (
          <div className="space-y-3">
            {logs.map((l) => (
              <Card key={l.id} variant="bordered" className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <AuditActionBadge action={l.action} />
                    <p className="mt-2 truncate text-label-md font-medium text-on-surface">
                      {l.entity} · {l.entityId.slice(0, 8)}
                    </p>
                    {l.adminId && (
                      <p className="text-label-sm text-on-surface-variant">
                        oleh {l.adminId.slice(0, 8)}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-label-sm text-on-surface-variant">
                    {formatDate(l.createdAt)}
                  </span>
                </div>
                <div className="mt-3">
                  <AuditLogDetail
                    beforeValue={l.beforeValue}
                    afterValue={l.afterValue}
                    action={l.action}
                  />
                </div>
              </Card>
            ))}
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

      {/* Desktop */}
      <div className="hidden md:block space-y-4">
        <div>{Filters}</div>
        <div className="overflow-hidden rounded-3xl border border-border/30 bg-card shadow-ambient-md">
          <div className="flex bg-muted/50 px-6 text-label-md text-muted-foreground">
            <div className="w-40 py-4">Waktu</div>
            <div className="w-36 py-4">Entity</div>
            <div className="w-28 py-4">Action</div>
            <div className="w-32 py-4">Admin</div>
            <div className="flex-1 py-4">Detail</div>
          </div>

          {isLoading ? (
            <div className="animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-t border-border/30 px-6 py-4">
                  <div className="h-4 w-32 rounded bg-surface-container-highest" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="border-t border-border/30 p-6 text-center text-body-md text-destructive">
              Gagal memuat
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-body-md text-muted-foreground">
              Tidak ada log.
            </div>
          ) : (
            logs.map((l) => (
              <div
                key={l.id}
                className="flex gap-4 border-t border-border/30 px-6 py-4 hover:bg-muted/30"
              >
                <div className="w-40 text-label-sm text-on-surface">{formatDate(l.createdAt)}</div>
                <div className="w-36">
                  <p className="text-label-md font-medium text-on-surface">{l.entity}</p>
                  <p className="text-label-sm text-on-surface-variant">{l.entityId.slice(0, 12)}</p>
                </div>
                <div className="w-28">
                  <AuditActionBadge action={l.action} />
                </div>
                <div className="w-32 text-label-sm text-on-surface-variant">
                  {l.adminId ? l.adminId.slice(0, 8) : "-"}
                </div>
                <div className="flex-1">
                  <AuditLogDetail
                    beforeValue={l.beforeValue}
                    afterValue={l.afterValue}
                    action={l.action}
                    compact
                  />
                </div>
              </div>
            ))
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
    </div>
  );
}
