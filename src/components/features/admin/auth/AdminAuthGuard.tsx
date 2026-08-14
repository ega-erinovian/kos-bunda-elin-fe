"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { onUnauthorized } from "@/lib/api";

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    let sessionChecked = false;

    function redirectToLogin(reason: string) {
      if (active) router.replace(`/login?reason=${reason}`);
    }

    getCurrentUser()
      .then((user) => {
        if (user.role !== "admin") {
          redirectToLogin("forbidden");
          return;
        }
        if (active) setIsAuthorized(true);
      })
      .catch(() => redirectToLogin("unauthorized"))
      .finally(() => {
        sessionChecked = true;
      });

    const unsubscribe = onUnauthorized(() => {
      if (sessionChecked) {
        redirectToLogin("expired");
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}