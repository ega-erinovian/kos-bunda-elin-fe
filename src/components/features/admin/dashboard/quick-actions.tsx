"use client";

import { ChevronRight, CreditCard, UserPlus } from "lucide-react";
import { quickActions } from "./consts";

export function QuickActionsMobile() {
  return (
    <>
      <section className="space-y-4">
        <h3 className="font-heading text-heading-md">Aksi Cepat</h3>
        <div className="space-y-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="flex w-full items-center justify-between rounded-xl bg-card p-4 text-left transition-colors hover:bg-primary/5"
                style={{
                  boxShadow: "0 4px 20px -2px rgba(134, 167, 137, 0.08)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${action.iconWrapper}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
              </button>
            );
          })}
        </div>
      </section>

      <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-3">
        <button className="flex items-center justify-center rounded-full bg-secondary p-4 text-secondary-foreground shadow-lg transition-transform hover:scale-105">
          <UserPlus className="h-5 w-5" />
        </button>
        <button className="flex items-center justify-center rounded-full bg-primary p-4 text-primary-foreground shadow-lg transition-transform hover:scale-105">
          <CreditCard className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
