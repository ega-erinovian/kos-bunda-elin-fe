"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLogout } from "@/hooks/api/use-auth";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Plus,
  Settings
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./consts";

export function Sidebar() {
  const pathname = usePathname();
  const logout = useLogout();

  const isActive = (href: string) =>
    href !== "#" && (pathname === href || pathname.startsWith(href + "/"));

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="font-heading text-lg font-bold text-primary">KosCare Admin</h1>
      </div>

      <nav className="flex flex-1 flex-col gap-2 px-6 pt-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                buttonVariants({ variant: active ? "default" : "ghost" }),
                "w-full justify-start gap-3 rounded-xl",
                !active && "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-6 pb-6">
        <Button className="w-full rounded-2xl py-5 shadow-ambient-md">
          <Plus className="h-4.5 w-4.5" />
          New Entry
        </Button>

        <Separator className="my-4" />
        <div className="flex flex-col gap-1">
          <Link
            href="#"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start gap-3 rounded-xl text-muted-foreground",
            )}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <Button
            variant="ghost"
            onClick={() => logout.mutate()}
            className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
