import type AdminUser from "./AdminUser";

export default interface AuthResponse {
  success: boolean;
  data: { admin: AdminUser };
}
