"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, LogIn, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogin, type LoginRole } from "@/hooks/api/use-auth";
import { useAuth } from "@/providers/auth-provider";
import { AuthInputField } from "./components/login/AuthInputField";

interface LoginFormProps {
  variant?: LoginRole;
  reason?: string;
}

const VARIANT_COPY: Record<
  LoginRole,
  { title: string; description: string; emailPlaceholder: string }
> = {
  admin: {
    title: "Masuk ke Panel",
    description: "Silakan masuk dengan akun admin Kos Bunda Elin.",
    emailPlaceholder: "admin@kosbundaelin.test",
  },
  tenant: {
    title: "Masuk Akun Penyewa",
    description: "Silakan masuk dengan akun penyewa Kos Bunda Elin.",
    emailPlaceholder: "nama@email.com",
  },
};

const REASON_MESSAGES: Record<string, string> = {
  unauthorized: "Anda harus masuk terlebih dahulu untuk mengakses halaman admin.",
  forbidden: "Akun Anda tidak memiliki izin untuk mengakses halaman admin.",
  expired: "Sesi Anda telah berakhir. Silakan masuk kembali.",
};

export function LoginForm({ variant = "admin", reason }: LoginFormProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const login = useLogin(variant);
  const copy = VARIANT_COPY[variant];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.role === "tenant" ? "/tenant/dashboard" : "/admin/dashboard");
    }
  }, [isLoading, user, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (login.isPending) return;
    login.mutate({ email, password });
  }

  return (
    <div className="mx-auto w-full space-y-6 rounded-3xl border border-border/30 bg-card p-6 shadow-ambient-md sm:p-8">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-heading-lg-mobile font-bold text-on-surface">
          {copy.title}
        </h1>
        <p className="text-body-md text-on-surface-variant">{copy.description}</p>
      </div>

      {reason && REASON_MESSAGES[reason] && (
        <p role="alert" className="text-center text-label-md text-destructive">
          {REASON_MESSAGES[reason]}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInputField
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={copy.emailPlaceholder}
          value={email}
          onChange={(v) => {
            setEmail(v);
            login.reset();
          }}
          required
        />

        <AuthInputField
          id="password"
          label="Kata Sandi"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(v) => {
            setPassword(v);
            login.reset();
          }}
          required
        />

        {login.isError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-label-md text-destructive">
              {login.error?.message || "Login gagal. Silakan coba lagi."}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={login.isPending || !email || !password}
          className="h-11.5 w-full rounded-xl bg-primary text-on-primary hover:bg-primary/90"
        >
          {login.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Masuk
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
