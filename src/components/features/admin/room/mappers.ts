import type { Room as ApiRoom } from "@/types";
import type { Room, RoomStatus } from "./types";

const STATUS_MAP: Record<ApiRoom["status"], RoomStatus> = {
  KOSONG: "kosong",
  TERISI: "terisi",
  NONAKTIF: "nonaktif",
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function mapRoom(room: ApiRoom): Room {
  const tenant = room.penyewa?.[0];

  return {
    id: room.id,
    number: room.nomor,
    floor: Number(room.lantai) || 1,
    price: room.harga,
    status: STATUS_MAP[room.status],
    tenant: tenant ? { name: tenant.nama, initials: getInitials(tenant.nama) } : undefined,
  };
}
