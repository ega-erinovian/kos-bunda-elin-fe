"use client";

import { useState } from "react";
import Link from "next/link";
import { FilePen, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PaymentTrackingCard } from "./components/PaymentTrackingCard";
import { PaymentFormDialog } from "./components/PaymentFormDialog";
import { BroadcastCard } from "./components/BroadcastCard";
import { CommunicationLogsTable } from "./components/CommunicationLogsTable";
import { dummyBroadcastLogs, PAGE_SIZE } from "./constants";
import { usePayments as usePaymentsHook } from "@/hooks/features/admin/usePayments";
import { usePayments as useApiPayments } from "@/hooks/api/use-payments";
import { transformApiPaymentToAdminPayment } from "@/lib/utils";
import type { Payment as ApiPayment } from "@/types";

export function DesktopPaymentSection() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ApiPayment | null>(null);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const paymentsQuery = useApiPayments({
    periodeBulan: currentMonth,
    periodeTahun: currentYear,
  });

  const adminPayments = (paymentsQuery?.data?.data || [])
    .filter(
      (p) =>
        p.status === "BELUM_BAYAR" ||
        p.status === "TERLAMBAT" ||
        p.status === "SEBAGIAN" ||
        p.status === "LUNAS",
    )
    .map(transformApiPaymentToAdminPayment);

  const {
    activeTab,
    currentPage,
    filteredPayments,
    totalPages,
    paginatedPayments,
    handleTabChange,
    handlePageChange,
  } = usePaymentsHook(adminPayments);

  const empty = paginatedPayments.length === 0;

  const apiPayments = paymentsQuery?.data?.data ?? [];

  const handleEdit = (payment: (typeof adminPayments)[number]) => {
    setEditingPayment(apiPayments.find((p) => p.id === payment.id) ?? null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingPayment(null);
  };
  const from = (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, filteredPayments.length);

  return (
    <div className="hidden space-y-2xl md:block">
      <PageHeader
        title="Payment Tracking"
        subtitle="Monitor pending collections and manage financial communications."
      >
        <Button size="lg" variant="secondary" onClick={() => setFormOpen(true)}>
          <FilePen className="h-4 w-4" />
          Manual Input
        </Button>
      </PageHeader>

      <div className="grid grid-cols-12 gap-lg">
        {paymentsQuery?.isLoading ? (
          <div className="col-span-12 text-center py-8 text-sm text-slate-500">
            Memuat data pembayaran...
          </div>
        ) : (
          <>
            <PaymentTrackingCard
              activeTab={activeTab}
              onTabChange={handleTabChange}
              paginatedPayments={paginatedPayments}
              filteredPayments={filteredPayments}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              empty={empty}
              onEdit={handleEdit}
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
          </>
        )}
      </div>

      <PaymentFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        editingPayment={editingPayment}
      />
    </div>
  );
}
