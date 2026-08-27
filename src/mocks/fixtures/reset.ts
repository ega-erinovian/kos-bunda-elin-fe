import { resetTenants } from "./tenants";
import { resetPembayaran } from "./pembayaran";

export function resetFixtures() {
  resetTenants();
  resetPembayaran();
}
