"use client";

import { useState } from "react";
import { DoorOpen, Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTenant, useMarkTenantKeluar } from "@/hooks/api/use-tenants";
import { Skeleton } from "@/components/ui/skeleton";
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

  const style = isActive
    ? {
        label: "Aktif",
        classes: "bg-primary/10 text-primary",
        statusClasses: "bg-primary/90",
      }
    : {
        label: "Tidak Aktif",
        classes: "bg-surface-variant text-on-surface-variant",
        statusClasses: "bg-outline",
      };

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

      <div
        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-label-sm ${style.classes}`}
      >
        <span className={`h-2 w-2 rounded-full ${style.statusClasses}`} />
        {style.label}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-surface-variant/50 bg-surface-container-low p-4">
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Tanggal Masuk</span>
          <span className="text-body-md text-on-surface">
            {formatDate(tenant.tanggalMulaiSewa)}
          </span>
        </div>
        <hr className="border-outline-variant/30" />
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">No. Telepon</span>
          <span className="text-body-md text-on-surface">{tenant.noHp}</span>
        </div>
        <hr className="border-outline-variant/30" />
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Sewa Per Bulan</span>
          <span className="text-body-md text-on-surface">
            {formatCurrency(Number(tenant.nominalSewa))}
          </span>
        </div>
        <hr className="border-outline-variant/30" />
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Jatuh Tempo</span>
          <span className="text-body-md text-on-surface">Tanggal {tenant.tanggalJatuhTempo}</span>
        </div>
        {tenant.tanggalKeluar && (
          <>
            <hr className="border-outline-variant/30" />
            <div className="flex items-center justify-between">
              <span className="text-label-md text-on-surface-variant">Tanggal Keluar</span>
              <span className="text-body-md text-on-surface">
                {formatDate(tenant.tanggalKeluar)}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-3">
        <Button
          onClick={() => onEdit(tenant.id)}
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
