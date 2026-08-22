import { setupWorker } from "msw/browser";
import { pembayaranHandlers } from "./handlers/pembayaran";

// Combine all handlers
const handlers = [...pembayaranHandlers];

// Setup MSW worker for browser
export const worker = setupWorker(...handlers);
