import { AlertCircle, CheckCircle } from "lucide-react";

export const pushLogs = [
  {
    label: "Tagihan Terkirim",
    status: "Sukses",
    statusIcon: CheckCircle,
    statusClass: "text-primary",
    detail: "Kamar 201 - Andi",
    time: "10:05 AM",
  },
  {
    label: "Peringatan Tunggakan",
    status: "Gagal",
    statusIcon: AlertCircle,
    statusClass: "text-error",
    detail: "Kamar 104 - Budi (Device Offline)",
    time: "09:30 AM",
  },
  {
    label: "Broadcast Info",
    status: "Sukses",
    statusIcon: CheckCircle,
    statusClass: "text-primary",
    detail: "Semua Penghuni (Pemeliharaan Air)",
    time: "Kemarin, 15:00",
  },
];
