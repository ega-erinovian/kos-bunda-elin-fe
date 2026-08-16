export default interface Tenant {
  id: string;
  nama: string;
  noHp: string;
  kamarId: string;
  tanggalMulaiSewa: string;
  nominalSewa: string;
  tanggalJatuhTempo: number;
  tanggalKeluar: string | null;
  aktif: boolean;
  createdAt: string;
  updatedAt: string;
  kamar?: {
    id: string;
    nomor: string;
    lantai: string;
    status: "KOSONG" | "TERISI" | "NONAKTIF";
  };
}
