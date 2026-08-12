"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { loginAdmin, logout as logoutApi } from "@/lib/auth";

export function useAdminLogin() {
  const router = useRouter();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginAdmin(email, password),
    onSuccess: (user) => {
      setUser(user);
      router.push("/admin/dashboard");
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
