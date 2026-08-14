export default interface Room {
  id: string;
  nomor: string;
  lantai?: string;
  harga: number;
  status: "KOSONG" | "TERISI" | "NONAKTIF";
  _count?: { penyewa: number };
  penyewa?: { id: string; nama: string }[];
  createdAt: string;
  updatedAt: string;
}
