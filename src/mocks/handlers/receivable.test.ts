import { describe, it, expect } from "vitest";
import { pembayaranList } from "../fixtures/pembayaran";

// These tests exercise the MSW receivable handlers — no real network.
// They mirror Phase 5 acceptance criteria: numbers always derived from the bill
// fixture store, SEBAGIAN contributes only its remainder, asOf validation.

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

describe("Phase 5 — Receivables & Aging MSW contract", () => {
  it("GET /receivables returns { success, data } grouped per tenant, sorted desc", async () => {
    const res = await apiFetch("/receivables");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    // tenant-1: 1.500.000 + 1.500.000 over 2 periods; tenant-2: 900.000 remainder over 1 period
    expect(json.data).toEqual([
      { penyewaId: "tenant-1", nama: "Budi Santoso", outstanding: 3000000, unpaidPeriods: 2 },
      { penyewaId: "tenant-2", nama: "Siti Aminah", outstanding: 900000, unpaidPeriods: 1 },
    ]);
  });

  it("GET /receivables/summary totals match the derived list", async () => {
    const res = await apiFetch("/receivables/summary");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      success: true,
      data: { totalOutstanding: 3900000, unpaidPeriodCount: 3, propertyTotal: 3900000 },
    });
  });

  it("GET /receivables/aging returns all 5 buckets with counts summing to unpaid periods", async () => {
    const res = await apiFetch("/receivables/aging");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.buckets.map((b: { label: string }) => b.label)).toEqual([
      "current",
      "1-30",
      "31-60",
      "61-90",
      "90+",
    ]);
    const totalCount = json.data.buckets.reduce(
      (n: number, b: { count: number }) => n + b.count,
      0,
    );
    const totalOutstanding = json.data.buckets.reduce(
      (n: number, b: { outstanding: number }) => n + b.outstanding,
      0,
    );
    expect(totalCount).toBe(3);
    expect(totalOutstanding).toBe(3900000);
  });

  it("numbers are derived, never seeded — paying a bill moves receivables + summary + aging", async () => {
    const bill = pembayaranList.find((p) => p.id === "pembayaran-1");
    if (!bill) throw new Error("fixture pembayaran-1 missing");
    bill.totalDibayar = bill.nominal;
    bill.status = "LUNAS";

    const list = await (await apiFetch("/receivables")).json();
    expect(list.data).toEqual([
      { penyewaId: "tenant-1", nama: "Budi Santoso", outstanding: 1500000, unpaidPeriods: 1 },
      { penyewaId: "tenant-2", nama: "Siti Aminah", outstanding: 900000, unpaidPeriods: 1 },
    ]);

    const summary = await (await apiFetch("/receivables/summary")).json();
    expect(summary.data.totalOutstanding).toBe(2400000);
    expect(summary.data.unpaidPeriodCount).toBe(2);

    const aging = await (await apiFetch("/receivables/aging")).json();
    const total = aging.data.buckets.reduce(
      (n: number, b: { outstanding: number }) => n + b.outstanding,
      0,
    );
    expect(total).toBe(2400000);
  });

  it("every monetary value is a JSON number, never a Decimal string", async () => {
    const list = await (await apiFetch("/receivables")).json();
    for (const row of list.data) expect(typeof row.outstanding).toBe("number");
    const summary = await (await apiFetch("/receivables/summary")).json();
    expect(typeof summary.data.totalOutstanding).toBe("number");
    expect(typeof summary.data.propertyTotal).toBe("number");
    const aging = await (await apiFetch("/receivables/aging")).json();
    for (const b of aging.data.buckets) {
      expect(typeof b.outstanding).toBe("number");
      expect(typeof b.count).toBe("number");
    }
  });

  it("future asOf is rejected with 400 on all three endpoints", async () => {
    const future = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    for (const path of ["/receivables", "/receivables/summary", "/receivables/aging"]) {
      const res = await apiFetch(`${path}?asOf=${encodeURIComponent(future)}`);
      expect(res.status).toBe(400);
    }
  });

  it("invalid asOf is rejected with 400", async () => {
    const res = await apiFetch("/receivables?asOf=bukan-tanggal");
    expect(res.status).toBe(400);
  });
});
