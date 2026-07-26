"use client";

import { activities } from "./consts";
import { ActivityItem } from "./activity-feed/activity-item";

export function ActivityFeedDesktop() {
  return (
    <div className="rounded-3xl bg-surface p-6 shadow-ambient-md lg:col-span-2">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-heading-md text-on-surface">Aktivitas Terbaru</h2>
        <button className="cursor-pointer text-label-md text-primary hover:underline">Lihat Semua</button>
      </div>
      <div className="space-y-4">
        {activities.map((a, i) => (
          <ActivityItem key={i} {...a} />
        ))}
      </div>
    </div>
  );
}
