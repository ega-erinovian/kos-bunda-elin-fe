"use client";

import { useState } from "react";
import { ArrowRight, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type Props = {
  beforeValue?: unknown;
  afterValue?: unknown;
  action?: string;
  compact?: boolean;
};

const LABELS: Record<string, string> = {
  name: "Nama",
  type: "Tipe",
  bankName: "Nama Bank",
  accountNumber: "No. Rekening",
  openingBalance: "Saldo Awal",
  active: "Status",
  code: "Kode",
  amount: "Nominal",
  transactionDate: "Tanggal",
  description: "Deskripsi",
  referenceNumber: "Referensi",
  categoryId: "Kategori",
  accountId: "Akun",
  source: "Sumber",
  vendorName: "Vendor",
  receiptUrl: "Bukti",
  deletedAt: "Dihapus",
  notes: "Catatan",
  nominal: "Nominal",
  periodeBulan: "Bulan",
  periodeTahun: "Tahun",
  tanggalJatuhTempo: "Jatuh Tempo",
  status: "Status",
  catatan: "Catatan",
};

const HIDDEN_KEYS = new Set([
  "id",
  "propertyId",
  "createdByAdminId",
  "adminId",
  "createdAt",
  "updatedAt",
  "propertyId",
  "entity",
  "entityId",
]);

function prettyLabel(key: string) {
  return LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function formatValue(key: string, value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Aktif" : "Nonaktif";
  if (
    key.toLowerCase().includes("balance") ||
    key.toLowerCase().includes("amount") ||
    key === "nominal"
  ) {
    const n = typeof value === "string" ? Number(value) : (value as number);
    if (typeof n === "number" && !Number.isNaN(n)) return formatCurrency(n);
  }
  if (
    key.toLowerCase().includes("date") ||
    key === "deletedAt" ||
    key === "createdAt" ||
    key === "transactionDate" ||
    key === "tanggalJatuhTempo" ||
    key === "tanggalBayar"
  ) {
    try {
      const d = new Date(value as string);
      if (!Number.isNaN(d.getTime())) return formatDate(d);
    } catch {
      // fall through
    }
  }
  if (typeof value === "string" && value.length > 40 && /^[a-f0-9-]{20,}$/.test(value)) {
    return `${value.slice(0, 8)}…`;
  }
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function toRecord(v: unknown): Record<string, unknown> | null {
  if (v == null || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function getDiff(before: unknown, after: unknown) {
  const b = toRecord(before);
  const a = toRecord(after);
  // If both are null/primitive, treat as single value diff
  if (!b && !a) {
    return [];
  }
  if (!b && a) {
    return Object.entries(a)
      .filter(([k]) => !HIDDEN_KEYS.has(k))
      .map(([k, v]) => ({ key: k, before: undefined, after: v, changed: true }));
  }
  if (b && !a) {
    return Object.entries(b)
      .filter(([k]) => !HIDDEN_KEYS.has(k))
      .map(([k, v]) => ({ key: k, before: v, after: undefined, changed: true }));
  }
  const keys = new Set(
    [...Object.keys(b ?? {}), ...Object.keys(a ?? {})].filter((k) => !HIDDEN_KEYS.has(k)),
  );
  const out: Array<{ key: string; before: unknown; after: unknown; changed: boolean }> = [];
  for (const k of keys) {
    const bv = (b as Record<string, unknown>)[k];
    const av = (a as Record<string, unknown>)[k];
    const changed = JSON.stringify(bv) !== JSON.stringify(av);
    out.push({ key: k, before: bv, after: av, changed });
  }
  // stable order: changed first, then alphabetical
  out.sort((x, y) => {
    if (x.changed !== y.changed) return x.changed ? -1 : 1;
    return x.key.localeCompare(y.key);
  });
  return out;
}

function getActionTone(action?: string) {
  const a = (action ?? "").toLowerCase();
  if (a.includes("created"))
    return { variant: "secondary" as const, icon: Plus, dot: "bg-primary" };
  if (a.includes("updated"))
    return { variant: "outline" as const, icon: Pencil, dot: "bg-secondary-container" };
  if (a.includes("deleted") || a.includes("soft_deleted"))
    return { variant: "destructive" as const, icon: Trash2, dot: "bg-destructive" };
  return { variant: "outline" as const, icon: Pencil, dot: "bg-muted" };
}

export function AuditLogDetail({ beforeValue, afterValue, action, compact }: Props) {
  const diff = getDiff(beforeValue, afterValue);
  const changed = diff.filter((d) => d.changed);
  const unchanged = diff.filter((d) => !d.changed);
  const [showUnchanged, setShowUnchanged] = useState(false);

  if (diff.length === 0) {
    if (beforeValue == null && afterValue == null) {
      return (
        <span className="text-label-sm text-on-surface-variant">Tidak ada detail perubahan.</span>
      );
    }
    // Fallback to raw if diff empty but values exist (identical)
    return (
      <span className="text-label-sm text-on-surface-variant">Tidak ada perubahan terdeteksi.</span>
    );
  }

  // For create/delete where one side null, show all as changed
  const visible = showUnchanged ? diff : changed.length > 0 ? changed : diff.slice(0, 4);

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {/* Summary */}
      <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
        {changed.length === 0 ? (
          <span>{diff.length} field • tidak ada perubahan</span>
        ) : unchanged.length === 0 ? (
          <span>
            {changed.length} field diubah
            {action ? ` • ${action}` : ""}
          </span>
        ) : (
          <span>
            {changed.length} diubah • {unchanged.length} tetap
          </span>
        )}
        {unchanged.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUnchanged((v) => !v)}
            className="ml-auto h-7 gap-1.5 rounded-full border border-outline-variant/50 bg-surface px-3 text-label-sm hover:bg-muted"
          >
            {showUnchanged ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showUnchanged ? "Sembunyikan" : `Lihat tetap (${unchanged.length})`}
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest/50">
        {visible.map((d, idx) => (
          <div key={d.key}>
            <div
              className={cn(
                "grid gap-2 px-3 py-2.5 md:grid-cols-[140px_1fr] md:gap-4 md:px-4",
                d.changed ? "bg-primary/[0.04]" : "bg-transparent",
              )}
            >
              <span className="text-label-sm font-medium text-on-surface-variant md:pt-0.5">
                {prettyLabel(d.key)}
              </span>
              <div className="min-w-0">
                {d.changed ? (
                  <div className="flex flex-wrap items-center gap-1.5 text-label-md">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-label-sm",
                        d.before == null
                          ? "bg-muted text-on-surface-variant"
                          : "bg-surface-container text-on-surface-variant line-through decoration-destructive/40",
                      )}
                    >
                      {formatValue(d.key, d.before)}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-on-surface-variant" />
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 font-medium",
                        d.after == null
                          ? "bg-destructive/10 text-destructive line-through"
                          : d.key === "deletedAt" && d.after
                            ? "bg-destructive/10 text-destructive"
                            : "bg-secondary-container text-on-secondary-container",
                      )}
                    >
                      {formatValue(d.key, d.after)}
                    </span>
                  </div>
                ) : (
                  <span className="text-label-md text-on-surface-variant">
                    {formatValue(d.key, d.after ?? d.before)}
                  </span>
                )}
              </div>
            </div>
            {idx < visible.length - 1 && <Separator className="bg-border/30" />}
          </div>
        ))}

        {!showUnchanged && unchanged.length > 0 && changed.length > 0 && (
          <>
            <Separator className="bg-border/30" />
            <div className="bg-muted/30 px-3 py-2 text-center md:px-4">
              <span className="text-label-sm text-on-surface-variant">
                + {unchanged.length} field tidak berubah •{" "}
                <button
                  onClick={() => setShowUnchanged(true)}
                  className="font-medium text-primary hover:underline"
                >
                  tampilkan
                </button>
              </span>
            </div>
          </>
        )}
      </div>

      {/* Raw fallback for debugging — collapsed, not primary */}
      <details className="group">
        <summary className="cursor-pointer text-label-sm text-on-surface-variant hover:text-on-surface [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-outline-variant group-open:bg-primary" />
            Raw JSON (debug)
          </span>
        </summary>
        <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-surface-container p-3 text-label-sm text-on-surface">
          {JSON.stringify({ before: beforeValue, after: afterValue }, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export function AuditActionBadge({ action }: { action: string }) {
  const meta = getActionTone(action);
  const Icon = meta.icon;
  return (
    <Badge variant={meta.variant} className="gap-1.5">
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      <Icon className="h-3 w-3" />
      {action}
    </Badge>
  );
}
