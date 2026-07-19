"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  DoorOpen,
  Users,
  CreditCard,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "Kamar", icon: DoorOpen },
  { href: "/admin/tenants", label: "Penghuni", icon: Users },
  { href: "/admin/payments", label: "Pembayaran", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-white shrink-0">
      <div className="p-6">
        <h1 className="text-lg font-bold">Kos Bunda Elin</h1>
        <p className="text-sm text-slate-400 mt-1">Panel Admin</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white"
          onClick={() => logout.mutate()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Keluar
        </Button>
      </div>
    </aside>
  );
}
