"use client"

import { useState, useMemo } from "react"
import type { BroadcastLog, BroadcastLogStatus } from "@/components/features/admin/payment/types"
import { LOGS_PAGE_SIZE } from "@/components/features/admin/payment/constants"

export function useBroadcastLogs(
  logs: BroadcastLog[],
  pageSize = LOGS_PAGE_SIZE,
) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<BroadcastLogStatus | "all">("all")
  const [filterType, setFilterType] = useState<"all" | "sms" | "email" | "push">("all")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!log.recipient.toLowerCase().includes(q)) return false
      }
      if (filterStatus !== "all" && log.status !== filterStatus) return false
      if (filterType !== "all" && log.type !== filterType) return false
      return true
    })
  }, [logs, searchQuery, filterStatus, filterType])

  const totalPages = Math.ceil(filteredLogs.length / pageSize)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  function handleSearch(value: string) {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  function handleStatusFilterChange(value: BroadcastLogStatus | "all") {
    setFilterStatus(value)
    setCurrentPage(1)
  }

  function handleTypeFilterChange(value: "all" | "sms" | "email" | "push") {
    setFilterType(value)
    setCurrentPage(1)
  }

  function handlePageChange(page: number) {
    setCurrentPage(page)
  }

  return {
    searchQuery,
    filterStatus,
    filterType,
    currentPage,
    filteredLogs,
    totalPages,
    paginatedLogs,
    handleSearch,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handlePageChange,
  }
}
