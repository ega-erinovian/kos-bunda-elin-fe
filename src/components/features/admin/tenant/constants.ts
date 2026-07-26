import type { Tenant, FilterOption } from "./types"

export const PAGE_SIZE = 5

export const statusConfig: Record<string, { badge: string; dot: string; label: string }> = {
  lunas: {
    badge: "bg-primary-fixed text-on-primary-fixed-variant",
    dot: "bg-primary",
    label: "Lunas",
  },
  telat: {
    badge: "bg-error-container text-on-error-container",
    dot: "bg-error",
    label: "Telat",
  },
  menunggak: {
    badge: "bg-secondary-fixed text-on-secondary-fixed-variant",
    dot: "bg-secondary",
    label: "Menunggak",
  },
}

export function getStatusKey(variant: Tenant["dueVariant"]): "lunas" | "telat" | "menunggak" {
  if (variant === "default") return "lunas"
  if (variant === "destructive") return "telat"
  return "menunggak"
}

export const filterOptions: { key: FilterOption; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "lunas", label: "Lunas" },
  { key: "telat", label: "Telat" },
  { key: "menunggak", label: "Menunggak" },
]

export const dummyTenants: Tenant[] = [
  {
    id: "1",
    name: "Ayu Saraswati",
    initials: "AS",
    phone: "0812-3456-7890",
    room: "101",
    checkInDate: "15 Jan 2024",
    rentCost: 1500000,
    dueDate: "15 Feb 2024",
    dueLabel: "15 Feb 2024",
    dueVariant: "secondary",
  },
  {
    id: "2",
    name: "Budi Wijaya",
    initials: "BW",
    phone: "0856-7890-1234",
    room: "102",
    checkInDate: "01 Feb 2024",
    rentCost: 1500000,
    dueDate: "01 Mar 2024",
    dueLabel: "01 Mar 2024 (Telat)",
    dueVariant: "destructive",
  },
  {
    id: "3",
    name: "Citra Dewi",
    initials: "CD",
    phone: "0899-1234-5678",
    room: "201",
    checkInDate: "10 Des 2023",
    rentCost: 1800000,
    dueDate: "10 Mar 2024",
    dueLabel: "10 Mar 2024 (Lunas)",
    dueVariant: "default",
  },
  {
    id: "4",
    name: "Doni Prasetyo",
    initials: "DP",
    phone: "0813-4567-8901",
    room: "202",
    checkInDate: "20 Feb 2024",
    rentCost: 1800000,
    dueDate: "20 Mar 2024",
    dueLabel: "20 Mar 2024",
    dueVariant: "secondary",
  },
  {
    id: "5",
    name: "Eka Fitriani",
    initials: "EF",
    phone: "0821-5678-9012",
    room: "301",
    checkInDate: "05 Mar 2024",
    rentCost: 2000000,
    dueDate: "05 Apr 2024",
    dueLabel: "05 Apr 2024",
    dueVariant: "secondary",
  },
  {
    id: "6",
    name: "Fajar Nugroho",
    initials: "FN",
    phone: "0857-1234-5678",
    room: "302",
    checkInDate: "01 Jan 2024",
    rentCost: 2000000,
    dueDate: "01 Apr 2024",
    dueLabel: "01 Apr 2024 (Telat)",
    dueVariant: "destructive",
  },
  {
    id: "7",
    name: "Gita Permata",
    initials: "GP",
    phone: "0819-8765-4321",
    room: "103",
    checkInDate: "20 Mar 2024",
    rentCost: 1500000,
    dueDate: "20 Apr 2024",
    dueLabel: "20 Apr 2024 (Lunas)",
    dueVariant: "default",
  },
  {
    id: "8",
    name: "Hendra Gunawan",
    initials: "HG",
    phone: "0822-3456-7890",
    room: "203",
    checkInDate: "15 Jan 2024",
    rentCost: 1800000,
    dueDate: "15 Apr 2024",
    dueLabel: "15 Apr 2024",
    dueVariant: "secondary",
  },
]
