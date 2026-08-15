"use client";

import type { LucideIcon } from "lucide-react";

interface PushLogItemProps {
  statusIcon: LucideIcon;
  statusClass: string;
  label: string;
  status: string;
  detail: string;
  time: string;
  isError?: boolean;
}

export function PushLogItem({
  statusIcon: StatusIcon,
  statusClass,
  label,
  status,
  detail,
  time,
  isError,
}: PushLogItemProps) {
  return (
    <div className="relative py-1.5">
      <div
        className={`rounded-xl border p-3 ${isError ? "border-error/20 bg-error/5" : "border-surface-variant bg-surface-container-lowest"}`}
      >
        <div className="mb-1 flex items-start justify-between">
          <span className="text-label-md text-on-surface">{label}</span>
          <span className={`flex items-center gap-1 text-label-sm ${statusClass}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {status}
          </span>
        </div>
        <p className="text-label-sm text-on-surface-variant">{detail}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}
