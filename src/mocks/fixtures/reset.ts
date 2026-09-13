import { resetTenants } from "./tenants";
import { resetPembayaran } from "./pembayaran";
import { resetFinance } from "./finance";

export function resetFixtures() {
  resetTenants();
  resetPembayaran();
  resetFinance();
}
