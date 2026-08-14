import { DoorOpen, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Room } from "../types";
import { StatusBadge } from "./StatusBadge";

export function DesktopRoomRow({ room }: { room: Room }) {
  const isMaintenance = room.status === "nonaktif";
  const hasTenant = room.status === "terisi" && room.tenant;

  const iconBg = {
    terisi: "bg-secondary-container text-on-secondary-container",
    kosong: "bg-surface-container text-on-surface-variant",
    nonaktif: "bg-surface-container-highest text-on-surface-variant",
  }[room.status];

  return (
    <div className="flex flex-col gap-4 border-t border-border/30 px-6 py-4 transition-colors hover:bg-muted/30 md:flex-row md:items-center md:gap-0">
      <div className="flex w-56 items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          <DoorOpen className="h-5 w-5" />
        </div>
        <span className="text-sm font-semibold text-on-surface">Kamar {room.number}</span>
      </div>

      <div className="w-100 wrap-break-word text-sm text-on-surface">
        {hasTenant ? room.tenant!.name : <span className="text-on-surface-variant">-</span>}
      </div>

      <div className="w-24 text-sm text-on-surface">Lantai {room.floor}</div>

      <div className="w-36 text-sm text-on-surface">{formatCurrency(room.price)}</div>

      <div className="w-28">
        <StatusBadge status={room.status} />
      </div>

      <div className="flex w-full justify-end gap-2 md:w-24">
        <button
          className="cursor-pointer rounded-lg p-2 text-on-surface-variant transition-colors hover:text-primary"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          className="cursor-pointer rounded-lg p-2 text-on-surface-variant transition-colors hover:text-destructive"
          title="Hapus"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
