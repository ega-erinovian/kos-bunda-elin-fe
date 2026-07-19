"use client";

import { CircleUser, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationSection } from "./NotificationSection";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-background px-4 shadow-ambient-sm md:left-64 md:w-[calc(100%-16rem)]">
      <div className="flex items-center gap-3 md:hidden">
        <h1 className="font-heading text-heading-md font-bold text-primary">KosCare</h1>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-xl border border-border bg-background pl-9 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationSection />
        <Button variant="ghost" size="icon" className="rounded-full text-primary" aria-label="Profile">
          <CircleUser className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
