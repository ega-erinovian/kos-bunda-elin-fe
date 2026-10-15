"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar/navbar";
import { cn } from "@/lib/utils";
import { mobileNavItems, financeNavItems, profileNavItems } from "./consts";
import { BottomActionSheet } from "@/components/ui/bottom-action-sheet";
import { useAuth } from "@/providers/auth-provider";
import { useLogout } from "@/hooks/api/use-auth";

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const logout = useLogout();
  const [financeOpen, setFinanceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setFinanceOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href !== "#" && (pathname === href || pathname.startsWith(href));

  const isFinanceActive = pathname.startsWith("/admin/finance");
  const isProfileActive = pathname === "/admin/profile" || pathname.startsWith("/admin/settings");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />

      <main className="min-h-screen bg-background pb-28 pt-16 md:ml-64 md:pb-8 md:pt-16">
        <div className="mx-auto max-w-300 p-4 md:px-10 md:py-12">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-xl bg-background px-4 py-3 shadow-[0_-4px_20px_-2px_rgba(134,167,137,0.08)] md:hidden">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          let active = isActive(item.href);
          if (item.label === "Finance") active = isFinanceActive;
          if (item.label === "Profile") active = isProfileActive;

          if (item.label === "Finance") {
            return (
              <BottomActionSheet
                key="finance"
                open={financeOpen}
                onOpenChange={setFinanceOpen}
                title="Finance"
                items={financeNavItems.map((f) => ({
                  label: f.label,
                  href: f.href,
                  icon: f.icon,
                }))}
                trigger={
                  <button
                    type="button"
                    className={cn(
                      "flex flex-col items-center justify-center transition-all",
                      active
                        ? "scale-95 rounded-full bg-secondary px-4 py-1.5 text-secondary-foreground"
                        : "text-muted-foreground hover:bg-secondary/50",
                    )}
                    onClick={() => setFinanceOpen(true)}
                  >
                    <Icon className={cn("mb-0.5 h-5 w-5", active && "font-semibold")} />
                    <span className={cn("text-[10px]", active ? "font-semibold" : "")}>{item.label}</span>
                  </button>
                }
              />
            );
          }

          if (item.label === "Profile") {
            const profileItems = profileNavItems.map((p) => {
              if (p.requiresAction) {
                return {
                  label: p.label,
                  icon: p.icon,
                  variant: p.variant,
                  onClick: () => {
                    setProfileOpen(false);
                    logout.mutate();
                  },
                };
              }
              let href = p.href;
              if (href && user?.role) {
                if (!href.startsWith("/admin")) {
                  href = `/${user.role}${href}`;
                }
              }
              return {
                label: p.label,
                href: href,
                icon: p.icon,
                variant: p.variant,
              };
            });

            return (
              <BottomActionSheet
                key="profile"
                open={profileOpen}
                onOpenChange={setProfileOpen}
                title={user?.name ?? "Profile"}
                subtitle={user?.email}
                items={profileItems}
                trigger={
                  <button
                    type="button"
                    className={cn(
                      "flex flex-col items-center justify-center transition-all",
                      active
                        ? "scale-95 rounded-full bg-secondary px-4 py-1.5 text-secondary-foreground"
                        : "text-muted-foreground hover:bg-secondary/50",
                    )}
                    onClick={() => setProfileOpen(true)}
                  >
                    <Icon className={cn("mb-0.5 h-5 w-5", active && "font-semibold")} />
                    <span className={cn("text-[10px]", active ? "font-semibold" : "")}>{item.label}</span>
                  </button>
                }
              />
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center transition-all",
                active
                  ? "scale-95 rounded-full bg-secondary px-4 py-1.5 text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50",
              )}
            >
              <Icon className={cn("mb-0.5 h-5 w-5", active && "font-semibold")} />
              <span className={cn("text-[10px]", active ? "font-semibold" : "")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
