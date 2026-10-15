"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPOSIT_STATUS_OPTIONS } from "../constants";
import type { Tenant } from "@/types";

type Props = {
  penyewaId: string;
  status: string;
  tenants: Tenant[];
  onPenyewaChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onReset: () => void;
  hasActive: boolean;
};

export function DepositFilters({
  penyewaId,
  status,
  tenants,
  onPenyewaChange,
  onStatusChange,
  onReset,
  hasActive,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={penyewaId}
        items={[
          { value: "semua", label: "Semua Penghuni" },
          ...tenants.map((t) => ({ value: t.id, label: t.nama })),
        ]}
        onValueChange={(v) => v && onPenyewaChange(v)}
      >
        <SelectTrigger className="w-44 border-border bg-background">
          <SelectValue placeholder="Penghuni" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">Semua Penghuni</SelectItem>
          {tenants.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.nama}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status}
        items={DEPOSIT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        onValueChange={(v) => v && onStatusChange(v)}
      >
        <SelectTrigger className="w-44 border-border bg-background">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {DEPOSIT_STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  );
}
