import { AlertCircle, AlertTriangle, CheckCircle, DoorOpen, ReceiptText } from "lucide-react";

export const metrics = [
  {
    label: "Total Kamar",
    value: "18",
    sub: "/ 20 Terisi",
    icon: DoorOpen,
    iconWrapper: "bg-secondary-container text-on-secondary-container",
    progress: 90,
    decorColor: "bg-primary-container/10",
  },
  {
    label: "Pembayaran Mendatang",
    value: "5",
    sub: "Belum Bayar",
    icon: ReceiptText,
    iconWrapper: "bg-surface-container-high text-on-surface-variant",
    decorColor: "bg-tertiary-fixed-dim/20",
  },
  {
    label: "Menunggak",
    value: "2",
    sub: "Menunggak",
    icon: AlertTriangle,
    iconWrapper: "bg-error-container text-on-error-container",
    decorColor: "bg-error-container/30",
    danger: true,
  },
];

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
