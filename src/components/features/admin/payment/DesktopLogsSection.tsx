"use client";

import { Search, Filter, MessageSquare, Mail, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dummyBroadcastLogs, LOGS_PAGE_SIZE } from "./constants";
import { useBroadcastLogs } from "@/hooks/features/admin/useBroadcastLogs";
import type { BroadcastLog, BroadcastLogStatus } from "./types";

const typeIconMap = { sms: MessageSquare, email: Mail, push: Bell };

const statusFilterOptions: { key: BroadcastLogStatus | "all"; label: string }[] = [
  { key: "all", label: "Semua Status" },
  { key: "success", label: "Success" },
  { key: "failed", label: "Failed" },
];

const typeFilterOptions: { key: "all" | "sms" | "email" | "push"; label: string }[] = [
  { key: "all", label: "Semua Tipe" },
  { key: "sms", label: "SMS" },
  { key: "email", label: "Email" },
  { key: "push", label: "App Push" },
];

export function DesktopLogsSection() {
  const {
    searchQuery,
    filterStatus,
    filterType,
    currentPage,
    filteredLogs,
    totalPages,
    paginatedLogs,
    handleSearch,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handlePageChange,
  } = useBroadcastLogs(dummyBroadcastLogs);

  const empty = paginatedLogs.length === 0;
  const from = (currentPage - 1) * LOGS_PAGE_SIZE + 1;
  const to = Math.min(currentPage * LOGS_PAGE_SIZE, filteredLogs.length);

  return (
    <div className="hidden space-y-6 md:block">
      <PageHeader
        title="Log Komunikasi"
        subtitle="Riwayat lengkap pengiriman pesan dan notifikasi ke penghuni."
        backHref="/admin/payments"
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-0 flex-1 basis-60">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            placeholder="Cari penerima..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border-outline-variant bg-surface-container-lowest pl-12 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={filterType}
            onValueChange={(v) => handleTypeFilterChange(v as typeof filterType)}
          >
            <SelectTrigger className="w-36 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground">
              <Filter className="h-4 w-4 shrink-0" />
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent align="start">
              {typeFilterOptions.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={(v) => handleStatusFilterChange(v as BroadcastLogStatus | "all")}
          >
            <SelectTrigger className="w-36 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground">
              <Filter className="h-4 w-4 shrink-0" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent align="start">
              {statusFilterOptions.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/30 bg-card shadow-ambient-md">
        <div className="hidden items-center bg-muted/50 md:flex">
          <div className="flex-[2] px-6 py-4 text-label-md text-muted-foreground">Penerima</div>
          <div className="flex-1 px-6 py-4 text-label-md text-muted-foreground">Tipe</div>
          <div className="flex-1 px-6 py-4 text-label-md text-muted-foreground">Waktu</div>
          <div className="w-28 px-6 py-4 text-label-md text-muted-foreground">Status</div>
        </div>

        {!empty ? (
          paginatedLogs.map((log) => <DesktopLogRow key={log.id} log={log} />)
        ) : (
          <div className="py-12 text-center text-body-md text-muted-foreground">
            Tidak ada log komunikasi yang ditemukan.
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/30 px-6 py-4">
            <span className="text-sm text-muted-foreground">
              Menampilkan {from}-{to} dari {filteredLogs.length} log
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DesktopLogRow({ log }: { log: BroadcastLog }) {
  const Icon = typeIconMap[log.type];
  return (
    <div className="flex flex-col gap-4 border-t border-border/30 px-6 py-4 transition-colors hover:bg-muted/30 md:flex-row md:items-center md:gap-0">
      <div className="flex-[2] text-sm font-medium text-on-surface">{log.recipient}</div>
      <div className="flex-1 text-sm text-on-surface-variant">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {log.type === "sms" ? "SMS" : log.type === "email" ? "Email" : "App Push"}
        </div>
      </div>
      <div className="flex-1 text-sm text-muted-foreground">{log.time}</div>
      <div className="w-28">
        <Badge variant={log.status === "success" ? "default" : "destructive"}>
          {log.status === "success" ? "Success" : "Failed"}
        </Badge>
      </div>
    </div>
  );
}
