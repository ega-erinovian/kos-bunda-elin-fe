import { setupServer } from "msw/node";
import { pembayaranHandlers } from "./handlers/pembayaran";
import { financeHandlers } from "./handlers/finance";
import { expenseHandlers } from "./handlers/expense";

import { receivableHandlers } from "./handlers/receivable";
import { depositHandlers } from "./handlers/deposit";
import { reportHandlers } from "./handlers/report";
import { dashboardHandlers } from "./handlers/dashboard";

const handlers = [
  ...dashboardHandlers,
  ...reportHandlers,
  ...pembayaranHandlers,
  ...financeHandlers,
  ...expenseHandlers,
  ...receivableHandlers,
  ...depositHandlers,
];

export const server = setupServer(...handlers);
