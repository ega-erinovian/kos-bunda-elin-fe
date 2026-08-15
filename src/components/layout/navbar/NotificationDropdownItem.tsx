"use client";

import { cn } from "@/lib/utils";
import type { Notification } from "./NotificationSection";
import { notificationIcons } from "./NotificationSection";

interface Props {
  notification: Notification;
}

export function NotificationDropdownItem({ notification: n }: Props) {
  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer",
        !n.read && "bg-primary/5",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          notificationIcons[n.type]?.bg ?? "bg-muted",
        )}
      >
        {notificationIcons[n.type]?.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm",
              !n.read ? "font-semibold text-foreground" : "text-muted-foreground",
            )}
          >
            {n.title}
          </p>
          {!n.read && <span className="shrink-0 h-2 w-2 rounded-full bg-primary" />}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.message}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/60">{n.time}</p>
      </div>
    </div>
  );
}
