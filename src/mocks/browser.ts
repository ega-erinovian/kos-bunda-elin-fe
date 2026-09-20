import { setupWorker } from "msw/browser";
import { pembayaranHandlers } from "./handlers/pembayaran";
import { financeHandlers } from "./handlers/finance";
import { expenseHandlers } from "./handlers/expense";

import { receivableHandlers } from "./handlers/receivable";

// Combine all handlers
const handlers = [
  ...pembayaranHandlers,
  ...financeHandlers,
  ...expenseHandlers,
  ...receivableHandlers,
];

// Setup MSW worker for browser
export const worker = setupWorker(...handlers);
