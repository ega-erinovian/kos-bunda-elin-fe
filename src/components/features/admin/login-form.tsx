"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminLogin } from "@/hooks/api/use-auth";
import { useAuth } from "@/providers/auth-provider";

export function LoginForm() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const login = useAdminLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/admin/dashboard");
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
          Masuk ke Panel
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Silakan masuk dengan akun admin Kos Bunda Elin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-label-md text-on-surface-variant">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="admin@kosbundaelin.test"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                login.reset();
              }}
              className="h-[46px] rounded-xl border-secondary-container bg-surface-container-lowest pl-12 pr-4 text-body-md shadow-[0_4px_20px_-2px_rgba(134,167,137,0.08)]"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-label-md text-on-surface-variant">
            Kata Sandi
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                login.reset();
              }}
              className="h-[46px] rounded-xl border-secondary-container bg-surface-container-lowest pl-12 pr-12 text-body-md shadow-[0_4px_20px_-2px_rgba(134,167,137,0.08)]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-muted hover:text-on-surface"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

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
          className="h-[46px] w-full rounded-xl bg-primary text-on-primary hover:bg-primary/90"
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
