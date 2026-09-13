import { setupWorker } from "msw/browser";
import { pembayaranHandlers } from "./handlers/pembayaran";
import { financeHandlers } from "./handlers/finance";

// Combine all handlers
const handlers = [...pembayaranHandlers, ...financeHandlers];

// Setup MSW worker for browser
export const worker = setupWorker(...handlers);
