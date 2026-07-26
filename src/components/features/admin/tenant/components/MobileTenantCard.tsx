import { ChevronRight } from "lucide-react"
import type { Tenant } from "../types"

type MobileTenantCardProps = {
  tenant: Tenant
  onClick: (tenant: Tenant) => void
}

export function MobileTenantCard({ tenant, onClick }: MobileTenantCardProps) {
  const isLate = tenant.dueVariant === "destructive"

  return (
    <article
      onClick={() => onClick(tenant)}
      className="relative flex cursor-pointer items-center justify-between rounded-xl bg-surface-container-lowest p-4 shadow-[0_4px_20px_-2px_rgba(134,167,137,0.08)] transition-all hover:border-secondary-container active:scale-[0.98]"
    >
      {isLate && (
        <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-error" />
      )}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {tenant.initials}
        </div>
        <div className="flex flex-col">
          <span className="text-body-md font-semibold text-on-surface">
            {tenant.name}
          </span>
          <span className="text-label-sm text-on-surface-variant">
            Kamar {tenant.room}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${isLate ? "bg-error" : "bg-primary"}`} />
        <ChevronRight className="h-4 w-4 text-on-surface-variant/50" />
      </div>
    </article>
  )
}
