import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeVariant = "BELUM_BAYAR" | "SEBAGIAN" | "LUNAS" | "TERLAMBAT";

interface StatusBadgeProps {
  status: StatusBadgeVariant;
  className?: string;
}

const statusConfig: Record<
  StatusBadgeVariant,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  BELUM_BAYAR: {
    label: "Belum Bayar",
    variant: "secondary",
  },
  SEBAGIAN: {
    label: "Sebagian",
    variant: "secondary",
  },
  LUNAS: {
    label: "Lunas",
    variant: "default",
  },
  TERLAMBAT: {
    label: "Terlambat",
    variant: "destructive",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  );
}
