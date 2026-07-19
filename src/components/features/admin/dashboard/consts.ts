import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  DoorOpen,
  ReceiptText,
  UserPlus,
} from "lucide-react";

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

export const activities = [
  {
    icon: CreditCard,
    iconWrapper: "bg-secondary-container text-on-secondary-container",
    name: "Siti Rahmawari (Kamar 102)",
    desc: "Membayar sewa bulan Oktober",
    amount: "+Rp 1.500.000",
    amountClass: "text-primary",
    time: "Hari ini, 09:45",
  },
  {
    icon: Clock,
    iconWrapper: "bg-surface-container-high text-on-surface-variant",
    name: "Budi Santoso (Kamar 205)",
    desc: "Konfirmasi pembayaran tertunda",
    badge: "Pending",
    badgeClass: "bg-secondary-fixed text-on-secondary-fixed-variant",
    amount: "Rp 1.200.000",
    amountClass: "text-on-surface",
    time: "Kemarin",
  },
  {
    icon: CreditCard,
    iconWrapper: "bg-secondary-container text-on-secondary-container",
    name: "Dian Sastro (Kamar 105)",
    desc: "Membayar sewa bulan Oktober",
    amount: "+Rp 1.500.000",
    amountClass: "text-primary",
    time: "Kemarin",
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

export const quickActions = [
  {
    label: "Catat Bayar",
    description: "Input pembayaran bulan ini",
    icon: CreditCard,
    iconWrapper: "bg-secondary text-secondary-foreground",
  },
  {
    label: "Tambah Penghuni",
    description: "Registrasi anak kos baru",
    icon: UserPlus,
    iconWrapper: "bg-muted text-muted-foreground",
  },
];
