import { setupServer } from "msw/node";
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

// Setup MSW server for Node (tests)
export const server = setupServer(...handlers);
