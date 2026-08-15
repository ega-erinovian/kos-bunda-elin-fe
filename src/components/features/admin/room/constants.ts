import type { FilterOption, RoomStatus } from "./types";

export const PAGE_SIZE = 5;

export const statusConfig = {
  terisi: {
    badge: "bg-red-100 text-red-600",
    dot: "bg-red-600",
    label: "Terisi",
  },
  kosong: {
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-700",
    label: "Kosong",
  },
  nonaktif: {
    badge: "bg-surface-variant text-on-surface-variant",
    dot: "bg-outline",
    label: "Perbaikan",
  },
} as const;

export const statusFilterOptions: { key: FilterOption; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "terisi", label: "Terisi" },
  { key: "kosong", label: "Kosong" },
  { key: "nonaktif", label: "Non-Aktif" },
];

export const floorSelectOptions: { key: string; label: string }[] = [
  { key: "1", label: "Lantai 1" },
  { key: "2", label: "Lantai 2" },
];

export const statusSelectOptions: { key: RoomStatus; label: string }[] = [
  { key: "kosong", label: "Kosong" },
  { key: "terisi", label: "Terisi" },
  { key: "nonaktif", label: "Non-Aktif" },
];
