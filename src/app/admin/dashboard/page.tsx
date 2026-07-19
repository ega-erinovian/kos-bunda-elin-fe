"use client";

import {
  DoorOpen,
  Users,
  CalendarCheck,
  AlertTriangle,
  ChevronRight,
  CreditCard,
  UserPlus,
  Plus,
  ChevronDown,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  ReceiptText,
  Clock,
  Rss,
} from "lucide-react";

const metrics = [
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

const activities = [
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

const pushLogs = [
  {
    label: "Tagihan Terkirim",
    status: "Sukses",
    statusIcon: CheckCircle,
    statusClass: "text-primary",
    detail: "Kamar 201 - Andi",
    time: "10:05 AM",
    dotColor: "bg-primary",
  },
  {
    label: "Peringatan Tunggakan",
    status: "Gagal",
    statusIcon: AlertCircle,
    statusClass: "text-error",
    detail: "Kamar 104 - Budi (Device Offline)",
    time: "09:30 AM",
    dotColor: "bg-error",
  },
  {
    label: "Broadcast Info",
    status: "Sukses",
    statusIcon: CheckCircle,
    statusClass: "text-primary",
    detail: "Semua Penghuni (Pemeliharaan Air)",
    time: "Kemarin, 15:00",
    dotColor: "bg-primary",
  },
];

const quickActions = [
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

export default function AdminDashboardPage() {
  return (
    <div>
      {/* Mobile Content */}
      <div className="space-y-8 md:hidden">
        <section className="space-y-1">
          <p className="text-sm text-muted-foreground">Halo, Admin</p>
          <h2 className="font-heading text-heading-lg-mobile text-on-surface">
            Ringkasan Hari Ini
          </h2>
        </section>

        <section className="grid grid-cols-2 gap-4">
          {[
            { label: "Total Kamar", value: "20", icon: DoorOpen, className: "bg-card text-card-foreground", iconWrapper: "bg-primary/10 text-primary" },
            { label: "Terisi", value: "18", icon: Users, className: "bg-primary text-primary-foreground", iconWrapper: "bg-white/20 text-primary-foreground", accent: true },
            { label: "Jatuh Tempo", value: "3", icon: CalendarCheck, className: "bg-secondary text-secondary-foreground", iconWrapper: "bg-white/40 text-secondary-foreground" },
            { label: "Menunggak", value: "1", icon: AlertTriangle, className: "bg-destructive/10 text-destructive", iconWrapper: "bg-white/40 text-destructive" },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className={`relative flex flex-col justify-between overflow-hidden rounded-xl p-6 transition-all duration-300 ${m.className}`}
                style={
                  !m.accent
                    ? { boxShadow: "0 4px 20px -2px rgba(134, 167, 137, 0.08)" }
                    : {}
                }
              >
                {m.accent && (
                  <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                )}
                <div className="relative z-10 flex items-start justify-between">
                  <div className={`rounded-full p-2 ${m.iconWrapper}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="relative z-10 mt-2">
                  <p className="font-heading text-heading-xl mb-1">{m.value}</p>
                  <p className={`text-sm ${m.accent ? "opacity-90" : "text-muted-foreground"}`}>
                    {m.label}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        <section className="space-y-4">
          <h3 className="font-heading text-heading-md">Aksi Cepat</h3>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="flex w-full items-center justify-between rounded-xl bg-card p-4 text-left transition-colors hover:bg-primary/5"
                  style={{
                    boxShadow: "0 4px 20px -2px rgba(134, 167, 137, 0.08)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${action.iconWrapper}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        {action.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </button>
              );
            })}
          </div>
        </section>

        <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-3">
          <button className="flex items-center justify-center rounded-full bg-secondary p-4 text-secondary-foreground shadow-lg transition-transform hover:scale-105">
            <UserPlus className="h-5 w-5" />
          </button>
          <button className="flex items-center justify-center rounded-full bg-primary p-4 text-primary-foreground shadow-lg transition-transform hover:scale-105">
            <CreditCard className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="hidden md:block space-y-8">
        {/* Header */}
        <header className="flex items-end justify-between">
          <div>
            <h1 className="font-heading text-heading-lg text-on-surface mb-2">
              Halo, Admin
            </h1>
            <p className="flex items-center gap-1 text-body-md text-on-surface-variant">
              <CalendarDays className="h-4 w-4" />
              Senin, 23 Okt 2023
            </p>
          </div>
          {/* New Action Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 rounded-xl bg-primary-container px-6 py-3 text-label-md text-on-primary-container shadow-sm transition-colors hover:bg-primary/90 hover:text-white">
              <Plus className="h-5 w-5" />
              New Action
              <ChevronDown className="h-5 w-5" />
            </button>
            <div className="invisible group-hover:visible absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-xl border border-surface-variant bg-surface shadow-lg opacity-0 transition-all group-hover:opacity-100">
              <a className="block border-b border-surface-variant px-4 py-3 text-label-md text-on-surface transition-colors hover:bg-surface-container-high" href="#">
                Tambah Penghuni
              </a>
              <a className="block border-b border-surface-variant px-4 py-3 text-label-md text-on-surface transition-colors hover:bg-surface-container-high" href="#">
                Catat Pembayaran
              </a>
              <a className="block px-4 py-3 text-label-md text-on-surface transition-colors hover:bg-surface-container-high" href="#">
                Kirim Broadcast
              </a>
            </div>
          </div>
        </header>

        {/* Metric Cards */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="group relative overflow-hidden rounded-[24px] border border-transparent bg-surface p-6 shadow-ambient-md transition-colors hover:border-secondary"
              >
                <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-bl-[48px] transition-transform group-hover:scale-110 ${m.decorColor}`} />
                <div className="relative">
                  <div className="mb-6 flex items-start justify-between">
                    <div className={`rounded-xl p-3 ${m.iconWrapper}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1 text-body-md text-on-surface-variant">
                      {m.label}
                    </h3>
                    <div className="flex items-end gap-2">
                      <span className={`font-heading text-heading-lg text-on-surface ${m.danger ? "text-destructive" : ""}`}>
                        {m.value}
                      </span>
                      <span className="pb-1 text-body-md text-on-surface-variant">
                        {m.sub}
                      </span>
                    </div>
                  </div>
                  {m.progress !== undefined && (
                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-variant">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${m.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* Two-Column Content */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Activity Feed */}
          <div className="rounded-[24px] bg-surface p-6 shadow-ambient-md lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-heading-md text-on-surface">
                Aktivitas Terbaru
              </h2>
              <button className="text-label-md text-primary hover:underline">
                Lihat Semua
              </button>
            </div>
            <div className="space-y-4">
              {activities.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div
                    key={i}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-transparent p-4 transition-colors hover:border-surface-variant hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${a.iconWrapper}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-label-md text-on-surface">{a.name}</p>
                        <p className="text-label-sm text-on-surface-variant">{a.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      {a.badge && (
                        <span className={`rounded px-2 py-1 text-label-sm ${a.badgeClass}`}>
                          {a.badge}
                        </span>
                      )}
                      <div>
                        <p className={`text-label-md font-semibold ${a.amountClass}`}>{a.amount}</p>
                        <p className="text-label-sm text-on-surface-variant">{a.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Push Logs */}
          <div className="flex h-full flex-col rounded-[24px] bg-surface p-6 shadow-ambient-md">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-heading-md text-on-surface">
                Push Logs
              </h2>
              <Rss className="h-5 w-5 text-on-surface-variant" />
            </div>
            <div className="relative flex-1 space-y-0 pl-2 before:absolute before:inset-y-0 before:left-[19px] before:w-[2px] before:bg-surface-variant">
              {pushLogs.map((log, i) => {
                const StatusIcon = log.statusIcon;
                return (
                  <div key={i} className="relative py-3 pl-8">
                    <div className={`absolute left-[-5px] top-4 h-3 w-3 rounded-full ring-4 ring-surface ${log.dotColor}`} />
                    <div className={`rounded-xl border p-3 ${i === 1 ? "border-error/20 bg-error/5" : "border-surface-variant bg-surface-container-lowest"}`}>
                      <div className="mb-1 flex items-start justify-between">
                        <span className="text-label-md text-on-surface">{log.label}</span>
                        <span className={`flex items-center gap-1 text-label-sm ${log.statusClass}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {log.status}
                        </span>
                      </div>
                      <p className="text-label-sm text-on-surface-variant">{log.detail}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{log.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
