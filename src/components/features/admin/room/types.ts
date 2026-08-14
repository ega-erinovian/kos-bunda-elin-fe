export type RoomStatus = "terisi" | "kosong" | "nonaktif";

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
export type FloorOption = { key: FloorFilter; label: string };
