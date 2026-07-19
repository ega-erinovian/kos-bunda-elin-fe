"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { House, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/api/use-auth";
import { useAuth } from "@/providers/auth-provider";
import { type ReactNode } from "react";

const navItems = [
  { href: "/tenant/dashboard", label: "Tagihan Saya", icon: House },
  { href: "/tenant/payments", label: "Riwayat", icon: CreditCard },
];

export function TenantLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const logout = useLogout();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-4 px-4">
          <Link href="/tenant/dashboard" className="font-bold text-sm">
            Kos Bunda Elin
          </Link>
          <nav className="flex items-center gap-1 ml-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:text-slate-900",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex-1" />
          <p className="text-xs text-slate-500">{user?.name}</p>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => logout.mutate()}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-2xl p-4">{children}</main>
    </div>
  );
}
