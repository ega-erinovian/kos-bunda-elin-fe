import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { Tenant } from "../types"
import { TenantDetailContent } from "./TenantDetailContent"

type TenantDetailDialogProps = {
  tenant: Tenant | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TenantDetailDialog({
  tenant,
  open,
  onOpenChange,
}: TenantDetailDialogProps) {
  if (!tenant) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <div className="max-h-[80vh] overflow-y-auto p-6">
          <TenantDetailContent tenant={tenant} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
