import { DoorOpen, Pencil } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { Tenant } from "../types"
import { getStatusKey } from "../constants"

type TenantDetailContentProps = {
  tenant: Tenant
}

const statusLabelMap: Record<string, { label: string; classes: string, statusClasses: string }> = {
  lunas: {
    label: "Lunas",
    classes: "bg-primary/10 text-primary",
    statusClasses: "bg-primary/90"
  },
  telat: {
    label: "Telat",
    classes: "bg-error-container/50 text-on-error-container",
    statusClasses: "bg-red-600/90"
  },
  menunggak: {
    label: "Menunggak",
    classes: "bg-tertiary/10 text-tertiary",
    statusClasses: "bg-tertiary/90"
  },
}

export function TenantDetailContent({ tenant }: TenantDetailContentProps) {
  const statusKey = getStatusKey(tenant.dueVariant)
  const style = statusLabelMap[statusKey]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">{tenant.initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center">
            <h2 className="text-heading-md font-semibold text-on-surface">
              {tenant.name}
            </h2>
            <span className="mt-1 flex items-center gap-1 text-label-md text-on-surface-variant">
              <DoorOpen className="h-4 w-4" />
              Kamar {tenant.room}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-label-sm ${style.classes}`}
      >
        <span className={`h-2 w-2 rounded-full ${style.statusClasses}`} />
        {style.label}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-surface-variant/50 bg-surface-container-low p-4">
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Tanggal Masuk</span>
          <span className="text-body-md text-on-surface">{tenant.checkInDate}</span>
        </div>
        <hr className="border-outline-variant/30" />
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">No. Telepon</span>
          <span className="text-body-md text-on-surface">{tenant.phone}</span>
        </div>
        <hr className="border-outline-variant/30" />
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Sewa Per Bulan</span>
          <span className="text-body-md text-on-surface">
            {formatCurrency(tenant.rentCost)}
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-3">
        <Button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl">
          <Pencil className="h-4 w-4" />
          Edit Data Penghuni
        </Button>
        <Button
          variant="destructive"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl"
        >
          <DoorOpen className="h-4 w-4" />
          Set Keluar
        </Button>
      </div>
    </div>
  )
}
