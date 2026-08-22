import type { PaymentRecord } from "@/types";

// Pembayaran represents a bill/invoice for a specific month
export interface Pembayaran {
  id: string;
  penyewaId: string;
  penyewaNama: string;
  kamarId: string;
  nomorKamar: string;
  nominal: number;
  bulan: number;
  tahun: number;
  tanggalJatuhTempo: string;
  tanggalBayar?: string;
  totalDibayar: number;
  status: "BELUM_BAYAR" | "SEBAGIAN" | "LUNAS" | "TERLAMBAT";
  catatan?: string;
  createdAt: string;
  updatedAt: string;
  paymentRecords?: PaymentRecord[];
}

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

// Helper to create a date in the past/future
function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0];
}

export let pembayaranList: Pembayaran[] = [
  // BELUM_BAYAR - not overdue yet
  {
    id: "pembayaran-1",
    penyewaId: "tenant-1",
    penyewaNama: "Budi Santoso",
    kamarId: "room-1",
    nomorKamar: "101",
    nominal: 1500000,
    bulan: currentMonth,
    tahun: currentYear,
    tanggalJatuhTempo: addDays(now, 5),
    totalDibayar: 0,
    status: "BELUM_BAYAR",
    createdAt: new Date(currentYear, currentMonth - 1, 1).toISOString(),
    updatedAt: new Date(currentYear, currentMonth - 1, 1).toISOString(),
    paymentRecords: [],
  },
  // SEBAGIAN - partial payment
  {
    id: "pembayaran-2",
    penyewaId: "tenant-2",
    penyewaNama: "Siti Aminah",
    kamarId: "room-2",
    nomorKamar: "102",
    nominal: 1800000,
    bulan: currentMonth,
    tahun: currentYear,
    tanggalJatuhTempo: addDays(now, 3),
    totalDibayar: 900000,
    status: "SEBAGIAN",
    createdAt: new Date(currentYear, currentMonth - 1, 1).toISOString(),
    updatedAt: new Date(currentYear, currentMonth - 1, 10).toISOString(),
    paymentRecords: [
      {
        id: "payment-record-1",
        pembayaranId: "pembayaran-2",
        paymentMethod: "BANK_TRANSFER",
        paymentDate: addDays(now, -7),
        amountPaid: 900000,
        referenceNumber: "TRF20240810001",
        createdByAdmin: {
          id: "admin-1",
          nama: "Admin User",
        },
        createdAt: new Date(currentYear, currentMonth - 1, 10).toISOString(),
      },
    ],
  },
  // LUNAS - fully paid
  {
    id: "pembayaran-3",
    penyewaId: "tenant-3",
    penyewaNama: "Ahmad Rizki",
    kamarId: "room-3",
    nomorKamar: "103",
    nominal: 1600000,
    bulan: currentMonth - 1,
    tahun: currentMonth === 1 ? currentYear - 1 : currentYear,
    tanggalJatuhTempo: addDays(now, -25),
    tanggalBayar: addDays(now, -27),
    totalDibayar: 1600000,
    status: "LUNAS",
    createdAt: new Date(
      currentMonth === 1 ? currentYear - 1 : currentYear,
      currentMonth === 1 ? 11 : currentMonth - 2,
      1,
    ).toISOString(),
    updatedAt: addDays(now, -27),
    paymentRecords: [
      {
        id: "payment-record-2",
        pembayaranId: "pembayaran-3",
        paymentMethod: "CASH",
        paymentDate: addDays(now, -27),
        amountPaid: 1600000,
        createdByAdmin: {
          id: "admin-1",
          nama: "Admin User",
        },
        createdAt: addDays(now, -27),
      },
    ],
  },
  // TERLAMBAT - overdue, no payment
  {
    id: "pembayaran-4",
    penyewaId: "tenant-1",
    penyewaNama: "Budi Santoso",
    kamarId: "room-1",
    nomorKamar: "101",
    nominal: 1500000,
    bulan: currentMonth - 1,
    tahun: currentMonth === 1 ? currentYear - 1 : currentYear,
    tanggalJatuhTempo: addDays(now, -10),
    totalDibayar: 0,
    status: "TERLAMBAT",
    createdAt: new Date(
      currentMonth === 1 ? currentYear - 1 : currentYear,
      currentMonth === 1 ? 11 : currentMonth - 2,
      1,
    ).toISOString(),
    updatedAt: new Date(
      currentMonth === 1 ? currentYear - 1 : currentYear,
      currentMonth === 1 ? 11 : currentMonth - 2,
      1,
    ).toISOString(),
    paymentRecords: [],
  },
];

export let paymentRecords: PaymentRecord[] = [
  {
    id: "payment-record-1",
    pembayaranId: "pembayaran-2",
    paymentMethod: "BANK_TRANSFER",
    paymentDate: addDays(now, -7),
    amountPaid: 900000,
    referenceNumber: "TRF20240810001",
    createdByAdmin: {
      id: "admin-1",
      nama: "Admin User",
    },
    createdAt: new Date(currentYear, currentMonth - 1, 10).toISOString(),
  },
  {
    id: "payment-record-2",
    pembayaranId: "pembayaran-3",
    paymentMethod: "CASH",
    paymentDate: addDays(now, -27),
    amountPaid: 1600000,
    createdByAdmin: {
      id: "admin-1",
      nama: "Admin User",
    },
    createdAt: addDays(now, -27),
  },
];

export function resetPembayaran() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  pembayaranList = [
    {
      id: "pembayaran-1",
      penyewaId: "tenant-1",
      penyewaNama: "Budi Santoso",
      kamarId: "room-1",
      nomorKamar: "101",
      nominal: 1500000,
      bulan: currentMonth,
      tahun: currentYear,
      tanggalJatuhTempo: addDays(now, 5),
      totalDibayar: 0,
      status: "BELUM_BAYAR",
      createdAt: new Date(currentYear, currentMonth - 1, 1).toISOString(),
      updatedAt: new Date(currentYear, currentMonth - 1, 1).toISOString(),
      paymentRecords: [],
    },
    {
      id: "pembayaran-2",
      penyewaId: "tenant-2",
      penyewaNama: "Siti Aminah",
      kamarId: "room-2",
      nomorKamar: "102",
      nominal: 1800000,
      bulan: currentMonth,
      tahun: currentYear,
      tanggalJatuhTempo: addDays(now, 3),
      totalDibayar: 900000,
      status: "SEBAGIAN",
      createdAt: new Date(currentYear, currentMonth - 1, 1).toISOString(),
      updatedAt: new Date(currentYear, currentMonth - 1, 10).toISOString(),
      paymentRecords: [
        {
          id: "payment-record-1",
          pembayaranId: "pembayaran-2",
          paymentMethod: "BANK_TRANSFER",
          paymentDate: addDays(now, -7),
          amountPaid: 900000,
          referenceNumber: "TRF20240810001",
          createdByAdmin: {
            id: "admin-1",
            nama: "Admin User",
          },
          createdAt: new Date(currentYear, currentMonth - 1, 10).toISOString(),
        },
      ],
    },
    {
      id: "pembayaran-3",
      penyewaId: "tenant-3",
      penyewaNama: "Ahmad Rizki",
      kamarId: "room-3",
      nomorKamar: "103",
      nominal: 1600000,
      bulan: currentMonth - 1,
      tahun: currentMonth === 1 ? currentYear - 1 : currentYear,
      tanggalJatuhTempo: addDays(now, -25),
      tanggalBayar: addDays(now, -27),
      totalDibayar: 1600000,
      status: "LUNAS",
      createdAt: new Date(
        currentMonth === 1 ? currentYear - 1 : currentYear,
        currentMonth === 1 ? 11 : currentMonth - 2,
        1,
      ).toISOString(),
      updatedAt: addDays(now, -27),
      paymentRecords: [
        {
          id: "payment-record-2",
          pembayaranId: "pembayaran-3",
          paymentMethod: "CASH",
          paymentDate: addDays(now, -27),
          amountPaid: 1600000,
          createdByAdmin: {
            id: "admin-1",
            nama: "Admin User",
          },
          createdAt: addDays(now, -27),
        },
      ],
    },
    {
      id: "pembayaran-4",
      penyewaId: "tenant-1",
      penyewaNama: "Budi Santoso",
      kamarId: "room-1",
      nomorKamar: "101",
      nominal: 1500000,
      bulan: currentMonth - 1,
      tahun: currentMonth === 1 ? currentYear - 1 : currentYear,
      tanggalJatuhTempo: addDays(now, -10),
      totalDibayar: 0,
      status: "TERLAMBAT",
      createdAt: new Date(
        currentMonth === 1 ? currentYear - 1 : currentYear,
        currentMonth === 1 ? 11 : currentMonth - 2,
        1,
      ).toISOString(),
      updatedAt: new Date(
        currentMonth === 1 ? currentYear - 1 : currentYear,
        currentMonth === 1 ? 11 : currentMonth - 2,
        1,
      ).toISOString(),
      paymentRecords: [],
    },
  ];

  paymentRecords = [
    {
      id: "payment-record-1",
      pembayaranId: "pembayaran-2",
      paymentMethod: "BANK_TRANSFER",
      paymentDate: addDays(now, -7),
      amountPaid: 900000,
      referenceNumber: "TRF20240810001",
      createdByAdmin: {
        id: "admin-1",
        nama: "Admin User",
      },
      createdAt: new Date(currentYear, currentMonth - 1, 10).toISOString(),
    },
    {
      id: "payment-record-2",
      pembayaranId: "pembayaran-3",
      paymentMethod: "CASH",
      paymentDate: addDays(now, -27),
      amountPaid: 1600000,
      createdByAdmin: {
        id: "admin-1",
        nama: "Admin User",
      },
      createdAt: addDays(now, -27),
    },
  ];
}
