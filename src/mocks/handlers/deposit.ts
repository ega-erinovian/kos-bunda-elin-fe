/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse } from "msw";
import { deposits } from "../fixtures/deposits";
import { tenants } from "../fixtures/tenants";
import { financeAccounts, financeTransactions, auditLogs } from "../fixtures/finance";
import type { Deposit, FinancialTransaction, DepositStatus } from "@/types";

function nid() {
  return `dep-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
const nowIso = () => new Date().toISOString();

const VALID_STATUSES: DepositStatus[] = ["HELD", "PARTIALLY_REFUNDED", "REFUNDED", "FORFEITED"];

function resolveDefaultAccountId(): string {
  const cash = financeAccounts.find((a) => a.type === "CASH" && a.active);
  if (cash) return cash.id;
  const anyActive = financeAccounts.find((a) => a.active);
  if (anyActive) return anyActive.id;
  const newAcc = {
    id: nid(),
    name: "Cash",
    type: "CASH" as const,
    openingBalance: 0,
    active: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  financeAccounts.push(newAcc as any);
  return newAcc.id;
}

function validateInvariant(
  deposit: Deposit,
  nextDeduction: number,
  nextRefund: number,
): string | null {
  if (nextDeduction + nextRefund > deposit.amountReceived + 1e-9) {
    return `deductionAmount (${nextDeduction}) + refundAmount (${nextRefund}) melebihi amountReceived (${deposit.amountReceived})`;
  }
  return null;
}

export const depositHandlers = [
  // GET /api/deposits?penyewaId=&status=
  http.get("*/deposits", ({ request }) => {
    const url = new URL(request.url);
    const penyewaId = url.searchParams.get("penyewaId");
    const status = url.searchParams.get("status");

    if (status && !VALID_STATUSES.includes(status as DepositStatus)) {
      return HttpResponse.json({ message: `status tidak valid: ${status}` }, { status: 400 });
    }

    let filtered = [...deposits];
    if (penyewaId) filtered = filtered.filter((d) => d.penyewaId === penyewaId);
    if (status) filtered = filtered.filter((d) => d.status === status);

    filtered.sort(
      (a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime(),
    );

    return HttpResponse.json({ success: true, data: filtered }, { status: 200 });
  }),

  // POST /api/deposits
  http.post("*/deposits", async ({ request }) => {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    if (!body.penyewaId || typeof body.penyewaId !== "string" || !body.penyewaId.trim()) {
      return HttpResponse.json({ message: "penyewaId wajib diisi" }, { status: 400 });
    }
    const tenant = tenants.find((t) => t.id === body.penyewaId);
    if (!tenant) {
      return HttpResponse.json({ message: "Penyewa tidak ditemukan" }, { status: 404 });
    }

    if (body.amountReceived === undefined || body.amountReceived === null) {
      return HttpResponse.json({ message: "amountReceived wajib diisi" }, { status: 400 });
    }
    if (typeof body.amountReceived === "string") {
      return HttpResponse.json(
        { message: "amountReceived harus number, bukan string" },
        { status: 400 },
      );
    }
    const amt = body.amountReceived;
    if (typeof amt !== "number" || Number.isNaN(amt) || amt <= 0) {
      return HttpResponse.json({ message: "amountReceived harus > 0" }, { status: 400 });
    }

    if (!body.receivedDate || typeof body.receivedDate !== "string") {
      return HttpResponse.json(
        { message: "receivedDate wajib diisi (ISO string)" },
        { status: 400 },
      );
    }
    const rd = new Date(body.receivedDate);
    if (Number.isNaN(rd.getTime())) {
      return HttpResponse.json({ message: "receivedDate tidak valid" }, { status: 400 });
    }
    if (rd.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
      return HttpResponse.json(
        { message: "receivedDate tidak boleh di masa depan" },
        { status: 400 },
      );
    }

    const deposit: Deposit = {
      id: nid(),
      penyewaId: body.penyewaId,
      amountReceived: amt,
      receivedDate: rd.toISOString(),
      deductionAmount: 0,
      status: "HELD",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    deposits.push(deposit);

    // Ledger: DEPOSIT income (cash movement, not rental revenue)
    const acctId = resolveDefaultAccountId();
    const trx: FinancialTransaction = {
      id: nid(),
      accountId: acctId,
      categoryId: "cat-other-income",
      tenantId: body.penyewaId,
      depositId: deposit.id,
      type: "INCOME",
      source: "DEPOSIT",
      amount: amt,
      transactionDate: rd.toISOString(),
      description: `Deposit diterima — ${tenant.nama}`,
      createdAt: nowIso(),
    };
    financeTransactions.push(trx);
    auditLogs.push({
      id: nid(),
      entity: "Deposit",
      entityId: deposit.id,
      action: "DEPOSIT_RECEIVED",
      afterValue: deposit,
      adminId: "admin-1",
      createdAt: nowIso(),
    });
    auditLogs.push({
      id: nid(),
      entity: "FinancialTransaction",
      entityId: trx.id,
      action: "TRANSACTION_CREATED",
      afterValue: trx,
      adminId: "admin-1",
      createdAt: nowIso(),
    });

    return HttpResponse.json({ success: true, data: deposit }, { status: 201 });
  }),

  // PATCH /api/deposits/:id/deduct
  http.patch("*/deposits/:id/deduct", async ({ request, params }) => {
    const { id } = params as { id: string };
    const dep = deposits.find((d) => d.id === id);
    if (!dep) return HttpResponse.json({ message: "Deposit tidak ditemukan" }, { status: 404 });
    if (dep.status === "REFUNDED" || dep.status === "FORFEITED") {
      return HttpResponse.json(
        { message: `Tidak dapat potong deposit dengan status ${dep.status}` },
        { status: 400 },
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    if (body.deductionAmount === undefined || body.deductionAmount === null) {
      return HttpResponse.json({ message: "deductionAmount wajib diisi" }, { status: 400 });
    }
    if (typeof body.deductionAmount === "string") {
      return HttpResponse.json({ message: "deductionAmount harus number" }, { status: 400 });
    }
    const dAmt = body.deductionAmount;
    if (typeof dAmt !== "number" || Number.isNaN(dAmt) || dAmt < 0) {
      return HttpResponse.json({ message: "deductionAmount harus >= 0" }, { status: 400 });
    }
    if (
      !body.deductionReason ||
      typeof body.deductionReason !== "string" ||
      !body.deductionReason.trim()
    ) {
      return HttpResponse.json({ message: "deductionReason wajib diisi" }, { status: 400 });
    }
    if (body.deductionReason.length > 500) {
      return HttpResponse.json({ message: "deductionReason max 500" }, { status: 400 });
    }

    const nextRefund = dep.refundAmount ?? 0;
    const invariant = validateInvariant(dep, dAmt, nextRefund);
    if (invariant) return HttpResponse.json({ message: invariant }, { status: 400 });

    const before = { ...dep };
    dep.deductionAmount = dAmt;
    dep.deductionReason = body.deductionReason.trim();
    dep.updatedAt = nowIso();
    // status stays HELD (deduct alone does not change status)

    auditLogs.push({
      id: nid(),
      entity: "Deposit",
      entityId: dep.id,
      action: "DEPOSIT_DEDUCTED",
      beforeValue: before,
      afterValue: { ...dep },
      adminId: "admin-1",
      createdAt: nowIso(),
    });

    return HttpResponse.json({ success: true, data: dep }, { status: 200 });
  }),

  // POST /api/deposits/:id/refund
  http.post("*/deposits/:id/refund", async ({ request, params }) => {
    const { id } = params as { id: string };
    const dep = deposits.find((d) => d.id === id);
    if (!dep) return HttpResponse.json({ message: "Deposit tidak ditemukan" }, { status: 404 });
    if (dep.status === "FORFEITED") {
      return HttpResponse.json(
        { message: "Deposit FORFEITED tidak dapat direfund" },
        { status: 400 },
      );
    }
    if (dep.status === "REFUNDED") {
      return HttpResponse.json({ message: "Deposit sudah REFUNDED" }, { status: 400 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    if (body.refundAmount === undefined || body.refundAmount === null) {
      return HttpResponse.json({ message: "refundAmount wajib diisi" }, { status: 400 });
    }
    if (typeof body.refundAmount === "string") {
      return HttpResponse.json({ message: "refundAmount harus number" }, { status: 400 });
    }
    const rAmt = body.refundAmount;
    if (typeof rAmt !== "number" || Number.isNaN(rAmt) || rAmt <= 0) {
      return HttpResponse.json({ message: "refundAmount harus > 0" }, { status: 400 });
    }
    if (!body.refundDate || typeof body.refundDate !== "string") {
      return HttpResponse.json({ message: "refundDate wajib diisi" }, { status: 400 });
    }
    const rd = new Date(body.refundDate);
    if (Number.isNaN(rd.getTime())) {
      return HttpResponse.json({ message: "refundDate tidak valid" }, { status: 400 });
    }
    if (rd.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
      return HttpResponse.json(
        { message: "refundDate tidak boleh di masa depan" },
        { status: 400 },
      );
    }

    const nextDeduction = dep.deductionAmount ?? 0;
    const invariant = validateInvariant(dep, nextDeduction, rAmt);
    if (invariant) return HttpResponse.json({ message: invariant }, { status: 400 });

    const before = { ...dep };
    dep.refundAmount = rAmt;
    dep.refundDate = rd.toISOString();
    dep.updatedAt = nowIso();

    const totalOut = nextDeduction + rAmt;
    if (totalOut >= dep.amountReceived - 1e-9) {
      dep.status = "REFUNDED";
    } else {
      dep.status = "PARTIALLY_REFUNDED";
    }

    // Ledger: DEPOSIT_REFUND expense
    const tenant = tenants.find((t) => t.id === dep.penyewaId);
    const acctId = resolveDefaultAccountId();
    const trx: FinancialTransaction = {
      id: nid(),
      accountId: acctId,
      categoryId: "cat-other-expense",
      tenantId: dep.penyewaId,
      depositId: dep.id,
      type: "EXPENSE",
      source: "DEPOSIT_REFUND",
      amount: rAmt,
      transactionDate: rd.toISOString(),
      description: `Refund deposit — ${tenant?.nama ?? dep.penyewaId}`,
      createdAt: nowIso(),
    };
    financeTransactions.push(trx);

    auditLogs.push({
      id: nid(),
      entity: "Deposit",
      entityId: dep.id,
      action: "DEPOSIT_REFUNDED",
      beforeValue: before,
      afterValue: { ...dep },
      adminId: "admin-1",
      createdAt: nowIso(),
    });
    auditLogs.push({
      id: nid(),
      entity: "FinancialTransaction",
      entityId: trx.id,
      action: "TRANSACTION_CREATED",
      afterValue: trx,
      adminId: "admin-1",
      createdAt: nowIso(),
    });

    return HttpResponse.json({ success: true, data: dep }, { status: 200 });
  }),
];
