import { setupWorker } from "msw/browser";
import { pembayaranHandlers } from "./handlers/pembayaran";
import { financeHandlers } from "./handlers/finance";
import { expenseHandlers } from "./handlers/expense";

import { receivableHandlers } from "./handlers/receivable";
import { depositHandlers } from "./handlers/deposit";
import { reportHandlers } from "./handlers/report";

const handlers = [
  ...reportHandlers,
  ...pembayaranHandlers,
  ...financeHandlers,
  ...expenseHandlers,
  ...receivableHandlers,
  ...depositHandlers,
];

export const worker = setupWorker(...handlers);
