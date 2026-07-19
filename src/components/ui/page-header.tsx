"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string
  subtitle?: string | ReactNode
  greeting?: string
  backHref?: string
  children?: ReactNode
}

export function PageHeader({
  title,
  subtitle,
  greeting,
  backHref,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className={backHref ? "flex items-center gap-4" : ""}>
        {backHref && (
          <Link href={backHref}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <div>
          {greeting && (
            <p className="text-sm text-muted-foreground">{greeting}</p>
          )}
          <h1 className="font-heading text-heading-lg-mobile text-on-surface md:text-heading-lg">
            {title}
          </h1>
          {subtitle && (
            typeof subtitle === "string"
              ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              : subtitle
          )}
        </div>
      </div>
      {children && (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center md:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}
