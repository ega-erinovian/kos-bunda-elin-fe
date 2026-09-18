/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse } from "msw";
import {
  financeAccounts,
  financeCategories,
  financeTransactions,
  auditLogs,
} from "../fixtures/finance";
import type { FinancialTransaction } from "@/types";

function nid() {
  return `fin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
const nowIso = () => new Date().toISOString();

function isValidUrl(s: string): boolean {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

function checkOwner(request: Request): Response | null {
  const role = request.headers.get("x-mock-role");
  if (role === "STAFF") {
    return HttpResponse.json({ message: "Forbidden: OWNER only" }, { status: 403 });
  }
  return null;
}

export const expenseHandlers = [
  // GET /api/expenses
  http.get("*/expenses", ({ request }) => {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");
    const accountId = url.searchParams.get("accountId");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const vendorName = url.searchParams.get("vendorName");
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || "50")));

    let filtered = financeTransactions.filter((t) => !t.deletedAt && t.type === "EXPENSE");

    if (categoryId) filtered = filtered.filter((t) => t.categoryId === categoryId);
    if (accountId) filtered = filtered.filter((t) => t.accountId === accountId);
    if (vendorName) {
      const q = vendorName.toLowerCase();
      filtered = filtered.filter((t) => (t.vendorName ?? "").toLowerCase().includes(q));
    }
    if (from) {
      const d = new Date(from);
      if (!Number.isNaN(d.getTime()))
        filtered = filtered.filter((t) => new Date(t.transactionDate) >= d);
    }
    if (to) {
      const d = new Date(to);
      if (!Number.isNaN(d.getTime()))
        filtered = filtered.filter((t) => new Date(t.transactionDate) <= d);
    }

    filtered.sort(
      (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
    );

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json(
      { success: true, data, pagination: { page, pageSize, total, totalPages } },
      { status: 200 },
    );
  }),

  // POST /api/expenses
  http.post("*/expenses", async ({ request }) => {
    const ownerBlock = checkOwner(request);
    void ownerBlock; // create expense does not require OWNER, only reversal does — keep no-op for create

    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    if (!body.categoryId)
      return HttpResponse.json({ message: "categoryId is required" }, { status: 400 });
    if (!body.accountId)
      return HttpResponse.json({ message: "accountId is required" }, { status: 400 });
    if (body.amount === undefined || body.amount === null)
      return HttpResponse.json({ message: "amount is required" }, { status: 400 });
    const amt = typeof body.amount === "string" ? Number(body.amount) : body.amount;
    if (typeof amt !== "number" || Number.isNaN(amt) || amt <= 0)
      return HttpResponse.json({ message: "amount must be > 0" }, { status: 400 });

    if (!body.transactionDate)
      return HttpResponse.json({ message: "transactionDate is required" }, { status: 400 });
    const trxDate = new Date(body.transactionDate);
    if (Number.isNaN(trxDate.getTime()))
      return HttpResponse.json({ message: "transactionDate invalid" }, { status: 400 });
    if (trxDate > new Date())
      return HttpResponse.json(
        { message: "transactionDate tidak boleh di masa depan" },
        { status: 400 },
      );

    if (
      body.vendorName === undefined ||
      body.vendorName === null ||
      String(body.vendorName).trim().length === 0
    )
      return HttpResponse.json({ message: "vendorName tidak boleh kosong" }, { status: 400 });
    if (String(body.vendorName).length > 200)
      return HttpResponse.json({ message: "vendorName max 200" }, { status: 400 });

    if (body.receiptUrl !== undefined && body.receiptUrl !== null && body.receiptUrl !== "") {
      if (typeof body.receiptUrl !== "string" || body.receiptUrl.length > 500)
        return HttpResponse.json({ message: "receiptUrl max 500" }, { status: 400 });
      if (!isValidUrl(body.receiptUrl))
        return HttpResponse.json({ message: "receiptUrl harus URL valid" }, { status: 400 });
    }
    if (
      body.description !== undefined &&
      body.description !== null &&
      body.description.length > 500
    )
      return HttpResponse.json({ message: "description max 500" }, { status: 400 });
    if (
      body.referenceNumber !== undefined &&
      body.referenceNumber !== null &&
      body.referenceNumber.length > 100
    )
      return HttpResponse.json({ message: "referenceNumber max 100" }, { status: 400 });

    const acc = financeAccounts.find((a) => a.id === body.accountId);
    if (!acc)
      return HttpResponse.json({ message: "FinancialAccount tidak ditemukan" }, { status: 404 });
    const cat = financeCategories.find((c) => c.id === body.categoryId);
    if (!cat)
      return HttpResponse.json({ message: "FinancialCategory tidak ditemukan" }, { status: 404 });
    if (cat.type !== "EXPENSE")
      return HttpResponse.json(
        { message: `Category type ${cat.type} tidak cocok untuk expense (harus EXPENSE)` },
        { status: 400 },
      );

    const trx: FinancialTransaction = {
      id: nid(),
      accountId: body.accountId,
      categoryId: body.categoryId,
      type: "EXPENSE",
      source: "MANUAL_EXPENSE",
      amount: amt,
      transactionDate: trxDate.toISOString(),
      vendorName: String(body.vendorName),
      receiptUrl: body.receiptUrl || undefined,
      description: body.description || undefined,
      referenceNumber: body.referenceNumber || undefined,
      createdAt: nowIso(),
    };
    financeTransactions.push(trx);

    auditLogs.push({
      id: nid(),
      entity: "FinancialTransaction",
      entityId: trx.id,
      action: "EXPENSE_CREATED",
      afterValue: trx,
      adminId: "admin-1",
      createdAt: nowIso(),
    });

    return HttpResponse.json({ success: true, data: trx }, { status: 201 });
  }),

  // PATCH /api/expenses/:id
  http.patch("*/expenses/:id", async ({ request, params }) => {
    const { id } = params as { id: string };
    const trx = financeTransactions.find((t) => t.id === id);
    if (!trx || trx.type !== "EXPENSE")
      return HttpResponse.json(
        { message: "FinancialTransaction tidak ditemukan" },
        { status: 404 },
      );
    if (trx.deletedAt)
      return HttpResponse.json({ message: "FinancialTransaction sudah dihapus" }, { status: 400 });

    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    if (body.vendorName !== undefined) {
      if (body.vendorName === null)
        return HttpResponse.json({ message: "vendorName tidak boleh null" }, { status: 400 });
      if (typeof body.vendorName !== "string" || body.vendorName.trim().length === 0)
        return HttpResponse.json({ message: "vendorName tidak boleh kosong" }, { status: 400 });
      if (body.vendorName.length > 200)
        return HttpResponse.json({ message: "vendorName max 200" }, { status: 400 });
      trx.vendorName = body.vendorName;
    }
    if (body.receiptUrl !== undefined) {
      if (body.receiptUrl === null) {
        trx.receiptUrl = undefined;
      } else if (body.receiptUrl === "") {
        trx.receiptUrl = undefined;
      } else {
        if (typeof body.receiptUrl !== "string" || body.receiptUrl.length > 500)
          return HttpResponse.json({ message: "receiptUrl max 500" }, { status: 400 });
        if (!isValidUrl(body.receiptUrl))
          return HttpResponse.json({ message: "receiptUrl harus URL valid" }, { status: 400 });
        trx.receiptUrl = body.receiptUrl;
      }
    }
    if (body.description !== undefined) {
      if (body.description === null) {
        trx.description = undefined;
      } else {
        if (typeof body.description !== "string" || body.description.length > 500)
          return HttpResponse.json({ message: "description max 500" }, { status: 400 });
        trx.description = body.description || undefined;
      }
    }

    const before = { ...trx };
    auditLogs.push({
      id: nid(),
      entity: "FinancialTransaction",
      entityId: trx.id,
      action: "EXPENSE_UPDATED",
      beforeValue: before,
      afterValue: { ...trx },
      adminId: "admin-1",
      createdAt: nowIso(),
    });

    return HttpResponse.json({ success: true, data: trx }, { status: 200 });
  }),

  // POST /api/expenses/:id/reverse  [OWNER]
  http.post("*/expenses/:id/reverse", async ({ request, params }) => {
    const deny = checkOwner(request);
    if (deny) return deny;
    const { id } = params as { id: string };
    const orig = financeTransactions.find((t) => t.id === id);
    if (!orig || orig.type !== "EXPENSE")
      return HttpResponse.json(
        { message: "FinancialTransaction tidak ditemukan" },
        { status: 404 },
      );
    if (orig.deletedAt)
      return HttpResponse.json({ message: "FinancialTransaction sudah dihapus" }, { status: 400 });
    if (["RENT_PAYMENT", "DEPOSIT", "DEPOSIT_REFUND"].includes(orig.source))
      return HttpResponse.json(
        { message: "Hanya transaksi manual yang dapat direversal" },
        { status: 400 },
      );

    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }
    if (!body.reason || typeof body.reason !== "string" || body.reason.trim().length === 0)
      return HttpResponse.json({ message: "reason tidak boleh kosong" }, { status: 400 });
    if (body.reason.length > 500)
      return HttpResponse.json({ message: "reason max 500" }, { status: 400 });

    const already = financeTransactions.find(
      (t) => t.source === "ADJUSTMENT" && (t.description ?? "").includes(`Reversal of ${orig.id}`),
    );
    if (already)
      return HttpResponse.json({ message: "Transaksi sudah direversal" }, { status: 409 });

    const reversal: FinancialTransaction = {
      id: nid(),
      accountId: orig.accountId,
      categoryId: orig.categoryId,
      type: "INCOME",
      source: "ADJUSTMENT",
      amount: orig.amount,
      transactionDate: nowIso(),
      description: `Reversal of ${orig.id}: ${body.reason}`,
      referenceNumber: orig.referenceNumber,
      createdAt: nowIso(),
    };
    financeTransactions.push(reversal);

    const desc = `${orig.description ?? ""} | Reversed by ${reversal.id}: ${body.reason}`
      .trim()
      .replace(/^\|\s*/, "");
    orig.description = desc;

    auditLogs.push({
      id: nid(),
      entity: "FinancialTransaction",
      entityId: orig.id,
      action: "EXPENSE_REVERSED",
      beforeValue: { ...orig, description: orig.description },
      afterValue: { ...reversal },
      adminId: "admin-1",
      createdAt: nowIso(),
    });

    return HttpResponse.json({ success: true, data: { reversal } }, { status: 201 });
  }),

  // POST /api/finance/transactions/:id/reverse  [OWNER] — shared reverse for any manual tx
  http.post("*/finance/transactions/:id/reverse", async ({ request, params }) => {
    const deny = checkOwner(request);
    if (deny) return deny;
    const { id } = params as { id: string };
    const orig = financeTransactions.find((t) => t.id === id);
    if (!orig)
      return HttpResponse.json(
        { message: "FinancialTransaction tidak ditemukan" },
        { status: 404 },
      );
    if (orig.deletedAt)
      return HttpResponse.json({ message: "FinancialTransaction sudah dihapus" }, { status: 400 });
    if (["RENT_PAYMENT", "DEPOSIT", "DEPOSIT_REFUND"].includes(orig.source))
      return HttpResponse.json(
        { message: "Hanya transaksi manual yang dapat direversal" },
        { status: 400 },
      );

    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }
    if (!body.reason || typeof body.reason !== "string" || body.reason.trim().length === 0)
      return HttpResponse.json({ message: "reason tidak boleh kosong" }, { status: 400 });
    if (body.reason.length > 500)
      return HttpResponse.json({ message: "reason max 500" }, { status: 400 });

    const already = financeTransactions.find(
      (t) => t.source === "ADJUSTMENT" && (t.description ?? "").includes(`Reversal of ${orig.id}`),
    );
    if (already)
      return HttpResponse.json({ message: "Transaksi sudah direversal" }, { status: 409 });

    const reversalType = orig.type === "EXPENSE" ? "INCOME" : "EXPENSE";
    const reversal: FinancialTransaction = {
      id: nid(),
      accountId: orig.accountId,
      categoryId: orig.categoryId,
      type: reversalType,
      source: "ADJUSTMENT",
      amount: orig.amount,
      transactionDate: nowIso(),
      description: `Reversal of ${orig.id}: ${body.reason}`,
      referenceNumber: orig.referenceNumber,
      createdAt: nowIso(),
    };
    financeTransactions.push(reversal);

    const desc = `${orig.description ?? ""} | Reversed by ${reversal.id}: ${body.reason}`
      .trim()
      .replace(/^\|\s*/, "");
    orig.description = desc;

    const action = orig.type === "EXPENSE" ? "EXPENSE_REVERSED" : "TRANSACTION_REVERSED";
    auditLogs.push({
      id: nid(),
      entity: "FinancialTransaction",
      entityId: orig.id,
      action,
      beforeValue: { ...orig },
      afterValue: { ...reversal },
      adminId: "admin-1",
      createdAt: nowIso(),
    });

    return HttpResponse.json({ success: true, data: { reversal } }, { status: 201 });
  }),
];
