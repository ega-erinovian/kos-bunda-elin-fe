"use client";

import { useState, type ComponentType } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AuthInputFieldProps {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  type?: "text" | "email" | "password";
  inputMode?: "email" | "text";
  autoComplete?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function AuthInputField({
  id,
  label,
  icon: Icon,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  value,
  onChange,
  required,
}: AuthInputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-label-md text-on-surface-variant">
        {label}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        )}
        <Input
          id={id}
          type={inputType}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-11.5 rounded-xl border-secondary-container bg-surface-container-lowest text-body-md shadow-[0_4px_20px_-2px_rgba(134,167,137,0.08)]",
            Icon && "pl-12",
            isPassword ? "pr-12" : "pr-4",
          )}
          required={required}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-muted hover:text-on-surface"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
}