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
  const dueDate = new Date(payment.tanggalJatuhTempo);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays < 0;
  const tab: PaymentTab =
    payment.status === "LUNAS" ? "paid" : isOverdue ? "overdue" : "approaching";

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
    name: payment.penyewa.nama,
    initials: getInitials(payment.penyewa.nama),
    room: payment.penyewa.kamar.nomor,
    dueDate: getDueDateLabel(payment.tanggalJatuhTempo),
    amount: payment.nominal,
    status,
    tab,
    totalDibayar: payment.totalDibayar,
  };
}
