"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetOverlay } from "./sheet";
import { cn } from "@/lib/utils";

export interface BottomActionSheetItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  variant?: "default" | "destructive";
}

export interface BottomActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  items: BottomActionSheetItem[];
  trigger: React.ReactNode;
  onItemClick?: (item: BottomActionSheetItem) => void;
}

export function BottomActionSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  items,
  trigger,
  onItemClick,
}: BottomActionSheetProps) {
  const router = useRouter();

  const handleItemClick = (item: BottomActionSheetItem) => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      onOpenChange(false);
    }
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger}
      <SheetOverlay className="fixed inset-0 z-50 bg-black/60 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <SheetContent side="bottom" showCloseButton={false} className="rounded-t-xl border-t border-border bg-background p-6 shadow-ambient-lg">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
        <SheetHeader className="mb-4 text-left">
          <SheetTitle className="font-heading text-base font-semibold text-foreground">
            {title}
          </SheetTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </SheetHeader>
        <div className="flex flex-col gap-2">
          {items.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <>
                <Icon
                  className={cn(
                    "h-5 w-5",
                    item.variant === "destructive" ? "text-destructive" : "text-on-surface-variant",
                  )}
                />
                <span
                  className={cn(
                    "text-label-md",
                    item.variant === "destructive" ? "text-destructive" : "text-on-surface",
                  )}
                >
                  {item.label}
                </span>
              </>
            );

            if (item.href && !item.onClick) {
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex animate-stagger-in items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-secondary/50",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleItemClick(item)}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={index}
                type="button"
                className={cn(
                  "flex animate-stagger-in items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-secondary/50",
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleItemClick(item)}
              >
                {content}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
