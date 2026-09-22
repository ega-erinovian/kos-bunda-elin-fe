"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useReportsSection } from "@/hooks/features/admin/report/useReportsSection";
import { REPORT_TABS } from "./constants";
import { ReportDateRangePicker } from "./ReportDateRangePicker";
import { ReportsDashboardPanel } from "./ReportsDashboardPanel";
import { RevenueReportPanel } from "./RevenueReportPanel";
import { ExpenseReportPanel } from "./ExpenseReportPanel";
import { CashFlowReportPanel } from "./CashFlowReportPanel";
import { IncomeStatementReportPanel } from "./IncomeStatementReportPanel";
import { TransactionsReportPanel } from "./TransactionsReportPanel";

export function ReportsSection() {
  const {
    from,
    to,
    tab,
    todayStr,
    rangeError,
    isValid,
    txType,
    txCategoryId,
    dashboard,
    revenue,
    expense,
    cashFlow,
    incomeStatement,
    transactions,
    transactionsLoading,
    transactionsError,
    isLoading,
    isError,
    dashboardLoading,
    dashboardError,
    refetchAll,
    handleFromChange,
    handleToChange,
    handleTabChange,
    handleResetRange,
    handleTxTypeChange,
    handleTxCategoryChange,
  } = useReportsSection();

  const showRangeErrorInline = !!rangeError;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Keuangan"
        subtitle="Billed vs cash, beban, arus kas, dan laba rugi — satu rentang untuk semua panel"
      >
        <Button variant="outline" size="sm" onClick={refetchAll} className="w-full sm:w-auto">
          Muat ulang
        </Button>
      </PageHeader>

      <ReportDateRangePicker
        from={from}
        to={to}
        todayStr={todayStr}
        rangeError={rangeError}
        onFromChange={handleFromChange}
        onToChange={handleToChange}
        onReset={handleResetRange}
      />

      {/* Tabs — scrollable on mobile, pill style */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {REPORT_TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={active}
              data-active={active}
              onClick={() => handleTabChange(t.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-label-md font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-ambient-sm"
                  : "border-border bg-card text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Guard: invalid range blocks non-dashboard panels */}
      {showRangeErrorInline && tab !== "dashboard" && (
        <Card className="border-amber-200 bg-amber-50 p-4 text-label-sm text-amber-900">
          Perbaiki rentang tanggal untuk melihat panel ini.
        </Card>
      )}

      {/* Panels */}
      <div className="pb-6">
        {tab === "dashboard" && (
          <ReportsDashboardPanel
            data={dashboard}
            isLoading={dashboardLoading}
            isError={dashboardError}
            onRetry={refetchAll}
          />
        )}

        {tab === "revenue" && (
          <>
            {!isValid && !rangeError ? (
              <Card className="p-8 text-center text-body-md text-on-surface-variant">
                Pilih rentang tanggal yang valid.
              </Card>
            ) : (
              <RevenueReportPanel
                data={revenue}
                isLoading={isLoading}
                isError={isError}
                onRetry={refetchAll}
              />
            )}
          </>
        )}

        {tab === "expenses" && (
          <>
            {!isValid && !rangeError ? (
              <Card className="p-8 text-center text-body-md text-on-surface-variant">
                Pilih rentang tanggal yang valid.
              </Card>
            ) : (
              <ExpenseReportPanel
                data={expense}
                isLoading={isLoading}
                isError={isError}
                onRetry={refetchAll}
              />
            )}
          </>
        )}

        {tab === "cash-flow" && (
          <>
            {!isValid && !rangeError ? (
              <Card className="p-8 text-center text-body-md text-on-surface-variant">
                Pilih rentang tanggal yang valid.
              </Card>
            ) : (
              <CashFlowReportPanel
                data={cashFlow}
                isLoading={isLoading}
                isError={isError}
                onRetry={refetchAll}
              />
            )}
          </>
        )}

        {tab === "income-statement" && (
          <>
            {!isValid && !rangeError ? (
              <Card className="p-8 text-center text-body-md text-on-surface-variant">
                Pilih rentang tanggal yang valid.
              </Card>
            ) : (
              <IncomeStatementReportPanel
                data={incomeStatement}
                isLoading={isLoading}
                isError={isError}
                onRetry={refetchAll}
              />
            )}
          </>
        )}

        {tab === "transactions" && (
          <>
            {!isValid ? (
              <Card className="p-8 text-center text-body-md text-on-surface-variant">
                Pilih rentang tanggal yang valid.
              </Card>
            ) : (
              <TransactionsReportPanel
                data={transactions}
                isLoading={transactionsLoading}
                isError={transactionsError}
                onRetry={refetchAll}
                typeFilter={txType}
                categoryFilter={txCategoryId}
                onTypeChange={handleTxTypeChange}
                onCategoryChange={handleTxCategoryChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
