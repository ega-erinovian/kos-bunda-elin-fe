"use client";

import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReceivableSortKey } from "@/hooks/features/admin/receivable/useReceivablesSection";

type Props = {
  asOf: string;
  today: string;
  isFutureAsOf: boolean;
  sortKey: ReceivableSortKey;
  onAsOfChange: (v: string) => void;
  onSortKeyChange: (v: ReceivableSortKey) => void;
  onReset: () => void;
};

export function ReceivablesFilters({
  asOf,
  today,
  isFutureAsOf,
  sortKey,
  onAsOfChange,
  onSortKeyChange,
  onReset,
}: Props) {
  const hasActive = asOf !== today || sortKey !== "outstanding";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="date"
        aria-label="Tanggal posisi piutang"
        value={asOf}
        max={today}
        onChange={(e) => onAsOfChange(e.target.value)}
        className="h-8 w-40 border-border bg-background"
      />
      <Select
        value={sortKey}
        onValueChange={(v) => {
          if (v !== null) onSortKeyChange(v as ReceivableSortKey);
        }}
      >
        <SelectTrigger className="w-44 border-border bg-background">
          <SelectValue placeholder="Urutkan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="outstanding">Nominal terbesar</SelectItem>
          <SelectItem value="unpaidPeriods">Periode terbanyak</SelectItem>
        </SelectContent>
      </Select>

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}

      {isFutureAsOf && (
        <p role="alert" className="flex w-full items-center gap-1 text-label-sm text-destructive">
          <CalendarDays className="h-4 w-4" />
          Tanggal tidak boleh di masa depan.
        </p>
      )}
    </div>
  );
}
