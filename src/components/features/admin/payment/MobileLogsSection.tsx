"use client";

import {
  Search,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Mail,
  Bell,
  Users,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dummyBroadcastLogs, LOGS_PAGE_SIZE } from "./constants";
import { useBroadcastLogs } from "@/hooks/features/admin/useBroadcastLogs";
import type { BroadcastLog } from "./types";

const typeIcons = { sms: MessageSquare, email: Mail, push: Bell };

function isGroup(recipient: string) {
  return recipient.includes("Group") || recipient.includes("Semua");
}

export function MobileLogsSection() {
  const {
    searchQuery,
    currentPage,
    filteredLogs,
    totalPages,
    paginatedLogs,
    handleSearch,
    handlePageChange,
  } = useBroadcastLogs(dummyBroadcastLogs);

  const from = (currentPage - 1) * LOGS_PAGE_SIZE + 1;
  const to = Math.min(currentPage * LOGS_PAGE_SIZE, filteredLogs.length);

  return (
    <div className="space-y-4 md:hidden">
      <h1 className="text-heading-lg-mobile font-bold text-on-surface">Log Komunikasi</h1>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
        <Input
          placeholder="Cari penerima..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-[46px] w-full rounded-xl border-outline-variant bg-surface-container-lowest pl-12 shadow-[0_4px_20px_-2px_rgba(134,167,137,0.08)]"
        />
      </div>

      <div className="flex flex-col gap-2">
        {paginatedLogs.length > 0 ? (
          paginatedLogs.map((log) => <MobileLogRow key={log.id} log={log} />)
        ) : (
          <div className="py-12 text-center text-body-md text-on-surface-variant">
            Log tidak ditemukan.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-label-sm text-on-surface-variant">
            {from}-{to} dari {filteredLogs.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function MobileLogRow({ log }: { log: BroadcastLog }) {
  const Icon = typeIcons[log.type];
  const group = isGroup(log.recipient);

  return (
    <div className="flex items-center gap-4 rounded-xl bg-surface-container-low p-md">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          group
            ? "bg-secondary-fixed text-on-secondary-fixed"
            : "bg-primary-fixed text-on-primary-fixed-variant"
        }`}
      >
        {group ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <h3 className="truncate text-label-md text-on-surface">{log.recipient}</h3>
          <span className="text-label-sm text-[10px] text-on-surface-variant">{log.time}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-on-surface-variant" />
          <span className="text-label-sm text-on-surface-variant">
            {log.type === "sms" ? "SMS" : log.type === "email" ? "Email" : "App Push"}
          </span>
        </div>
      </div>
      <Badge variant={log.status === "success" ? "default" : "destructive"}>
        {log.status === "success" ? "Success" : "Failed"}
      </Badge>
    </div>
  );
}
