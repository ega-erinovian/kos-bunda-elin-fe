import { setupServer } from "msw/node";
import { pembayaranHandlers } from "./handlers/pembayaran";

// Combine all handlers
const handlers = [...pembayaranHandlers];

// Setup MSW server for Node (tests)
export const server = setupServer(...handlers);
