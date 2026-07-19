import { api } from "./api";
import type { AuthResponse, User } from "@/types";

export async function loginAdmin(email: string, password: string) {
  return api.post<AuthResponse>("/auth/admin/login", { email, password });
}

export async function loginTenant(email: string, password: string) {
  return api.post<AuthResponse>("/auth/tenant/login", { email, password });
}

export async function logout() {
  return api.post<{ message: string }>("/auth/logout");
}

export async function getCurrentUser() {
  return api.get<User>("/auth/me");
}
