"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { loginAdmin, loginTenant, logout as logoutApi } from "@/lib/auth";

export function useAdminLogin() {
  const router = useRouter();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginAdmin(email, password),
    onSuccess: (data) => {
      setUser(data.user);
      router.push("/admin/dashboard");
    },
  });
}

export function useTenantLogin() {
  const router = useRouter();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginTenant(email, password),
    onSuccess: (data) => {
      setUser(data.user);
      router.push("/tenant/dashboard");
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
