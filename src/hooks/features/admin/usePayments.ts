"use client";

import { useState, useMemo } from "react";
import type { Payment, PaymentTab } from "../../../components/features/admin/payment/types";
import { PAGE_SIZE } from "../../../components/features/admin/payment/constants";

export function usePayments(payments: Payment[], pageSize = PAGE_SIZE) {
  const [activeTab, setActiveTab] = useState<PaymentTab>("approaching");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => p.tab === activeTab);
  }, [payments, activeTab]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function handleTabChange(tab: PaymentTab) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  return {
    activeTab,
    currentPage,
    filteredPayments,
    totalPages,
    paginatedPayments,
    handleTabChange,
    handlePageChange,
  };
}
