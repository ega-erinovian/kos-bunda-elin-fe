"use client";

import { useEffect, useState } from "react";

export function usePagedSearch({ debounceMs = 300 }: { debounceMs?: number } = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearchQuery(searchQuery.trim()),
      searchQuery ? debounceMs : 0,
    );
    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  function handleSearch(value: string) {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  function resetPage() {
    setCurrentPage(1);
  }

  return {
    searchQuery,
    debouncedSearchQuery,
    currentPage,
    handleSearch,
    handlePageChange,
    resetPage,
  };
}
