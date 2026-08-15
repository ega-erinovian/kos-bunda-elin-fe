"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, CheckCheck, Clock, DoorOpen, Megaphone, UserPlus } from "lucide-react";
import { useState } from "react";
import { NotificationDropdownItem } from "./NotificationDropdownItem";
import { initialNotifications } from "./consts";

export interface Notification {
  id: string;
  type: "new_tenant" | "payment_due" | "broadcast" | "check_in";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const notificationIcons: Record<
  Notification["type"],
  { icon: React.ReactNode; bg: string }
> = {
  new_tenant: {
    icon: <UserPlus className="h-4 w-4 text-primary" />,
    bg: "bg-primary-container/30",
  },
  payment_due: { icon: <Clock className="h-4 w-4 text-destructive" />, bg: "bg-destructive/10" },
  broadcast: { icon: <Megaphone className="h-4 w-4 text-accent" />, bg: "bg-accent/20" },
  check_in: { icon: <DoorOpen className="h-4 w-4 text-tertiary" />, bg: "bg-tertiary/20" },
};

export function NotificationSection() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <button
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer"
            aria-label="Notifications"
          />
        }
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold leading-none text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        alignOffset={-4}
        sideOffset={12}
        className="w-90 rounded-xl p-0 shadow-lg"
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h2 className="text-sm font-semibold text-foreground">Notifikasi</h2>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Tandai Semua Dibaca
            </button>
          )}
        </div>

        <DropdownMenuSeparator className="mx-4 my-0" />

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Bell className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Tidak ada notifikasi</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <NotificationDropdownItem key={n.id} notification={n} />
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
