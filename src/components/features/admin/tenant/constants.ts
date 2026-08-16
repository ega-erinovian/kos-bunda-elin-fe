import type { FilterOption } from "./types";

export const PAGE_SIZE = 5;

export const filterOptions: { key: FilterOption; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "aktif", label: "Aktif" },
  { key: "nonaktif", label: "Tidak Aktif" },
];
