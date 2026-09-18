"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FinancialAccount, FinancialCategory } from "@/types";

type Props = {
  categoryId: string;
  accountId: string;
  from: string;
  to: string;
  vendorName: string;
  expenseCats: FinancialCategory[];
  accounts: FinancialAccount[];
  onCategoryChange: (v: string) => void;
  onAccountChange: (v: string) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onVendorChange: (v: string) => void;
  onReset: () => void;
  hasActive: boolean;
};

export function ExpenseFilters({
  categoryId,
  accountId,
  from,
  to,
  vendorName,
  expenseCats,
  accounts,
  onCategoryChange,
  onAccountChange,
  onFromChange,
  onToChange,
  onVendorChange,
  onReset,
  hasActive,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={categoryId}
        onValueChange={(v) => {
          if (v !== null) onCategoryChange(v);
        }}
      >
        <SelectTrigger className="w-44 border-border bg-background">
          <Filter className="h-4 w-4" />
          <SelectValue placeholder="Kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">Semua Kategori</SelectItem>
          {expenseCats.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={accountId}
        onValueChange={(v) => {
          if (v !== null) onAccountChange(v);
        }}
      >
        <SelectTrigger className="w-40 border-border bg-background">
          <SelectValue placeholder="Akun" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">Semua Akun</SelectItem>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Cari vendor"
        value={vendorName}
        onChange={(e) => onVendorChange(e.target.value)}
        className="h-8 w-36 border-border bg-background"
      />

      <Input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="h-8 w-36 border-border bg-background"
      />
      <Input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className="h-8 w-36 border-border bg-background"
      />

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  );
}
