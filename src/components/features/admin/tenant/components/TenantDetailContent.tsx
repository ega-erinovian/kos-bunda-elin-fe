"use client";

import { useState } from "react";
import { DoorOpen, MessageCircle, Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { WhatsAppComposer } from "@/components/features/whatsapp/WhatsAppComposer";
import { tenantToWhatsAppVars } from "@/lib/whatsapp";
import { useTenant, useMarkTenantKeluar } from "@/hooks/api/use-tenants";
import { Skeleton } from "@/components/ui/skeleton";
import { TenantDetailContentItem } from "./TenantDetailContentItem";
import { MobileTenantCardActiveBadge } from "./MobileTenantCardActiveBadge";
import toast from "react-hot-toast";

type TenantDetailContentProps = {
  tenantId: string;
  onEdit: (id: string) => void;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TenantDetailContent({ tenantId, onEdit }: TenantDetailContentProps) {
  const { data, isLoading, isError } = useTenant(tenantId);
  const { mutate: markKeluar, isPending: isMarkingKeluar } = useMarkTenantKeluar();
  const [keluarDialogOpen, setKeluarDialogOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);

  const tenantForWa = data?.data ?? null;
  const waVars = tenantForWa ? tenantToWhatsAppVars(tenantForWa) : null;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-32 rounded-full" />
        <div className="space-y-3 rounded-2xl border border-surface-variant/50 bg-surface-container-low p-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="py-12 text-center">
        <p className="text-body-md text-on-surface-variant">
          Gagal memuat detail penghuni. Silakan coba lagi.
        </p>
      </div>
    );
  }

  const tenant = data.data;
  const initials = getInitials(tenant.nama);
  const isActive = tenant.aktif;

  function handleMarkKeluar() {
    markKeluar(
      { id: tenant.id },
      {
        onSuccess: () => {
          toast.success(`${tenant.nama} telah diset keluar.`);
          setKeluarDialogOpen(false);
        },
        onError: () => {
          toast.error("Gagal set keluar. Silakan coba lagi.");
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center">
            <h2 className="text-heading-md font-semibold text-on-surface">{tenant.nama}</h2>
            <span className="mt-1 flex items-center gap-1 text-label-md text-on-surface-variant">
              <DoorOpen className="h-4 w-4" />
              Kamar {tenant.kamar?.nomor ?? "-"}
            </span>
          </div>
        </div>
      </div>

      <MobileTenantCardActiveBadge aktif={isActive} />

      <div className="flex flex-col gap-3 rounded-2xl border border-surface-variant/50 bg-surface-container-low p-4">
        <TenantDetailContentItem
          label="Tanggal Masuk"
          value={formatDate(tenant.tanggalMulaiSewa)}
        />
        <TenantDetailContentItem label="No. Telepon" value={tenant.noHp} showDivider />
        <TenantDetailContentItem
          label="Sewa Per Bulan"
          value={formatCurrency(Number(tenant.nominalSewa))}
          showDivider
        />
        <TenantDetailContentItem
          label="Jatuh Tempo"
          value={`Tanggal ${tenant.tanggalJatuhTempo}`}
          showDivider
        />
        {tenant.tanggalKeluar && (
          <TenantDetailContentItem
            label="Tanggal Keluar"
            value={formatDate(tenant.tanggalKeluar)}
            showDivider
          />
        )}
      </div>

      <div className="mt-2 flex flex-col gap-3">
        <Button
          onClick={() => setWaOpen(true)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-whatsapp text-white hover:bg-whatsapp-hover focus-visible:ring-whatsapp/30"
        >
          <MessageCircle className="h-4 w-4" />
          Kirim WhatsApp
        </Button>
        <Button
          onClick={() => onEdit(tenant.id)}
          variant="outline"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl"
        >
          <Pencil className="h-4 w-4" />
          Edit Data Penghuni
        </Button>
        {isActive && (
          <Button
            variant="destructive"
            onClick={() => setKeluarDialogOpen(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl"
          >
            <DoorOpen className="h-4 w-4" />
            Set Keluar
          </Button>
        )}
      </div>

      {waVars && (
        <WhatsAppComposer
          open={waOpen}
          onOpenChange={setWaOpen}
          phone={tenant.noHp}
          vars={waVars}
          defaultTemplateId="sapaan_umum"
          title={`WhatsApp — ${tenant.nama}`}
        />
      )}

      <DeleteAlertDialog
        open={keluarDialogOpen}
        onOpenChange={setKeluarDialogOpen}
        title="Set Penghuni Keluar"
        description={`${tenant.nama} akan diset keluar dari kamar ${tenant.kamar?.nomor ?? "-"}. Status penghuni akan berubah menjadi tidak aktif. Lanjutkan?`}
        confirmLabel="Set Keluar"
        isPending={isMarkingKeluar}
        onConfirm={handleMarkKeluar}
      />
    </div>
  );
}
