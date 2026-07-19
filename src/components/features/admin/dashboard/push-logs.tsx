"use client";

import { Rss } from "lucide-react";
import { pushLogs } from "./consts";
import { PushLogItem } from "./push-logs/push-log-item";

export function PushLogsDesktop() {
  return (
    <div className="flex h-full flex-col rounded-3xl bg-surface p-6 shadow-ambient-md">
      <div className="pb-4 flex items-center justify-between border-b border-border mb-2">
        <h2 className="font-heading text-heading-md text-on-surface">Push Logs</h2>
        <Rss className="h-5 w-5 text-on-surface-variant" />
      </div>
      <div className="relative flex-1 space-y-0">
        {pushLogs.map((log, i) => (
          <PushLogItem key={i} {...log} isError={i === 1} />
        ))}
      </div>
    </div>
  );
}
