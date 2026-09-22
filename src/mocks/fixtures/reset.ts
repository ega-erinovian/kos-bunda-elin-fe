import { resetTenants } from "./tenants";
import { resetPembayaran } from "./pembayaran";
import { resetFinance } from "./finance";
import { resetDeposits } from "./deposits";

export function resetFixtures() {
  resetTenants();
  resetPembayaran();
  resetFinance();
  resetDeposits();
}
