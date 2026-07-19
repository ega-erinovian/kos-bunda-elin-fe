"use client";

import type { LucideIcon } from "lucide-react";

interface ActivityItemProps {
  icon: LucideIcon
  iconWrapper: string
  name: string
  desc: string
  amount: string
  amountClass: string
  time: string
  badge?: string
  badgeClass?: string
}

export function ActivityItem({
  icon: Icon,
  iconWrapper,
  name,
  desc,
  amount,
  amountClass,
  time,
  badge,
  badgeClass,
}: ActivityItemProps) {
  return (
    <div className="flex cursor-pointer items-center justify-between rounded-xl border border-transparent p-4 transition-colors hover:border-surface-variant hover:bg-primary/5">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconWrapper}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-label-md text-on-surface">{name}</p>
          <p className="text-label-sm text-on-surface-variant">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-right">
        {badge && (
          <span className={`rounded px-2 py-1 text-label-sm ${badgeClass}`}>
            {badge}
          </span>
        )}
        <div>
          <p className={`text-label-md font-semibold ${amountClass}`}>{amount}</p>
          <p className="text-label-sm text-on-surface-variant">{time}</p>
        </div>
      </div>
    </div>
  );
}
