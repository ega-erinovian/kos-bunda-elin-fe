"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { House, CreditCard, LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background">
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
                    buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                    "h-auto gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex-1" />
          <p className="text-xs text-muted-foreground">{user?.name}</p>
          <Button variant="ghost" size="icon" onClick={() => logout.mutate()}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-2xl p-4">{children}</main>
    </div>
  );
}
