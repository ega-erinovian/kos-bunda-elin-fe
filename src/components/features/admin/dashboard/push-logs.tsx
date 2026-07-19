"use client";

import { Rss } from "lucide-react";
import { pushLogs } from "./consts";

export function PushLogsDesktop() {
  return (
    <div className="flex h-full flex-col rounded-3xl bg-surface p-6 shadow-ambient-md">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-heading-md text-on-surface">Push Logs</h2>
        <Rss className="h-5 w-5 text-on-surface-variant" />
      </div>
      <div className="relative flex-1 space-y-0 pl-2 before:absolute before:inset-y-0 before:left-4.75 before:w-0.5 before:bg-surface-variant">
        {pushLogs.map((log, i) => {
          const StatusIcon = log.statusIcon;
          return (
            <div key={i} className="relative py-3 pl-8">
              <div
                className={`absolute -left-1.25 top-4 h-3 w-3 rounded-full ring-4 ring-surface ${log.dotColor}`}
              />
              <div
                className={`rounded-xl border p-3 ${i === 1 ? "border-error/20 bg-error/5" : "border-surface-variant bg-surface-container-lowest"}`}
              >
                <div className="mb-1 flex items-start justify-between">
                  <span className="text-label-md text-on-surface">{log.label}</span>
                  <span className={`flex items-center gap-1 text-label-sm ${log.statusClass}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {log.status}
                  </span>
                </div>
                <p className="text-label-sm text-on-surface-variant">{log.detail}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{log.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
