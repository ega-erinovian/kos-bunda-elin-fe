"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  WhatsAppComposer,
  type WhatsAppRequest,
} from "@/components/features/whatsapp/WhatsAppComposer";
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
  const [wa, setWa] = useState<WhatsAppRequest | null>(null);

  if (!tenantId) return null;

  function handleWaOpen(req: WhatsAppRequest) {
    setWa(req);
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0">
          <div className="max-h-[80vh] overflow-y-auto p-6">
            <TenantDetailContent tenantId={tenantId} onEdit={onEdit} onWaOpen={handleWaOpen} />
          </div>
        </DialogContent>
      </Dialog>
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
