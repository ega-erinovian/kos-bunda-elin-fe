"use client";

import { Bell, CircleUser } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-background px-4 shadow-ambient-sm md:hidden">
      <h1 className="font-heading text-heading-md font-bold text-primary">
        KosCare
      </h1>
      <div className="flex items-center gap-2">
        <button className="rounded-full p-2 text-primary transition-colors hover:bg-primary/5">
          <Bell className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-primary transition-colors hover:bg-primary/5">
          <CircleUser className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
