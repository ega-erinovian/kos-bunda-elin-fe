"use client";

import { activities } from "./consts";

export function ActivityFeedDesktop() {
  return (
    <div className="rounded-3xl bg-surface p-6 shadow-ambient-md lg:col-span-2">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-heading-md text-on-surface">Aktivitas Terbaru</h2>
        <button className="text-label-md text-primary hover:underline">Lihat Semua</button>
      </div>
      <div className="space-y-4">
        {activities.map((a, i) => {
          const Icon = a.icon;
          return (
            <div
              key={i}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-transparent p-4 transition-colors hover:border-surface-variant hover:bg-primary/5"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${a.iconWrapper}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-label-md text-on-surface">{a.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{a.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-right">
                {a.badge && (
                  <span className={`rounded px-2 py-1 text-label-sm ${a.badgeClass}`}>
                    {a.badge}
                  </span>
                )}
                <div>
                  <p className={`text-label-md font-semibold ${a.amountClass}`}>{a.amount}</p>
                  <p className="text-label-sm text-on-surface-variant">{a.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
