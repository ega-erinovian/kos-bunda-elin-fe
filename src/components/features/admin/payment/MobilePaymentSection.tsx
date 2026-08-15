"use client";

import Link from "next/link";
import { Search, Filter, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { MobilePaymentCard } from "./components/MobilePaymentCard";
import { MobileBroadcastForm } from "./components/MobileBroadcastForm";
import { MobileLogEntry } from "./components/MobileLogEntry";
import { dummyPayments, dummyBroadcastLogs } from "./constants";

export function MobilePaymentSection() {
  return (
    <div className="space-y-6 md:hidden">
      <h1 className="text-heading-lg-mobile font-bold text-on-surface">Manajemen Pembayaran</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
        <Input
          placeholder="Cari penghuni..."
          className="h-11.5 w-full rounded-xl border-outline-variant bg-surface-container-lowest pl-12 shadow-ambient-md"
        />
      </div>

      {/* Tagihan Menunggu */}
      <section>
        <SectionHeader title="Tagihan Menunggu">
          <Link
            href="/admin/payments/tagihan-menunggu"
            className="flex items-center gap-1 text-label-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Lihat Semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </SectionHeader>
        <div className="space-y-3">
          {dummyPayments
            .filter((p) => p.tab === "approaching")
            .slice(0, 3)
            .map((payment) => (
              <MobilePaymentCard key={payment.id} payment={payment} />
            ))}
        </div>
      </section>

      {/* Broadcast Cepat */}
      <section>
        <MobileBroadcastForm />
      </section>

      {/* Log Komunikasi */}
      <section>
        <SectionHeader title="Log Komunikasi">
          <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-primary/5">
            <Filter className="h-5 w-5 text-on-surface-variant" />
          </button>
        </SectionHeader>
        <div className="space-y-2">
          {dummyBroadcastLogs.map((log) => (
            <MobileLogEntry key={log.id} log={log} />
          ))}
        </div>
      </section>
    </div>
  );
}
