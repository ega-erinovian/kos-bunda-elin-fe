"use client";

import { Bell, CircleUser } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-background px-4 shadow-ambient-sm md:hidden">
      <h1 className="font-heading text-heading-md font-bold text-primary">KosCare</h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full text-primary" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full text-primary" aria-label="Profile">
          <CircleUser className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
