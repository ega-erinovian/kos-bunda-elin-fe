export type DueVariant = "default" | "secondary" | "destructive" | "outline";

export type Tenant = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  room: string;
  checkInDate: string;
  rentCost: number;
  dueDate: string;
  dueLabel: string;
  dueVariant: DueVariant;
  aktif: boolean;
};

export type FilterOption = "semua" | "aktif" | "nonaktif";
