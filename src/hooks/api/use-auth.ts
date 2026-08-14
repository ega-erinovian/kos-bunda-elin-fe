"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { loginAdmin, loginTenant, logout as logoutApi } from "@/lib/auth";

export type LoginRole = "admin" | "tenant";

const REDIRECT_PATHS: Record<LoginRole, string> = {
  admin: "/admin/dashboard",
  tenant: "/tenant/dashboard",
};

export function useLogin(role: LoginRole = "admin") {
  const router = useRouter();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      role === "tenant" ? loginTenant(email, password) : loginAdmin(email, password),
    onSuccess: (user) => {
      setUser(user);
      router.push(REDIRECT_PATHS[role]);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      setUser(null);
      router.push("/login");
    },
  });
}
