import type AdminUser from "./AdminUser";

export default interface MeResponse {
  success: boolean;
  data: AdminUser;
}
