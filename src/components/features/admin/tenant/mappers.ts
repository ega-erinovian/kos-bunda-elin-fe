import type { Tenant as ApiTenant } from "@/types";
import { formatDate } from "@/lib/utils";
import type { Tenant } from "./types";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getNextDueDate(dayOfMonth: number): string {
  const now = new Date();
  let due = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  if (due <= now) due = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
  return formatDate(due);
}

export function mapTenant(tenant: ApiTenant): Tenant {
  const dueDate = tenant.aktif ? getNextDueDate(tenant.tanggalJatuhTempo) : "-";

  return {
    id: tenant.id,
    name: tenant.nama,
    initials: getInitials(tenant.nama),
    phone: tenant.noHp,
    room: tenant.kamar?.nomor ?? "-",
    checkInDate: formatDate(tenant.tanggalMulaiSewa),
    rentCost: Number(tenant.nominalSewa),
    dueDate,
    dueLabel: tenant.aktif ? dueDate : "Tidak Aktif",
    dueVariant: tenant.aktif ? "secondary" : "outline",
    aktif: tenant.aktif,
  };
}
