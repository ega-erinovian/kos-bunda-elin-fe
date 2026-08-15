import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import type { Tenant } from "../types";
import { TenantDetailContent } from "./TenantDetailContent";

type TenantDetailDrawerProps = {
  tenant: Tenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TenantDetailDrawer({ tenant, open, onOpenChange }: TenantDetailDrawerProps) {
  if (!tenant) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle swipeDirection="down">
      <DrawerContent className="rounded-t-4xl px-4 pb-8">
        <DrawerHeader className="px-0">
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-surface-variant" />
        </DrawerHeader>
        <TenantDetailContent tenant={tenant} />
      </DrawerContent>
    </Drawer>
  );
}
