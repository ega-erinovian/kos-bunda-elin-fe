"use client";

import type { LucideIcon } from "lucide-react";

interface MobileMetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconWrapper: string;
  className: string;
  accent?: boolean;
}

interface DesktopMetricCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  iconWrapper: string;
  decorColor?: string;
  progress?: number;
  danger?: boolean;
}

export function MobileMetricCard({
  label,
  value,
  icon: Icon,
  iconWrapper,
  className,
  accent,
}: MobileMetricCardProps) {
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-xl p-6 transition-all duration-300 ${className}`}
      style={!accent ? { boxShadow: "0 4px 20px -2px rgba(134, 167, 137, 0.08)" } : {}}
    >
      {accent && (
        <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      )}
      <div className="relative z-10 flex items-start justify-between">
        <div className={`rounded-full p-2 ${iconWrapper}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="relative z-10 mt-2">
        <p className="font-heading text-heading-xl mb-1">{value}</p>
        <p className={`text-sm ${accent ? "opacity-90" : "text-muted-foreground"}`}>{label}</p>
      </div>
    </div>
  );
}

export function DesktopMetricCard({
  label,
  value,
  sub,
  icon: Icon,
  iconWrapper,
  decorColor,
  progress,
  danger,
}: DesktopMetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-transparent bg-surface p-6 shadow-ambient-md transition-colors hover:border-secondary">
      <div
        className={`absolute -right-4 -top-4 h-24 w-24 rounded-bl-[48px] transition-transform group-hover:scale-110 ${decorColor}`}
      />
      <div className="relative">
        <div className="mb-6 flex items-start justify-between">
          <div className={`rounded-xl p-3 ${iconWrapper}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div>
          <h3 className="mb-1 text-body-md text-on-surface-variant">{label}</h3>
          <div className="flex items-end gap-2">
            <span
              className={`font-heading text-heading-lg text-on-surface ${danger ? "text-destructive" : ""}`}
            >
              {value}
            </span>
            {sub && <span className="pb-1 text-body-md text-on-surface-variant">{sub}</span>}
          </div>
        </div>
        {progress !== undefined && (
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-variant">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
