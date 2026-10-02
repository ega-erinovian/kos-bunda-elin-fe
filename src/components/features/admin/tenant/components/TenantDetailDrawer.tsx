"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import {
  WhatsAppComposer,
  type WhatsAppRequest,
} from "@/components/features/whatsapp/WhatsAppComposer";
import { TenantDetailContent } from "./TenantDetailContent";

type TenantDetailDrawerProps = {
  tenantId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (id: string) => void;
};

export function TenantDetailDrawer({
  tenantId,
  open,
  onOpenChange,
  onEdit,
}: TenantDetailDrawerProps) {
  const [wa, setWa] = useState<WhatsAppRequest | null>(null);

  if (!tenantId) return null;

  function handleWaOpen(req: WhatsAppRequest) {
    setWa(req);
    onOpenChange(false);
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle swipeDirection="down">
        <DrawerContent className="rounded-t-4xl px-4 pb-8">
          <DrawerHeader className="px-0">
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-surface-variant" />
          </DrawerHeader>
          <TenantDetailContent tenantId={tenantId} onEdit={onEdit} onWaOpen={handleWaOpen} />
        </DrawerContent>
      </Drawer>
      {wa && (
        <WhatsAppComposer
          open
          onOpenChange={(o) => {
            if (!o) setWa(null);
          }}
          phone={wa.phone}
          vars={wa.vars}
          defaultTemplateId={wa.templateId}
          title={wa.title}
        />
      )}
    </>
  );
}
