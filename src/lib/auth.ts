import { api } from "./api";
import type { AdminUser, AuthResponse, LogoutResponse, MeResponse, User } from "@/types";

function toUser(admin: AdminUser): User {
  return {
    id: admin.id,
    name: admin.nama,
    email: admin.email,
    role: "admin",
  };
}

export async function loginAdmin(email: string, password: string) {
  const res = await api.post<AuthResponse>("/auth/login", { email, password });
  return toUser(res.data.admin);
}

export async function getCurrentUser() {
  const res = await api.get<MeResponse>("/auth/me");
  return toUser(res.data);
}

export async function logout() {
  return api.post<LogoutResponse>("/auth/logout");
}
