import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Payment as ApiPayment } from "@/types";
import type {
  Payment as AdminPayment,
  PaymentTab,
} from "@/components/features/admin/payment/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export function getMonthName(month: number): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[month - 1] || "";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getDueDateLabel(dueDate: string): string {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return `Terlambat ${absDays} hari`;
  } else if (diffDays === 0) {
    return "Jatuh tempo hari ini";
  } else if (diffDays === 1) {
    return "Jatuh tempo besok";
  } else {
    return `Jatuh tempo ${diffDays} hari lagi`;
  }
}

export function transformApiPaymentToAdminPayment(payment: ApiPayment): AdminPayment {
  // Root cause fix is in src/mocks/handlers/pembayaran.ts:208 which now maps flat fixture to nested penyewa shape.
  // This guard is defensive for live drift / partial cache entries — never throw in render.
  if (!payment || typeof payment !== "object") {
    return {
      id: (payment as unknown as { id?: string })?.id ?? "unknown",
      name: "Penghuni",
      initials: "--",
      room: "-",
      dueDate: "-",
      amount: 0,
      status: "pending",
      tab: "approaching",
      totalDibayar: 0,
    };
  }
  // Defensive: BE/mock shape drift → `penyewa` may be missing; fall back to flat penyewaNama/penyewaId
  const penyewaAny = (
    payment as unknown as {
      penyewa?: ApiPayment["penyewa"];
      penyewaNama?: string;
      kamarId?: string;
      nomorKamar?: string;
    }
  ).penyewa;
  const fallbackNama =
    (payment as unknown as { penyewaNama?: string }).penyewaNama ?? penyewaAny?.nama ?? "Penghuni";
  const fallbackRoom =
    penyewaAny?.kamar?.nomor ??
    (payment as unknown as { nomorKamar?: string }).nomorKamar ??
    (payment as unknown as { penyewa?: { kamar?: { nomor?: string } } }).penyewa?.kamar?.nomor ??
    "-";
  const nama = penyewaAny?.nama ?? fallbackNama;
  const dueDate = new Date(payment.tanggalJatuhTempo);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays < 0;
  const tab: PaymentTab =
    payment.status === "LUNAS"
      ? "paid"
      : payment.status === "SEBAGIAN"
        ? "partial"
        : isOverdue
          ? "overdue"
          : "approaching";

  // Map API status to admin status
  const status: AdminPayment["status"] =
    payment.status === "TERLAMBAT"
      ? "overdue"
      : payment.status === "LUNAS"
        ? "paid"
        : payment.status === "SEBAGIAN"
          ? "partial"
          : "pending";
  return {
    id: payment.id,
    name: nama,
    initials: getInitials(nama),
    room: fallbackRoom,
    dueDate: getDueDateLabel(payment.tanggalJatuhTempo),
    amount: payment.nominal,
    status,
    tab,
    totalDibayar: payment.totalDibayar,
  };
}
