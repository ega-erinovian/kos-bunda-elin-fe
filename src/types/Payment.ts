import type { PaymentRecord } from "./payment-record";

export type PaymentStatus = "BELUM_BAYAR" | "SEBAGIAN" | "LUNAS" | "TERLAMBAT";

export type PaymentStatusFilter =
  "akan_jatuh_tempo" | "menunggak" | "belum_bayar" | "sebagian" | "lunas" | "terlambat";

export default interface Payment {
  id: string;
  penyewaId: string;
  penyewa: {
    id: string;
    nama: string;
    noHp: string;
    kamar: {
      id: string;
      nomor: string;
      lantai: string | null;
    };
  };
  periodeBulan: number;
  periodeTahun: number;
  tanggalJatuhTempo: string;
  status: PaymentStatus;
  tanggalBayar: string | null;
  nominal: number;
  totalDibayar: number;
  catatan: string | null;
  createdAt: string;
  updatedAt: string;
  paymentRecords?: PaymentRecord[];
}

export interface CreatePaymentInput {
  penyewaId: string;
  periodeBulan: number;
  periodeTahun: number;
  tanggalJatuhTempo: string;
  nominal: number;
  catatan?: string;
}

export interface UpdatePaymentInput {
  tanggalJatuhTempo?: string;
  catatan?: string | null;
}

export interface PaymentListParams {
  status?: PaymentStatusFilter;
  penyewaId?: string;
  periodeBulan?: number;
  periodeTahun?: number;
  page?: number;
  limit?: number;
}
