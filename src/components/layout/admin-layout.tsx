"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { cn } from "@/lib/utils";
import {
  Users,
  History,
  Home,
  User,
} from "lucide-react";

const mobileNavItems = [
  { href: "/admin/dashboard", label: "Home", icon: Home },
  { href: "/admin/tenants", label: "Tenants", icon: Users },
  { href: "/admin/payments", label: "History", icon: History },
  { href: "#", label: "Profile", icon: User },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href !== "#" && (pathname === href || pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />

      <main className="min-h-screen bg-background pb-28 pt-16 md:ml-64 md:pb-8 md:pt-0">
        <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-10 md:py-12">
          {children}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-xl bg-background px-4 py-3 shadow-[0_-4px_20px_-2px_rgba(134,167,137,0.08)] md:hidden">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center transition-all",
                active
                  ? "scale-95 rounded-full bg-secondary px-4 py-1.5 text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              <Icon
                className={cn(
                  "mb-0.5 h-5 w-5",
                  active && "font-semibold"
                )}
              />
              <span
                className={cn(
                  "text-[10px]",
                  active ? "font-semibold" : ""
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
