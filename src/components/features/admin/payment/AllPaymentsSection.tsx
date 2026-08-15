"use client";

import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MobilePaymentCard } from "./components/MobilePaymentCard";
import { PaymentRow } from "./components/PaymentRow";
import { dummyPayments, PAGE_SIZE } from "./constants";
import { usePaymentsSearch } from "@/hooks/features/admin/usePaymentsSearch";
import type { PaymentTab } from "./types";

const tabOptions: { key: PaymentTab; label: string }[] = [
  { key: "approaching", label: "Menunggu" },
  { key: "overdue", label: "Overdue" },
];

export function AllPaymentsSection() {
  const {
    searchQuery,
    activeTab,
    currentPage,
    filteredPayments,
    totalPages,
    paginatedPayments,
    handleSearch,
    handleTabChange,
    handlePageChange,
  } = usePaymentsSearch(dummyPayments);

  const from = (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, filteredPayments.length);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-4 md:px-6 md:py-6 lg:px-8">
      <div className="flex items-center gap-3 md:gap-4">
        <Link
          href="/admin/payments"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-primary/5 md:h-10 md:w-10"
        >
          <ArrowLeft className="h-5 w-5 text-on-surface md:h-6 md:w-6" />
        </Link>
        <div>
          <h1 className="text-heading-lg-mobile font-bold text-on-surface md:text-heading-lg">
            Tagihan Menunggu
          </h1>
          <p className="mt-0.5 hidden text-body-md text-on-surface-variant md:block">
            Daftar lengkap tagihan penghuni yang perlu ditindaklanjuti.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-outline md:h-5 md:w-5" />
        <Input
          placeholder="Cari penghuni atau kamar..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-[46px] w-full rounded-xl border-outline-variant bg-surface-container-lowest pl-12 shadow-[0_4px_20px_-2px_rgba(134,167,137,0.08)] md:h-12 md:pl-14"
        />
      </div>

      <div className="flex gap-2">
        {tabOptions.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`rounded-full px-4 py-1.5 text-label-sm font-semibold transition-colors md:px-5 md:py-2 md:text-label-md ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:gap-4 lg:hidden">
        {paginatedPayments.length > 0 ? (
          paginatedPayments.map((payment) => (
            <MobilePaymentCard key={payment.id} payment={payment} />
          ))
        ) : (
          <div className="py-12 text-center text-body-md text-on-surface-variant md:py-16">
            Tidak ada tagihan ditemukan.
          </div>
        )}
      </div>

      <div className="hidden rounded-xl border border-outline-variant/20 bg-surface p-lg shadow-ambient-md lg:block">
        <div className="space-y-3">
          {paginatedPayments.length > 0 ? (
            paginatedPayments.map((payment) => <PaymentRow key={payment.id} payment={payment} />)
          ) : (
            <div className="py-12 text-center text-body-md text-on-surface-variant">
              Tidak ada tagihan ditemukan.
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-2 md:gap-6 md:py-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-label-sm text-on-surface-variant md:text-body-md">
            {from}-{to} dari {filteredPayments.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
