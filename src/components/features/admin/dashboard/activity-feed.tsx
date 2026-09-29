"use client";

import Link from "next/link";
import { History, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuditLog } from "@/hooks/api/use-audit-log";
import { cn, formatDate } from "@/lib/utils";
import { AuditActionBadge } from "../finance/components/AuditLogDetail";
import type { AuditLogEntry } from "@/types";

const AUDIT_LINK = "/admin/finance/audit-log";

function tone(action: string) {
  const a = action.toLowerCase();
  if (a.includes("created")) return { Icon: Plus, chip: "bg-primary/10 text-primary" };
  if (a.includes("deleted") || a.includes("soft_deleted"))
    return { Icon: Trash2, chip: "bg-destructive/10 text-destructive" };
  if (a.includes("updated"))
    return { Icon: Pencil, chip: "bg-secondary text-secondary-foreground" };
  return { Icon: History, chip: "bg-muted text-muted-foreground" };
}

function shortActionLabel(action: string) {
  const a = action.toLowerCase();
  if (a.includes("created")) return "Buat";
  if (a.includes("updated")) return "Ubah";
  if (a.includes("deleted") || a.includes("soft_deleted") || a.includes("reversed")) return "Hapus";
  return action;
}

function AuditRow({ log }: { log: AuditLogEntry }) {
  const { Icon, chip } = tone(log.action);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-transparent p-4 transition-colors hover:border-surface-variant bg-primary/5">
      <div className="flex min-w-0 items-center gap-4">
        <div
          className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", chip)}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-label-md font-medium text-on-surface">{log.entity}</p>
          <p className="truncate text-label-sm text-on-surface-variant">
            {log.entityId.slice(0, 12)}
            {log.adminId ? ` · oleh ${log.adminId.slice(0, 8)}` : ""}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <AuditActionBadge action={log.action} />
        <span className="text-label-sm text-on-surface-variant">{formatDate(log.createdAt)}</span>
      </div>
    </div>
  );
}

function AuditRowMobile({ log }: { log: AuditLogEntry }) {
  const { Icon, chip } = tone(log.action);
  return (
    <div className="rounded-xl border border-transparent p-3 transition-colors hover:border-surface-variant hover:bg-primary/5">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", chip)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-label-md font-medium text-on-surface">{log.entity}</p>
          <p className="truncate text-label-sm text-on-surface-variant">
            {log.entityId.slice(0, 12)}
            {log.adminId ? ` · oleh ${log.adminId.slice(0, 8)}` : ""}
          </p>
        </div>
        <div className="shrink-0">
          <AuditActionBadge action={log.action} label={shortActionLabel(log.action)} />
        </div>
      </div>
      <p className="mt-1 pl-11 text-label-sm text-on-surface-variant">
        {formatDate(log.createdAt)}
      </p>
    </div>
  );
}

function FeedBody({ mobile = false }: { mobile?: boolean }) {
  const { data, isLoading, isError, error, refetch } = useAuditLog({ page: 1, pageSize: 5 });
  if ((error as { status?: number } | null)?.status === 403) return null;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl p-3">
            <div className="h-8 w-8 shrink-0 rounded-full bg-surface-container-highest" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-surface-container-highest" />
              <div className="h-3 w-24 rounded bg-surface-container-highest" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-label-md text-destructive">Gagal memuat aktivitas</p>
        <button
          onClick={() => refetch()}
          className="mt-3 cursor-pointer rounded-xl bg-primary px-4 py-2 text-label-md text-on-primary hover:bg-primary/90"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  const logs = data?.data ?? [];
  if (logs.length === 0) {
    return (
      <p className="py-12 text-center text-body-md text-on-surface-variant">Belum ada aktivitas.</p>
    );
  }

  return (
    <div className={mobile ? "space-y-2" : "space-y-4"}>
      {logs.map((log) =>
        mobile ? <AuditRowMobile key={log.id} log={log} /> : <AuditRow key={log.id} log={log} />,
      )}
    </div>
  );
}

function FeedHeader({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className={
        mobile ? "mb-4 flex items-center justify-between" : "mb-6 flex items-center justify-between"
      }
    >
      <h2 className="font-heading text-heading-md text-on-surface">Aktivitas Terbaru</h2>
      <Link
        href={AUDIT_LINK}
        className="text-label-md text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Lihat Semua
      </Link>
    </div>
  );
}

export function ActivityFeedDesktop() {
  return (
    <div className="rounded-3xl bg-surface p-3 shadow-ambient-md">
      <FeedHeader />
      <div
        tabIndex={0}
        className="max-h-96 overflow-y-auto overscroll-contain rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <FeedBody />
      </div>
    </div>
  );
}

export function ActivityFeedMobile() {
  return (
    <section className="rounded-xl bg-surface p-4 shadow-ambient-sm">
      <FeedHeader mobile />
      <div
        tabIndex={0}
        className="max-h-80 overflow-y-auto overscroll-contain rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <FeedBody mobile />
      </div>
    </section>
  );
}
