import { setupServer } from "msw/node";
import { pembayaranHandlers } from "./handlers/pembayaran";
import { financeHandlers } from "./handlers/finance";

// Combine all handlers
const handlers = [...pembayaranHandlers, ...financeHandlers];

// Setup MSW server for Node (tests)
export const server = setupServer(...handlers);
