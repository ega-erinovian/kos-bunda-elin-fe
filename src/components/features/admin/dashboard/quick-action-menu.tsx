"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TenantFormDialog } from "@/components/features/admin/tenant/components/TenantFormDialog";
import { ChevronDown, Plus, StickyNotePlus, UserPlus } from "lucide-react";

export function QuickActionMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tenantFormOpen, setTenantFormOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          render={
            <button className="flex w-full cursor-pointer items-center justify-center gap-4 rounded-xl bg-primary-container px-6 py-3 text-label-md shadow-sm transition-colors hover:bg-primary/90 text-white md:w-auto" />
          }
        >
          <Plus className="h-5 w-5" />
          Aksi Cepat
          <ChevronDown className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-xl p-1">
          <DropdownMenuItem
            className="cursor-pointer rounded-lg px-4 py-3 text-label-md"
            onClick={() => setTenantFormOpen(true)}
          >
            <UserPlus /> Tambah Penghuni
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer rounded-lg px-4 py-3 text-label-md"
            onClick={() => {
              setOpen(false);
              router.push("/admin/payments/tagihan-menunggu");
            }}
          >
            <StickyNotePlus /> Catat Pembayaran
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TenantFormDialog open={tenantFormOpen} onOpenChange={setTenantFormOpen} />
    </>
  );
}
