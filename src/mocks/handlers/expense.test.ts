import { describe, it, expect } from "vitest";
import { api } from "@/lib/api";

// These tests exercise the MSW expense handlers via lib/api — no real network.
// They mirror Phase 4 acceptance criteria: vendor required, reversal OWNER-gated, reversed stays visible.

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function apiFetch(path: string, init?: RequestInit) {
  // Use global fetch intercepted by MSW server (setup.ts started it)
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

describe("Phase 4 — Expenses MSW contract", () => {
  it("GET /expenses returns paginated envelope with default page", async () => {
    const res = await apiFetch("/expenses");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.pagination).toBeDefined();
    expect(json.pagination.page).toBe(1);
    expect(json.pagination.pageSize).toBe(50);
    expect(typeof json.pagination.total).toBe("number");
  });

  it("POST /expenses requires vendorName (400)", async () => {
    const res = await apiFetch("/expenses", {
      method: "POST",
      body: JSON.stringify({
        categoryId: "cat-electricity",
        accountId: "fin-acc-cash",
        amount: 100000,
        transactionDate: new Date().toISOString(),
        // vendorName missing
      }),
    });
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.message).toMatch(/vendorName/i);
  });

  it("POST /expenses rejects future transactionDate (400)", async () => {
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const res = await apiFetch("/expenses", {
      method: "POST",
      body: JSON.stringify({
        categoryId: "cat-electricity",
        accountId: "fin-acc-cash",
        amount: 100000,
        transactionDate: future,
        vendorName: "Future Vendor",
      }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /expenses creates with vendor required + GET list count increases by one, original stays", async () => {
    const before = await (await apiFetch("/expenses")).json();
    const beforeTotal: number = before.pagination.total;

    const createRes = await apiFetch("/expenses", {
      method: "POST",
      body: JSON.stringify({
        categoryId: "cat-electricity",
        accountId: "fin-acc-cash",
        amount: 123000,
        transactionDate: new Date().toISOString(),
        vendorName: "Toko Test",
        receiptUrl: "https://example.com/receipt.pdf",
        description: "Test expense",
      }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created.data.vendorName).toBe("Toko Test");
    expect(created.data.type).toBe("EXPENSE");
    expect(created.data.source).toBe("MANUAL_EXPENSE");

    const after = await (await apiFetch("/expenses")).json();
    expect(after.pagination.total).toBe(beforeTotal + 1);
    expect(after.data.find((t: { id: string }) => t.id === created.data.id)).toBeDefined();
  });

  it("POST /expenses/:id/reverse is OWNER-gated (403 for STAFF header)", async () => {
    // create one expense to reverse
    const cr = await apiFetch("/expenses", {
      method: "POST",
      body: JSON.stringify({
        categoryId: "cat-water",
        accountId: "fin-acc-cash",
        amount: 50000,
        transactionDate: new Date().toISOString(),
        vendorName: "Reversal Vendor",
      }),
    });
    const { data } = await cr.json();

    const forbidden = await apiFetch(`/expenses/${data.id}/reverse`, {
      method: "POST",
      headers: { "x-mock-role": "STAFF" },
      body: JSON.stringify({ reason: "salah input" }),
    });
    expect(forbidden.status).toBe(403);
  });

  it("POST /expenses/:id/reverse creates offsetting ADJUSTMENT, original gets Reversed by", async () => {
    const cr = await apiFetch("/expenses", {
      method: "POST",
      body: JSON.stringify({
        categoryId: "cat-cleaning",
        accountId: "fin-acc-cash",
        amount: 77000,
        transactionDate: new Date().toISOString(),
        vendorName: "Reversal Ok Vendor",
      }),
    });
    const { data } = await cr.json();

    const revRes = await apiFetch(`/expenses/${data.id}/reverse`, {
      method: "POST",
      body: JSON.stringify({ reason: "koreksi" }),
    });
    expect(revRes.status).toBe(201);
    const revJson = await revRes.json();
    expect(revJson.data.reversal.source).toBe("ADJUSTMENT");
    expect(revJson.data.reversal.type).toBe("INCOME");
    expect(revJson.data.reversal.amount).toBe(data.amount);

    // original still present in list with Reversed by tag (Ponytail: list count goes up by one, original stays)
    const list = await (await apiFetch("/expenses")).json();
    const origInList = list.data.find((t: { id: string }) => t.id === data.id);
    expect(origInList).toBeDefined();
    expect(origInList.description).toMatch(/Reversed by/);

    // second reversal should 409
    const second = await apiFetch(`/expenses/${data.id}/reverse`, {
      method: "POST",
      body: JSON.stringify({ reason: "again" }),
    });
    expect(second.status).toBe(409);
  });

  it("POST /finance/transactions/:id/reverse mirrors same semantics for any manual tx", async () => {
    // use lib/api to ensure path matches real hook: POST /finance/transactions/:id/reverse
    const cr = await apiFetch("/expenses", {
      method: "POST",
      body: JSON.stringify({
        categoryId: "cat-electricity",
        accountId: "fin-acc-cash",
        amount: 99000,
        transactionDate: new Date().toISOString(),
        vendorName: "Finance Reverse Vendor",
      }),
    });
    const { data } = await cr.json();

    const rev = await api.post<{ success: boolean; data: { reversal: { id: string } } }>(
      `/finance/transactions/${data.id}/reverse`,
      { reason: "via finance route" },
    );
    expect(rev.data.reversal.id).toBeDefined();
  });
});
