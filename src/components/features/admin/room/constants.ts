import type { Room, FilterOption, FloorFilter } from "./types";

export const PAGE_SIZE = 5;

export const statusConfig = {
  terisi: {
    badge: "bg-primary/10 text-primary",
    dot: "bg-primary",
    label: "Terisi",
  },
  kosong: {
    badge: "bg-secondary-container text-on-secondary-container",
    dot: "bg-secondary",
    label: "Kosong",
  },
  perbaikan: {
    badge: "bg-surface-variant text-on-surface-variant",
    dot: "bg-outline",
    label: "Perbaikan",
  },
} as const;

export const statusFilterOptions: { key: FilterOption; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "terisi", label: "Terisi" },
  { key: "kosong", label: "Kosong" },
  { key: "perbaikan", label: "Perbaikan" },
];

export const floorFilterOptions: { key: FloorFilter; label: string }[] = [
  { key: "semua", label: "Semua Lantai" },
  { key: 1, label: "Lantai 1" },
  { key: 2, label: "Lantai 2" },
  { key: 3, label: "Lantai 3" },
];

export const dummyRooms: Room[] = [
  {
    id: "1",
    number: "101",
    floor: 1,
    price: 1500000,
    status: "terisi",
    tenant: { name: "Sarah Jenkins", initials: "SJ" },
  },
  {
    id: "2",
    number: "102",
    floor: 1,
    price: 1500000,
    status: "kosong",
  },
  {
    id: "3",
    number: "201",
    floor: 2,
    price: 1750000,
    status: "perbaikan",
  },
  {
    id: "4",
    number: "103",
    floor: 1,
    price: 1500000,
    status: "kosong",
  },
  {
    id: "5",
    number: "202",
    floor: 2,
    price: 1750000,
    status: "terisi",
    tenant: { name: "Budi Santoso", initials: "BS" },
  },
  {
    id: "6",
    number: "301",
    floor: 3,
    price: 2000000,
    status: "kosong",
  },
];
