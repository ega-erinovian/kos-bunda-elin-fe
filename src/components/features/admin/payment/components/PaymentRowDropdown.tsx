"use client";

import { MoreHorizontal, Check, Bell, Info, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Payment } from "../types";

type PaymentRowDropdownProps = {
  payment: Payment;
};

export function PaymentRowDropdown({ payment }: PaymentRowDropdownProps) {
  const isPaid = payment.status === "paid";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary data-open:bg-primary/10 data-open:text-primary">
        <MoreHorizontal className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {isPaid ? (
          <DropdownMenuItem onClick={() => console.log("View details:", payment.id)}>
            <Info className="h-4 w-4" />
            Detail Pembayaran
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={() => console.log("Mark paid:", payment.id)}>
              <Check className="h-4 w-4" />
              Tandai Lunas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Send reminder:", payment.id)}>
              <Bell className="h-4 w-4" />
              Kirim Pengingat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("View details:", payment.id)}>
              <Info className="h-4 w-4" />
              Detail Pembayaran
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => console.log("Edit:", payment.id)}>
              <Pencil className="h-4 w-4" />
              Edit Tagihan
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => console.log("Delete:", payment.id)}>
              <Trash2 className="h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
