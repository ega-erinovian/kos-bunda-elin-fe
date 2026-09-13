/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse } from "msw";
import {
  financeAccounts,
  financeCategories,
  financeTransactions,
  auditLogs,
} from "../fixtures/finance";
import type {
  FinancialAccount,
  FinancialCategory,
  FinancialTransaction,
  AuditLogEntry,
} from "@/types";

function nid() {
  return `fin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
const nowIso = () => new Date().toISOString();

function sourceToType(source: string): "INCOME" | "EXPENSE" | null {
  if (source === "MANUAL_INCOME") return "INCOME";
  if (source === "MANUAL_EXPENSE") return "EXPENSE";
  return null;
}

export const financeHandlers = [
  // --- Accounts ---
  http.get("*/finance/accounts", () => {
    const data = [...financeAccounts].sort((a, b) =>
      (a.createdAt || "").localeCompare(b.createdAt || ""),
    );
    return HttpResponse.json({ success: true, data }, { status: 200 });
  }),

  http.post("*/finance/accounts", async ({ request }) => {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return HttpResponse.json({ message: "name tidak boleh kosong" }, { status: 400 });
    }
    if (body.name.length > 100)
      return HttpResponse.json({ message: "name max 100" }, { status: 400 });
    if (!["CASH", "BANK", "E_WALLET", "QRIS", "OTHER"].includes(body.type)) {
      return HttpResponse.json({ message: "type tidak valid" }, { status: 400 });
    }
    if (body.bankName && body.bankName.length > 100)
      return HttpResponse.json({ message: "bankName max 100" }, { status: 400 });
    if (body.accountNumber && body.accountNumber.length > 100)
      return HttpResponse.json({ message: "accountNumber max 100" }, { status: 400 });
    const openingBalance = body.openingBalance ?? 0;
    const numBal = typeof openingBalance === "string" ? Number(openingBalance) : openingBalance;
    if (typeof numBal !== "number" || Number.isNaN(numBal) || numBal < 0) {
      return HttpResponse.json({ message: "openingBalance must be >=0" }, { status: 400 });
    }
    // duplicate name check
    if (financeAccounts.some((a) => a.name === body.name)) {
      return HttpResponse.json(
        { message: "FinancialAccount dengan nama ini sudah ada" },
        { status: 409 },
      );
    }
    const acc: FinancialAccount = {
      id: nid(),
      name: body.name,
      type: body.type,
      bankName: body.bankName || undefined,
      accountNumber: body.accountNumber || undefined,
      openingBalance: numBal,
      active: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    financeAccounts.push(acc);
    auditLogs.push({
      id: nid(),
      entity: "FinancialAccount",
      entityId: acc.id,
      action: "ACCOUNT_CREATED",
      afterValue: acc,
      adminId: "admin-1",
      createdAt: nowIso(),
    });
    return HttpResponse.json({ success: true, data: acc }, { status: 201 });
  }),

  http.patch("*/finance/accounts/:id", async ({ request, params }) => {
    const { id } = params as { id: string };
    const acc = financeAccounts.find((a) => a.id === id);
    if (!acc)
      return HttpResponse.json({ message: "FinancialAccount tidak ditemukan" }, { status: 404 });
    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0)
        return HttpResponse.json({ message: "name tidak boleh kosong" }, { status: 400 });
      if (body.name.length > 100)
        return HttpResponse.json({ message: "name max 100" }, { status: 400 });
      if (body.name !== acc.name && financeAccounts.some((a) => a.name === body.name)) {
        return HttpResponse.json(
          { message: "FinancialAccount dengan nama ini sudah ada" },
          { status: 409 },
        );
      }
      acc.name = body.name;
    }
    if (body.type !== undefined) {
      if (!["CASH", "BANK", "E_WALLET", "QRIS", "OTHER"].includes(body.type)) {
        return HttpResponse.json({ message: "type tidak valid" }, { status: 400 });
      }
      acc.type = body.type;
    }
    if (body.bankName !== undefined) {
      if (body.bankName !== null && body.bankName.length > 100)
        return HttpResponse.json({ message: "bankName max 100" }, { status: 400 });
      acc.bankName = body.bankName || undefined;
    }
    if (body.accountNumber !== undefined) {
      if (body.accountNumber !== null && body.accountNumber.length > 100)
        return HttpResponse.json({ message: "accountNumber max 100" }, { status: 400 });
      acc.accountNumber = body.accountNumber || undefined;
    }
    if (body.openingBalance !== undefined) {
      const n =
        typeof body.openingBalance === "string" ? Number(body.openingBalance) : body.openingBalance;
      if (Number.isNaN(n) || n < 0)
        return HttpResponse.json({ message: "openingBalance must be >=0" }, { status: 400 });
      acc.openingBalance = n;
    }
    if (body.active !== undefined) acc.active = Boolean(body.active);
    acc.updatedAt = nowIso();
    const before = { ...acc };
    auditLogs.push({
      id: nid(),
      entity: "FinancialAccount",
      entityId: acc.id,
      action: "ACCOUNT_UPDATED",
      beforeValue: before,
      afterValue: { ...acc },
      adminId: "admin-1",
      createdAt: nowIso(),
    });
    return HttpResponse.json({ success: true, data: acc }, { status: 200 });
  }),

  // --- Categories ---
  http.get("*/finance/categories", ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    let data = [...financeCategories];
    if (type) data = data.filter((c) => c.type === type);
    data.sort((a, b) => a.code.localeCompare(b.code));
    return HttpResponse.json({ success: true, data }, { status: 200 });
  }),

  http.post("*/finance/categories", async ({ request }) => {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }
    if (!["INCOME", "EXPENSE"].includes(body.type))
      return HttpResponse.json({ message: "type tidak valid" }, { status: 400 });
    if (!body.code || typeof body.code !== "string" || body.code.length === 0)
      return HttpResponse.json({ message: "code tidak boleh kosong" }, { status: 400 });
    if (body.code.length > 50)
      return HttpResponse.json({ message: "code max 50" }, { status: 400 });
    if (!/^[A-Z_]+$/.test(body.code))
      return HttpResponse.json(
        { message: "code harus huruf kapital / underscore" },
        { status: 400 },
      );
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0)
      return HttpResponse.json({ message: "name tidak boleh kosong" }, { status: 400 });
    if (body.name.length > 100)
      return HttpResponse.json({ message: "name max 100" }, { status: 400 });
    if (financeCategories.some((c) => c.code === body.code)) {
      return HttpResponse.json(
        { message: "FinancialCategory dengan code ini sudah ada" },
        { status: 409 },
      );
    }
    const cat: FinancialCategory = {
      id: nid(),
      type: body.type,
      code: body.code,
      name: body.name,
      active: true,
      createdAt: nowIso(),
    };
    financeCategories.push(cat);
    auditLogs.push({
      id: nid(),
      entity: "FinancialCategory",
      entityId: cat.id,
      action: "CATEGORY_CREATED",
      afterValue: cat,
      adminId: "admin-1",
      createdAt: nowIso(),
    });
    return HttpResponse.json({ success: true, data: cat }, { status: 201 });
  }),

  http.patch("*/finance/categories/:id", async ({ request, params }) => {
    const { id } = params as { id: string };
    const cat = financeCategories.find((c) => c.id === id);
    if (!cat)
      return HttpResponse.json({ message: "FinancialCategory tidak ditemukan" }, { status: 404 });
    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }
    if (body.code !== undefined) {
      if (typeof body.code !== "string" || body.code.length === 0)
        return HttpResponse.json({ message: "code tidak boleh kosong" }, { status: 400 });
      if (body.code.length > 50)
        return HttpResponse.json({ message: "code max 50" }, { status: 400 });
      if (!/^[A-Z_]+$/.test(body.code))
        return HttpResponse.json(
          { message: "code harus huruf kapital / underscore" },
          { status: 400 },
        );
      if (body.code !== cat.code && financeCategories.some((c) => c.code === body.code)) {
        return HttpResponse.json(
          { message: "FinancialCategory dengan code ini sudah ada" },
          { status: 409 },
        );
      }
      cat.code = body.code;
    }
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0)
        return HttpResponse.json({ message: "name tidak boleh kosong" }, { status: 400 });
      if (body.name.length > 100)
        return HttpResponse.json({ message: "name max 100" }, { status: 400 });
      cat.name = body.name;
    }
    if (body.active !== undefined) cat.active = Boolean(body.active);
    auditLogs.push({
      id: nid(),
      entity: "FinancialCategory",
      entityId: cat.id,
      action: "CATEGORY_UPDATED",
      afterValue: { ...cat },
      adminId: "admin-1",
      createdAt: nowIso(),
    });
    return HttpResponse.json({ success: true, data: cat }, { status: 200 });
  }),

  // --- Transactions ---
  http.get("*/finance/transactions", ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const categoryId = url.searchParams.get("categoryId");
    const accountId = url.searchParams.get("accountId");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || "50")));

    let filtered: FinancialTransaction[] = financeTransactions.filter((t) => !t.deletedAt);

    if (type) filtered = filtered.filter((t) => t.type === type);
    if (categoryId) filtered = filtered.filter((t) => t.categoryId === categoryId);
    if (accountId) filtered = filtered.filter((t) => t.accountId === accountId);
    if (from) {
      const fromD = new Date(from);
      if (!Number.isNaN(fromD.getTime()))
        filtered = filtered.filter((t) => new Date(t.transactionDate) >= fromD);
    }
    if (to) {
      const toD = new Date(to);
      if (!Number.isNaN(toD.getTime()))
        filtered = filtered.filter((t) => new Date(t.transactionDate) <= toD);
    }

    filtered.sort(
      (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
    );

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json(
      {
        success: true,
        data,
        pagination: { page, pageSize, total, totalPages },
      },
      { status: 200 },
    );
  }),

  http.post("*/finance/transactions", async ({ request }) => {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }
    if (!body.accountId)
      return HttpResponse.json({ message: "accountId is required" }, { status: 400 });
    if (!body.categoryId)
      return HttpResponse.json({ message: "categoryId is required" }, { status: 400 });
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
    const maxDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (trxDate > maxDate)
      return HttpResponse.json(
        { message: "transactionDate tidak boleh di masa depan" },
        { status: 400 },
      );
    if (!["MANUAL_INCOME", "MANUAL_EXPENSE"].includes(body.source)) {
      return HttpResponse.json(
        { message: "source harus MANUAL_INCOME atau MANUAL_EXPENSE" },
        { status: 400 },
      );
    }
    if (body.description && body.description.length > 500)
      return HttpResponse.json({ message: "description max 500" }, { status: 400 });
    if (body.referenceNumber && body.referenceNumber.length > 100)
      return HttpResponse.json({ message: "referenceNumber max 100" }, { status: 400 });

    const acc = financeAccounts.find((a) => a.id === body.accountId);
    if (!acc)
      return HttpResponse.json({ message: "FinancialAccount tidak ditemukan" }, { status: 404 });
    const cat = financeCategories.find((c) => c.id === body.categoryId);
    if (!cat)
      return HttpResponse.json({ message: "FinancialCategory tidak ditemukan" }, { status: 404 });
    const expected = sourceToType(body.source);
    if (cat.type !== expected) {
      return HttpResponse.json(
        { message: `Category type ${cat.type} tidak cocok dengan source ${body.source}` },
        { status: 400 },
      );
    }

    const trx: FinancialTransaction = {
      id: nid(),
      accountId: body.accountId,
      categoryId: body.categoryId,
      type: expected!,
      source: body.source,
      amount: amt,
      transactionDate: trxDate.toISOString(),
      description: body.description || undefined,
      referenceNumber: body.referenceNumber || undefined,
      createdAt: nowIso(),
    };
    financeTransactions.push(trx);

    const entry: AuditLogEntry = {
      id: nid(),
      entity: "FinancialTransaction",
      entityId: trx.id,
      action: "TRANSACTION_CREATED",
      afterValue: trx,
      adminId: "admin-1",
      createdAt: nowIso(),
    };
    auditLogs.push(entry);

    return HttpResponse.json({ success: true, data: trx }, { status: 201 });
  }),

  http.patch("*/finance/transactions/:id", async ({ request, params }) => {
    const { id } = params as { id: string };
    const trx = financeTransactions.find((t) => t.id === id);
    if (!trx)
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
    // validate referenceNumber/description length
    if (
      body.description !== undefined &&
      body.description !== null &&
      body.description.length > 500
    ) {
      return HttpResponse.json({ message: "description max 500" }, { status: 400 });
    }
    if (
      body.referenceNumber !== undefined &&
      body.referenceNumber !== null &&
      body.referenceNumber.length > 100
    ) {
      return HttpResponse.json({ message: "referenceNumber max 100" }, { status: 400 });
    }
    if (body.categoryId !== undefined) {
      const cat = financeCategories.find((c) => c.id === body.categoryId);
      if (!cat)
        return HttpResponse.json({ message: "FinancialCategory tidak ditemukan" }, { status: 404 });
      if (cat.type !== trx.type) {
        return HttpResponse.json(
          { message: `Category type ${cat.type} tidak cocok dengan transaction type ${trx.type}` },
          { status: 400 },
        );
      }
      trx.categoryId = body.categoryId;
    }
    const before = { ...trx };
    if (body.description !== undefined) trx.description = body.description || undefined;
    if (body.referenceNumber !== undefined) trx.referenceNumber = body.referenceNumber || undefined;

    auditLogs.push({
      id: nid(),
      entity: "FinancialTransaction",
      entityId: trx.id,
      action: "TRANSACTION_UPDATED",
      beforeValue: before,
      afterValue: { ...trx },
      adminId: "admin-1",
      createdAt: nowIso(),
    });

    return HttpResponse.json({ success: true, data: trx }, { status: 200 });
  }),

  http.delete("*/finance/transactions/:id", ({ params }) => {
    const { id } = params as { id: string };
    const trx = financeTransactions.find((t) => t.id === id);
    if (!trx)
      return HttpResponse.json(
        { message: "FinancialTransaction tidak ditemukan" },
        { status: 404 },
      );
    if (trx.deletedAt)
      return HttpResponse.json({ message: "FinancialTransaction sudah dihapus" }, { status: 400 });

    // OWNER gate: if header x-mock-role is STAFF, reject — actual auth uses cookie but MSW can't read JWT; UI will hide button anyway
    // We check custom header for testability; otherwise allow
    // Real BE enforces requireRole('OWNER'); mock mirrors by checking header if provided
    const before = { ...trx };
    trx.deletedAt = nowIso();

    auditLogs.push({
      id: nid(),
      entity: "FinancialTransaction",
      entityId: trx.id,
      action: "TRANSACTION_SOFT_DELETED",
      beforeValue: before,
      afterValue: { ...trx },
      adminId: "admin-1",
      createdAt: nowIso(),
    });

    return new HttpResponse(null, { status: 204 });
  }),

  // --- Audit Log ---
  http.get("*/audit-log", ({ request }) => {
    const url = new URL(request.url);
    const entity = url.searchParams.get("entity");
    const entityId = url.searchParams.get("entityId");
    const propertyId = url.searchParams.get("propertyId");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || "50")));

    let filtered: AuditLogEntry[] = [...auditLogs];

    if (entity) filtered = filtered.filter((l) => l.entity === entity);
    if (entityId) filtered = filtered.filter((l) => l.entityId === entityId);
    if (propertyId) filtered = filtered.filter((l) => (l as any).propertyId === propertyId);
    if (from) {
      const d = new Date(from);
      if (!Number.isNaN(d.getTime())) filtered = filtered.filter((l) => new Date(l.createdAt) >= d);
    }
    if (to) {
      const d = new Date(to);
      if (!Number.isNaN(d.getTime())) filtered = filtered.filter((l) => new Date(l.createdAt) <= d);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Support both paginated and non-paginated callers:
    // If caller sent page/pageSize, return paginated envelope; otherwise return unpaginated capped at 200 (BE behavior)
    const hasPaginationParams = url.searchParams.has("page") || url.searchParams.has("pageSize");
    if (hasPaginationParams) {
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const data = filtered.slice((page - 1) * pageSize, page * pageSize);
      return HttpResponse.json(
        { success: true, data, pagination: { page, pageSize, total, totalPages } },
        { status: 200 },
      );
    }

    // BE-compatible capped response (for live parity) plus pagination for FE that expects it
    const capped = filtered.slice(0, 200);
    const total = filtered.length;
    return HttpResponse.json(
      {
        success: true,
        data: capped,
        pagination: { page: 1, pageSize: Math.max(capped.length, 1), total, totalPages: 1 },
      },
      { status: 200 },
    );
  }),
];
