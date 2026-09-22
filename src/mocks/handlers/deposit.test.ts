import { describe, it, expect } from "vitest";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

describe("Phase 6 — Deposits MSW contract", () => {
  it("GET /deposits returns seeded data including FORFEITED", async () => {
    const res = await apiFetch("/deposits");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(4);
    const statuses = json.data.map((d: { status: string }) => d.status);
    expect(statuses).toContain("FORFEITED");
    expect(statuses).toContain("HELD");
    // monetary fields are numbers
    for (const d of json.data) {
      expect(typeof d.amountReceived).toBe("number");
      expect(typeof d.deductionAmount).toBe("number");
    }
  });

  it("GET /deposits?status=HELD filters", async () => {
    const res = await apiFetch("/deposits?status=HELD");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.every((d: { status: string }) => d.status === "HELD")).toBe(true);
  });

  it("GET /deposits?status=BOGUS → 400", async () => {
    const res = await apiFetch("/deposits?status=BOGUS");
    expect(res.status).toBe(400);
  });

  it("GET /deposits?penyewaId filters", async () => {
    const res = await apiFetch("/deposits?penyewaId=tenant-1");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.every((d: { penyewaId: string }) => d.penyewaId === "tenant-1")).toBe(true);
  });

  it("POST /deposits requires penyewaId/404 and rejects string amount", async () => {
    const notFound = await apiFetch("/deposits", {
      method: "POST",
      body: JSON.stringify({
        penyewaId: "nope",
        amountReceived: 1000000,
        receivedDate: new Date().toISOString(),
      }),
    });
    expect(notFound.status).toBe(404);

    const stringAmt = await apiFetch("/deposits", {
      method: "POST",
      body: JSON.stringify({
        penyewaId: "tenant-1",
        amountReceived: "1500000",
        receivedDate: new Date().toISOString(),
      }),
    });
    expect(stringAmt.status).toBe(400);
    const j = await stringAmt.json();
    expect(j.message).toMatch(/number/i);
  });

  it("POST /deposits rejects future receivedDate", async () => {
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const res = await apiFetch("/deposits", {
      method: "POST",
      body: JSON.stringify({
        penyewaId: "tenant-1",
        amountReceived: 1000000,
        receivedDate: future,
      }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /deposits happy → HELD, creates DEPOSIT ledger row, amount is number", async () => {
    const cr = await apiFetch("/deposits", {
      method: "POST",
      body: JSON.stringify({
        penyewaId: "tenant-2",
        amountReceived: 750000,
        receivedDate: new Date().toISOString(),
      }),
    });
    expect(cr.status).toBe(201);
    const json = await cr.json();
    expect(json.data.status).toBe("HELD");
    expect(json.data.deductionAmount).toBe(0);
    expect(typeof json.data.amountReceived).toBe("number");

    const txRes = await apiFetch("/finance/transactions?type=INCOME");
    expect(txRes.status).toBe(200);
    const txJson = await txRes.json();
    const linked = txJson.data.find(
      (t: { depositId: string; source: string }) =>
        t.depositId === json.data.id && t.source === "DEPOSIT",
    );
    expect(linked).toBeDefined();
    expect(linked.type).toBe("INCOME");
  });

  it("PATCH /deposits/:id/deduct replaces, rejects exceeding invariant, rejects REFUNDED/FORFEITED", async () => {
    const cr = await apiFetch("/deposits", {
      method: "POST",
      body: JSON.stringify({
        penyewaId: "tenant-1",
        amountReceived: 1000000,
        receivedDate: new Date().toISOString(),
      }),
    });
    const dep = (await cr.json()).data as { id: string; amountReceived: number };

    // happy deduct
    const d1 = await apiFetch(`/deposits/${dep.id}/deduct`, {
      method: "PATCH",
      body: JSON.stringify({ deductionAmount: 200000, deductionReason: "Kerusakan" }),
    });
    expect(d1.status).toBe(200);
    const d1Json = await d1.json();
    expect(d1Json.data.deductionAmount).toBe(200000);
    expect(d1Json.data.status).toBe("HELD");

    // replace
    const d2 = await apiFetch(`/deposits/${dep.id}/deduct`, {
      method: "PATCH",
      body: JSON.stringify({ deductionAmount: 300000, deductionReason: "Bersih" }),
    });
    expect(d2.status).toBe(200);
    const d2Json = await d2.json();
    expect(d2Json.data.deductionAmount).toBe(300000);
    expect(d2Json.data.deductionReason).toBe("Bersih");

    // invariant: deduct + refund > amountReceived → 400
    // first refund partially
    const r1 = await apiFetch(`/deposits/${dep.id}/refund`, {
      method: "POST",
      body: JSON.stringify({ refundAmount: 500000, refundDate: new Date().toISOString() }),
    });
    expect(r1.status).toBe(200);
    // now try to increase deduction beyond limit
    const d3 = await apiFetch(`/deposits/${dep.id}/deduct`, {
      method: "PATCH",
      body: JSON.stringify({ deductionAmount: 600000, deductionReason: "over" }),
    });
    expect(d3.status).toBe(400);
  });

  it("POST /deposits/:id/refund enforces invariant, computes PARTIALLY_REFUNDED → REFUNDED, creates DEPOSIT_REFUND ledger", async () => {
    const cr = await apiFetch("/deposits", {
      method: "POST",
      body: JSON.stringify({
        penyewaId: "tenant-3",
        amountReceived: 1000000,
        receivedDate: new Date().toISOString(),
      }),
    });
    const dep = (await cr.json()).data as { id: string };

    // deduct 200k first
    const d = await apiFetch(`/deposits/${dep.id}/deduct`, {
      method: "PATCH",
      body: JSON.stringify({ deductionAmount: 200000, deductionReason: "cat" }),
    });
    expect(d.status).toBe(200);

    // partial refund → PARTIALLY_REFUNDED
    const rPart = await apiFetch(`/deposits/${dep.id}/refund`, {
      method: "POST",
      body: JSON.stringify({ refundAmount: 300000, refundDate: new Date().toISOString() }),
    });
    expect(rPart.status).toBe(200);
    const rPartJson = await rPart.json();
    expect(rPartJson.data.status).toBe("PARTIALLY_REFUNDED");
    expect(rPartJson.data.refundAmount).toBe(300000);
    expect(typeof rPartJson.data.refundAmount).toBe("number");

    // invariant: over-refund → 400
    const over = await apiFetch(`/deposits/${dep.id}/refund`, {
      method: "POST",
      body: JSON.stringify({ refundAmount: 900000, refundDate: new Date().toISOString() }),
    });
    expect(over.status).toBe(400);

    // full refund remaining (500k) → REFUNDED
    const rFull = await apiFetch(`/deposits/${dep.id}/refund`, {
      method: "POST",
      body: JSON.stringify({ refundAmount: 800000, refundDate: new Date().toISOString() }),
    });
    // after previous partial 300k, this refund REPLACES previous? Contract: refund sets refundAmount, not accumulate. So to test HELD→PARTIALLY→REFUNDED we need to understand: refundAmount is set, not added? Our handler replaces refundAmount each call, so next call with 800k will make total 200k+800k=1M → REFUNDED. Let's assert that.
    expect(rFull.status).toBe(200);
    const rFullJson = await rFull.json();
    // deduction 200k + refund 800k = 1M => REFUNDED
    expect(rFullJson.data.status).toBe("REFUNDED");

    // already REFUNDED → further refund 400
    const again = await apiFetch(`/deposits/${dep.id}/refund`, {
      method: "POST",
      body: JSON.stringify({ refundAmount: 100000, refundDate: new Date().toISOString() }),
    });
    expect(again.status).toBe(400);

    // check DEPOSIT_REFUND ledger exists
    const txRes = await apiFetch("/finance/transactions?type=EXPENSE");
    const txJson = await txRes.json();
    const refunds = txJson.data.filter(
      (t: { depositId: string; source: string }) =>
        t.depositId === dep.id && t.source === "DEPOSIT_REFUND",
    );
    expect(refunds.length).toBeGreaterThanOrEqual(1);
  });

  it("FORFEITED deposit is renderable and rejects deduct/refund", async () => {
    const list = await (await apiFetch("/deposits?status=FORFEITED")).json();
    const forfeited = list.data[0];
    expect(forfeited.status).toBe("FORFEITED");

    const ded = await apiFetch(`/deposits/${forfeited.id}/deduct`, {
      method: "PATCH",
      body: JSON.stringify({ deductionAmount: 100000, deductionReason: "x" }),
    });
    expect(ded.status).toBe(400);

    const ref = await apiFetch(`/deposits/${forfeited.id}/refund`, {
      method: "POST",
      body: JSON.stringify({ refundAmount: 100000, refundDate: new Date().toISOString() }),
    });
    expect(ref.status).toBe(400);
  });
});
