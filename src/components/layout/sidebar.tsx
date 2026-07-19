"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  DoorOpen,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Megaphone,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/api/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/admin/tenants", label: "Tenants", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "#", label: "Broadcasts", icon: Megaphone },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useLogout();

  const isActive = (href: string) =>
    href !== "#" && (pathname === href || pathname.startsWith(href + "/"));

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-border bg-sidebar p-6 md:flex">
      <div className="mb-8 flex items-center gap-4 px-2">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary text-primary-foreground text-base font-bold">
            KC
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-heading text-base font-bold text-primary">KosCare Admin</p>
          <p className="text-xs text-muted-foreground">Superuser</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mb-6 mt-auto">
        <Button className="w-full rounded-2xl py-5 shadow-ambient-md">
          <Plus className="h-[18px] w-[18px]" />
          New Entry
        </Button>
      </div>

      <div className="flex flex-col gap-1 border-t border-border pt-4">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <button
          onClick={() => logout.mutate()}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
