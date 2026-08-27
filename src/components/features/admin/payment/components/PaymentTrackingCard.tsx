"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentRow } from "./PaymentRow";
import type { Payment, PaymentTab } from "../types";

type PaymentTrackingCardProps = {
  activeTab: PaymentTab;
  onTabChange: (tab: PaymentTab) => void;
  paginatedPayments: Payment[];
  filteredPayments: Payment[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  empty: boolean;
  from: number;
  to: number;
  headerAction?: ReactNode;
  onEdit?: (payment: Payment) => void;
};

export function PaymentTrackingCard({
  activeTab,
  onTabChange,
  paginatedPayments,
  filteredPayments,
  currentPage,
  totalPages,
  onPageChange,
  empty,
  from,
  to,
  headerAction,
  onEdit,
}: PaymentTrackingCardProps) {
  return (
    <div className="col-span-12 flex flex-col rounded-xl border border-outline-variant/20 bg-surface p-lg shadow-ambient-md transition-shadow hover:shadow-ambient-lg lg:col-span-8">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-outline-variant/30">
        <div
          role="tablist"
          aria-label="Filter pembayaran"
          className="flex gap-1 overflow-x-auto no-scrollbar md:gap-4"
        >
          <button
            role="tab"
            aria-selected={activeTab === "approaching"}
            type="button"
            onClick={() => onTabChange("approaching")}
            className={`shrink-0 cursor-pointer whitespace-nowrap px-3 pb-3 pt-2 text-label-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:px-4 ${
              activeTab === "approaching"
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Mendekati Jatuh Tempo (H-3)
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "overdue"}
            type="button"
            onClick={() => onTabChange("overdue")}
            className={`shrink-0 cursor-pointer whitespace-nowrap px-3 pb-3 pt-2 text-label-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:px-4 ${
              activeTab === "overdue"
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Menunggak (H+)
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "partial"}
            type="button"
            onClick={() => onTabChange("partial")}
            className={`shrink-0 cursor-pointer whitespace-nowrap px-3 pb-3 pt-2 text-label-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:px-4 ${
              activeTab === "partial"
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Sebagian
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "paid"}
            type="button"
            onClick={() => onTabChange("paid")}
            className={`shrink-0 cursor-pointer whitespace-nowrap px-3 pb-3 pt-2 text-label-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:px-4 ${
              activeTab === "paid"
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Lunas
          </button>
        </div>
        <div className="shrink-0">{headerAction}</div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {!empty ? (
          paginatedPayments.map((payment) => (
            <PaymentRow key={payment.id} payment={payment} onEdit={onEdit} />
          ))
        ) : (
          <div className="py-12 text-center text-body-md text-on-surface-variant">
            {activeTab === "approaching"
              ? "Tidak ada pembayaran yang mendekati jatuh tempo."
              : activeTab === "overdue"
                ? "Tidak ada pembayaran yang menunggak."
                : activeTab === "partial"
                  ? "Tidak ada pembayaran sebagian."
                  : "Tidak ada pembayaran yang sudah lunas."}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-outline-variant/30 px-1 pt-4">
          <span className="text-label-sm text-on-surface-variant">
            Menampilkan {from}-{to} dari {filteredPayments.length}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
