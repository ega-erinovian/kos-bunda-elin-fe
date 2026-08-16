import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TenantDetailContent } from "./TenantDetailContent";

type TenantDetailDialogProps = {
  tenantId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (id: string) => void;
};

export function TenantDetailDialog({
  tenantId,
  open,
  onOpenChange,
  onEdit,
}: TenantDetailDialogProps) {
  if (!tenantId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <div className="max-h-[80vh] overflow-y-auto p-6">
          <TenantDetailContent tenantId={tenantId} onEdit={onEdit} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
