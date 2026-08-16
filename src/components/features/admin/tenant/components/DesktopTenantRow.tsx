import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Tenant } from "../types";

type DesktopTenantRowProps = {
  tenant: Tenant;
  onDetailClick: () => void;
  onEdit: () => void;
  onSetKeluar: () => void;
};

export function DesktopTenantRow({
  tenant,
  onDetailClick,
  onEdit,
  onSetKeluar,
}: DesktopTenantRowProps) {
  const dueBadgeVariant = {
    default: "default" as const,
    secondary: "secondary" as const,
    destructive: "destructive" as const,
    outline: "outline" as const,
  }[tenant.dueVariant];

  return (
    <div className="flex flex-col gap-4 border-t border-border/30 px-6 py-4 transition-colors hover:bg-muted/30 md:flex-row md:items-center md:gap-0">
      <div className="w-64">
        <button
          onClick={onDetailClick}
          className="flex cursor-pointer items-center gap-3 text-left"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
            {tenant.initials}
          </div>
          <span className="text-sm font-semibold text-on-surface transition-colors hover:text-primary">
            {tenant.name}
          </span>
        </button>
      </div>

      <div className="w-40 text-sm text-muted-foreground">{tenant.phone}</div>

      <div className="w-24">
        <Badge variant="outline" className="font-medium">
          {tenant.room}
        </Badge>
      </div>

      <div className="w-32 text-sm text-muted-foreground">{tenant.checkInDate}</div>

      <div className="w-32 text-sm text-on-surface">{formatCurrency(tenant.rentCost)}</div>

      <div className="w-44">
        <Badge variant={dueBadgeVariant}>{tenant.dueLabel}</Badge>
      </div>

      <div className="flex w-24 justify-end gap-2">
        <button
          onClick={onEdit}
          className="cursor-pointer rounded-lg p-2 text-on-surface-variant transition-colors hover:text-primary"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onSetKeluar}
          className="cursor-pointer rounded-lg p-2 text-on-surface-variant transition-colors hover:text-destructive"
          title="Set Keluar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
