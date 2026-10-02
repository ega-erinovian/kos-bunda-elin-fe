"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearLabel?: string;
  className?: string;
  wrapperClassName?: string;
  iconClassName?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Cari...",
  clearLabel = "Hapus pencarian",
  className,
  wrapperClassName,
  iconClassName,
}: SearchInputProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <Search
        className={cn(
          "absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant",
          iconClassName,
        )}
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("w-full rounded-xl pl-12 pr-9", className)}
      />
      {value && (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-on-surface-variant hover:text-on-surface"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
