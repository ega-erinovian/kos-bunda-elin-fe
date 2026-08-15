"use client";

import Link from "next/link";
import { FilePen, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PaymentTrackingCard } from "./components/PaymentTrackingCard";
import { BroadcastCard } from "./components/BroadcastCard";
import { CommunicationLogsTable } from "./components/CommunicationLogsTable";
import { dummyPayments, dummyBroadcastLogs, PAGE_SIZE } from "./constants";
import { usePayments } from "@/hooks/features/admin/usePayments";

export function DesktopPaymentSection() {
  const {
    activeTab,
    currentPage,
    filteredPayments,
    totalPages,
    paginatedPayments,
    handleTabChange,
    handlePageChange,
  } = usePayments(dummyPayments);

  const empty = paginatedPayments.length === 0;
  const from = (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, filteredPayments.length);

  return (
    <div className="hidden space-y-2xl md:block">
      <PageHeader
        title="Payment Tracking"
        subtitle="Monitor pending collections and manage financial communications."
      >
        <Button size="lg" variant="secondary">
          <FilePen className="h-4 w-4" />
          Manual Input
        </Button>
      </PageHeader>

      <div className="grid grid-cols-12 gap-lg">
        <PaymentTrackingCard
          activeTab={activeTab}
          onTabChange={handleTabChange}
          paginatedPayments={paginatedPayments}
          filteredPayments={filteredPayments}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          empty={empty}
          from={from}
          to={to}
          headerAction={
            <Link
              href="/admin/payments/tagihan-menunggu"
              className="flex shrink-0 items-center gap-1 pb-3 text-label-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Lihat Semua
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <BroadcastCard />
        <CommunicationLogsTable logs={dummyBroadcastLogs} />
      </div>
    </div>
  );
}
