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
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-border bg-sidebar p-6 md:flex">
      <div className="mb-8 flex items-center gap-4 px-2 border-b border-border pb-4">
        <div>
          <p className="font-heading text-2xl font-bold text-primary">KosCare Admin</p>
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

      <div className="mb-6 mt-auto">
        <Button className="w-full rounded-2xl py-5 shadow-ambient-md">
          <Plus className="h-4.5 w-4.5" />
          New Entry
        </Button>
      </div>

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
    </aside>
  );
}
