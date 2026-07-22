export type RoomStatus = "terisi" | "kosong" | "perbaikan";

export type Room = {
  id: string;
  number: string;
  floor: number;
  price: number;
  status: RoomStatus;
  tenant?: {
    name: string;
    initials: string;
  };
};

export type FilterOption = "semua" | RoomStatus;
export type FloorFilter = "semua" | number;
