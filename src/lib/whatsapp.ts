import { getMonthName } from "./utils";
import type { Payment } from "@/types";
import type Tenant from "@/types/Tenant";

export type WhatsAppTemplateId =
  | "reminder_jatuh_tempo"
  | "reminder_tunggakan"
  | "konfirmasi_lunas"
  | "konfirmasi_sebagian"
  | "tagihan_baru"
  | "sapaan_umum"
  | "custom";

export type WhatsAppVars = {
  nama: string;
  kamar: string;
  periode: string;
  nominal: string;
  sisaTagihan: string;
  totalDibayar: string;
  tanggalJatuhTempo: string;
  tanggalBayar?: string;
};

export type WhatsAppTemplate = {
  id: WhatsAppTemplateId;
  label: string;
  description: string;
  render: (vars: WhatsAppVars) => string;
};

function idr(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}

function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "reminder_jatuh_tempo",
    label: "Pengingat Jatuh Tempo",
    description: "Tagihan akan jatuh tempo — kirim H-3 s/d H-0",
    render: (v) =>
      `Halo ${v.nama} \u{1F44B},\n\nKamar *${v.kamar}* akan jatuh tempo pada *${v.tanggalJatuhTempo}* untuk periode *${v.periode}*.\nNominal: Rp ${v.nominal}\nSisa tagihan: Rp ${v.sisaTagihan}\n\nMohon lakukan pembayaran tepat waktu. Terima kasih \u{1F64F}\n— Kos Bunda Elin`,
  },
  {
    id: "reminder_tunggakan",
    label: "Pengingat Tunggakan",
    description: "Tagihan sudah lewat jatuh tempo",
    render: (v) =>
      `Halo ${v.nama} \u{1F44B},\nKamar *${v.kamar}* menunggak sejak *${v.tanggalJatuhTempo}* untuk periode *${v.periode}*.\nSisa tagihan: *Rp ${v.sisaTagihan}* dari total Rp ${v.nominal}.\n\nMohon segera lakukan pembayaran agar tidak dikenakan denda. Hubungi pengelola jika sudah transfer \u{1F64F}\n— Kos Bunda Elin`,
  },
  {
    id: "tagihan_baru",
    label: "Tagihan Baru",
    description: "Info tagihan baru terbit",
    render: (v) =>
      `Halo ${v.nama} \u{1F44B},\nTagihan baru untuk kamar *${v.kamar}* periode *${v.periode}* telah terbit.\nNominal: *Rp ${v.nominal}*\nJatuh tempo: *${v.tanggalJatuhTempo}*\n\nSilakan lakukan pembayaran via transfer / tunai dan konfirmasi ke pengelola. Terima kasih \u{1F3E0}\n— Kos Bunda Elin`,
  },
  {
    id: "konfirmasi_sebagian",
    label: "Konfirmasi Bayar Sebagian",
    description: "Pembayaran sebagian diterima",
    render: (v) =>
      `Halo ${v.nama} \u{1F44B},\nPembayaran sebesar *Rp ${v.totalDibayar}* untuk kamar *${v.kamar}* periode *${v.periode}* telah kami terima.\nSisa tagihan: *Rp ${v.sisaTagihan}*.\n\nTerima kasih, mohon lunasi sisanya sebelum ${v.tanggalJatuhTempo} \u{1F64F}\n— Kos Bunda Elin`,
  },
  {
    id: "konfirmasi_lunas",
    label: "Konfirmasi Lunas",
    description: "Pembayaran lunas penuh",
    render: (v) =>
      `Halo ${v.nama} \u{1F389},\nPembayaran kamar *${v.kamar}* periode *${v.periode}* sebesar *Rp ${v.nominal}* telah *LUNAS*${v.tanggalBayar ? ` pada ${v.tanggalBayar}` : ""}.\n\nTerima kasih atas pembayarannya \u{1F64F}\n— Kos Bunda Elin`,
  },
  {
    id: "sapaan_umum",
    label: "Sapaan / Pengumuman",
    description: "Pesan umum tanpa nominal",
    render: (v) =>
      `Halo ${v.nama} \u{1F44B},\nAda informasi untuk penghuni kamar *${v.kamar}*.\n\n— Kos Bunda Elin`,
  },
];

export function getWhatsAppTemplate(id: WhatsAppTemplateId): WhatsAppTemplate | undefined {
  return WHATSAPP_TEMPLATES.find((t) => t.id === id);
}

export function renderWhatsAppTemplate(
  id: WhatsAppTemplateId,
  vars: WhatsAppVars,
): string {
  const t = getWhatsAppTemplate(id);
  return t ? t.render(vars) : "";
}

export function buildWhatsAppVars(args: {
  nama: string;
  kamar: string;
  periodeBulan: number;
  periodeTahun: number;
  nominal: number;
  totalDibayar: number;
  tanggalJatuhTempo: string;
  tanggalBayar?: string | null;
}): WhatsAppVars {
  const periode = `${getMonthName(args.periodeBulan)} ${args.periodeTahun}`;
  const sisa = Math.max(0, args.nominal - args.totalDibayar);
  return {
    nama: args.nama,
    kamar: args.kamar,
    periode,
    nominal: idr(args.nominal),
    sisaTagihan: idr(sisa),
    totalDibayar: idr(args.totalDibayar),
    tanggalJatuhTempo: formatTanggal(args.tanggalJatuhTempo),
    tanggalBayar: args.tanggalBayar ? formatTanggal(args.tanggalBayar) : undefined,
  };
}

/**
 * Normalize Indonesian phone to wa.me format (62xxxxxxxxxx, no + , no spaces).
 * Accepts 08xxx, +62xxx, 62xxx, with spaces/dashes/parentheses.
 */
export function normalizePhoneForWa(input: string): string {
  if (!input) return "";
  let p = input.trim().replace(/[^\d+]/g, "");
  // remove leading +
  if (p.startsWith("+")) p = p.slice(1);
  // 0xxx -> 62xxx
  if (p.startsWith("0")) p = "62" + p.slice(1);
  // already 62 -> keep, 8xxx without 0/62 -> prefix 62
  if (p.startsWith("8")) p = "62" + p;
  // strip any remaining non-digit (defensive)
  p = p.replace(/\D/g, "");
  return p;
}

export function isValidWaPhone(phone: string): boolean {
  const n = normalizePhoneForWa(phone);
  return /^62\d{8,13}$/.test(n);
}

export function buildWaUrl(phone: string, message: string): string {
  const normalized = normalizePhoneForWa(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(phone: string, message: string): void {
  const url = buildWaUrl(phone, message);
  window.open(url, "_blank", "noopener,noreferrer");
}

// Small helper to pick sensible default template from payment status + due date.
// Used to pre-select in the composer.
export function pickDefaultTemplateId(args: {
  status: string;
  isOverdue: boolean;
  totalDibayar: number;
  nominal: number;
}): WhatsAppTemplateId {
  const { status, isOverdue, totalDibayar, nominal } = args;
  if (status === "LUNAS") return "konfirmasi_lunas";
  if (status === "SEBAGIAN" && totalDibayar > 0) return "konfirmasi_sebagian";
  if (isOverdue || status === "TERLAMBAT") return "reminder_tunggakan";
  if (totalDibayar === 0 && nominal > 0) return "reminder_jatuh_tempo";
  return "sapaan_umum";
}

export function isOverdue(tanggalJatuhTempo: string, now: Date = new Date()): boolean {
  const due = new Date(tanggalJatuhTempo);
  due.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today.getTime() > due.getTime();
}

export function paymentToWhatsAppVars(payment: Payment): WhatsAppVars {
  return buildWhatsAppVars({
    nama: payment.penyewa.nama,
    kamar: payment.penyewa.kamar.nomor,
    periodeBulan: payment.periodeBulan,
    periodeTahun: payment.periodeTahun,
    nominal: payment.nominal,
    totalDibayar: payment.totalDibayar ?? 0,
    tanggalJatuhTempo: payment.tanggalJatuhTempo,
    tanggalBayar: payment.tanggalBayar,
  });
}

export function paymentToDefaultTemplate(payment: Payment): WhatsAppTemplateId {
  return pickDefaultTemplateId({
    status: payment.status,
    isOverdue: isOverdue(payment.tanggalJatuhTempo),
    totalDibayar: payment.totalDibayar ?? 0,
    nominal: payment.nominal,
  });
}

export function tenantToWhatsAppVars(tenant: Tenant): WhatsAppVars {
  const now = new Date();
  const isoDue = new Date(now.getFullYear(), now.getMonth(), tenant.tanggalJatuhTempo).toISOString();
  return buildWhatsAppVars({
    nama: tenant.nama,
    kamar: tenant.kamar?.nomor ?? "-",
    periodeBulan: now.getMonth() + 1,
    periodeTahun: now.getFullYear(),
    nominal: Number(tenant.nominalSewa),
    totalDibayar: 0,
    tanggalJatuhTempo: isoDue,
  });
}
