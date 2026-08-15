"use client";

import { useState, useMemo } from "react";
import type { Payment, PaymentTab } from "@/components/features/admin/payment/types";
import { PAGE_SIZE } from "@/components/features/admin/payment/constants";

export function usePaymentsSearch(payments: Payment[], pageSize = PAGE_SIZE) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<PaymentTab>("approaching");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (p.tab !== activeTab) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.room.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [payments, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function handleSearch(value: string) {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function handleTabChange(tab: PaymentTab) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  return {
    searchQuery,
    activeTab,
    currentPage,
    filteredPayments,
    totalPages,
    paginatedPayments,
    handleSearch,
    handleTabChange,
    handlePageChange,
  };
}
