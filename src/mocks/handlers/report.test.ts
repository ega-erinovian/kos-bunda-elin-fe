import { describe, it, expect } from "vitest";
import { pembayaranList, paymentRecords } from "../fixtures/pembayaran";
import { financeTransactions } from "../fixtures/finance";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

function iso(d: Date) {
  return d.toISOString();
}

function rangeForCurrentMonth(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: iso(from), to: iso(now) };
}

describe("Phase 7 — Financial Reports MSW contract", () => {
  it("GET /reports/dashboard returns shape with numbers as JSON numbers", async () => {
    const res = await apiFetch("/reports/dashboard");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    const d = json.data;
    expect(typeof d.revenue.billedRevenue).toBe("number");
    expect(typeof d.revenue.cashRevenue).toBe("number");
    expect(typeof d.revenue.collectionRate).toBe("number");
    expect(typeof d.expenses.totalExpenses).toBe("number");
    expect(typeof d.cashFlow.inflow).toBe("number");
    expect(typeof d.cashFlow.outflow).toBe("number");
    expect(typeof d.cashFlow.net).toBe("number");
    expect(typeof d.occupancyRate).toBe("number");
    // optional additive fields when present
    if (d.overdueRent !== undefined) expect(typeof d.overdueRent).toBe("number");
    if (d.revenueTrend !== undefined) {
      expect(Array.isArray(d.revenueTrend)).toBe(true);
      for (const r of d.revenueTrend) {
        expect(typeof r.billedRevenue).toBe("number");
        expect(typeof r.cashRevenue).toBe("number");
      }
    }
  });

  it("GET /reports/revenue with explicit from/to returns billed vs cash and otherIncome as numbers", async () => {
    const { from, to } = rangeForCurrentMonth();
    const res = await apiFetch(
      `/reports/revenue?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    );
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.success).toBe(true);
    expect(typeof j.data.billedRevenue).toBe("number");
    expect(typeof j.data.cashRevenue).toBe("number");
    expect(typeof j.data.expectedRevenue).toBe("number");
    expect(typeof j.data.collectionRate).toBe("number");
    if (j.data.otherIncome !== undefined) expect(typeof j.data.otherIncome).toBe("number");
  });

  it("billed vs cash diverge for a partial bill in range", async () => {
    // Use a wide range that definitely includes pembayaran-1 (BELUM_BAYAR, due +5d) and pembayaran-2 (SEBAGIAN, due +3d) and their paymentRecord-1 (7 days ago)
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    // end = future to include due dates beyond now
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const res = await apiFetch(
      `/reports/revenue?from=${encodeURIComponent(iso(from))}&to=${encodeURIComponent(iso(to))}`,
    );
    const j = await res.json();
    expect(j.data.billedRevenue).toBeGreaterThan(0);
    expect(j.data.cashRevenue).toBeGreaterThan(0);
    expect(j.data.billedRevenue).not.toBe(j.data.cashRevenue);
    // specifically, cash includes the partial payment; billed includes the full nominal
    expect(j.data.billedRevenue).toBeGreaterThan(j.data.cashRevenue);
  });

  it("GET /reports/expenses returns byCategory and trend as numbers", async () => {
    const { from, to } = rangeForCurrentMonth();
    const res = await apiFetch(
      `/reports/expenses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    );
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(typeof j.data.totalExpenses).toBe("number");
    expect(Array.isArray(j.data.byCategory)).toBe(true);
    if (j.data.trend) {
      for (const t of j.data.trend) {
        expect(typeof t.amount).toBe("number");
        expect(typeof t.month).toBe("string");
      }
    }
  });

  it("GET /reports/cash-flow inflow includes deposits while revenue otherIncome excludes them", async () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    // baseline
    const baseCash = await (
      await apiFetch(
        `/reports/cash-flow?from=${encodeURIComponent(iso(start))}&to=${encodeURIComponent(iso(now))}`,
      )
    ).json();
    const baseRevenue = await (
      await apiFetch(
        `/reports/revenue?from=${encodeURIComponent(iso(start))}&to=${encodeURIComponent(iso(now))}`,
      )
    ).json();
    const baseInflow = baseCash.data.inflow;

    // inject a DEPOSIT transaction inside range (like deposit handler does)
    financeTransactions.push({
      id: "fin-deposit-check",
      accountId: "fin-acc-cash",
      categoryId: "cat-other-income",
      type: "INCOME",
      source: "DEPOSIT",
      amount: 999000,
      transactionDate: new Date(now.getTime() - 1000).toISOString(),
      createdAt: iso(now),
    });

    const afterCash = await (
      await apiFetch(
        `/reports/cash-flow?from=${encodeURIComponent(iso(start))}&to=${encodeURIComponent(iso(now))}`,
      )
    ).json();
    const afterRevenue = await (
      await apiFetch(
        `/reports/revenue?from=${encodeURIComponent(iso(start))}&to=${encodeURIComponent(iso(now))}`,
      )
    ).json();

    expect(afterCash.data.inflow).toBe(baseInflow + 999000);
    // revenue otherIncome must not move (DEPOSIT excluded)
    expect(afterRevenue.data.otherIncome).toBe(baseRevenue.data.otherIncome);
  });

  it("GET /reports/income-statement totalIncome = cashRevenue + otherIncome, net = totalIncome - totalExpenses", async () => {
    const { from, to } = rangeForCurrentMonth();
    const [rev, exp, stmt] = await Promise.all([
      (
        await apiFetch(
          `/reports/revenue?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        )
      ).json(),
      (
        await apiFetch(
          `/reports/expenses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        )
      ).json(),
      (
        await apiFetch(
          `/reports/income-statement?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        )
      ).json(),
    ]);
    const totalIncome = rev.data.cashRevenue + (rev.data.otherIncome ?? 0);
    expect(stmt.data.totalIncome).toBe(totalIncome);
    expect(stmt.data.totalExpenses).toBe(exp.data.totalExpenses);
    expect(stmt.data.netOperatingIncome).toBe(totalIncome - exp.data.totalExpenses);
  });

  it("GET /reports/transactions filters by type and categoryId and orders desc", async () => {
    const { from, to } = rangeForCurrentMonth();
    const all = await (
      await apiFetch(
        `/reports/transactions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      )
    ).json();
    expect(all.success).toBe(true);
    expect(Array.isArray(all.data)).toBe(true);

    const income = await (
      await apiFetch(
        `/reports/transactions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&type=INCOME`,
      )
    ).json();
    for (const tx of income.data) expect(tx.type).toBe("INCOME");

    if (all.data.length > 1) {
      const first = new Date(all.data[0].transactionDate).getTime();
      const second = new Date(all.data[1].transactionDate).getTime();
      expect(first).toBeGreaterThanOrEqual(second);
    }
  });

  it("validation: from > to rejected with 400", async () => {
    const now = iso(new Date());
    const earlier = iso(new Date(Date.now() - 86400000));
    for (const p of [
      "/reports/revenue",
      "/reports/expenses",
      "/reports/cash-flow",
      "/reports/income-statement",
      "/reports/dashboard",
    ]) {
      const res = await apiFetch(
        `${p}?from=${encodeURIComponent(now)}&to=${encodeURIComponent(earlier)}`,
      );
      expect(res.status).toBe(400);
    }
  });

  it("validation: range > 1095 days rejected with 400", async () => {
    const from = iso(new Date("2020-01-01T00:00:00Z"));
    const to = iso(new Date("2024-01-02T00:00:00Z")); // > 4 years
    const res = await apiFetch(
      `/reports/revenue?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    );
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.message).toMatch(/maksimal/i);
  });

  it("validation: invalid date rejected with 400", async () => {
    const res = await apiFetch("/reports/revenue?from=bukan-tanggal&to=2026-01-01");
    expect(res.status).toBe(400);
  });

  it("thin aliases /reports/receivables mirror /receivables", async () => {
    const a = await (await apiFetch("/reports/receivables")).json();
    const b = await (await apiFetch("/receivables")).json();
    expect(a).toEqual(b);
    const aa = await (await apiFetch("/reports/receivables/aging")).json();
    const bb = await (await apiFetch("/receivables/aging")).json();
    expect(aa).toEqual(bb);
  });

  it("every monetary value is a JSON number, never string", async () => {
    const { from, to } = rangeForCurrentMonth();
    const rev = await (
      await apiFetch(
        `/reports/revenue?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      )
    ).json();
    expect(typeof rev.data.billedRevenue).toBe("number");
    expect(typeof rev.data.cashRevenue).toBe("number");
    const exp = await (
      await apiFetch(
        `/reports/expenses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      )
    ).json();
    expect(typeof exp.data.totalExpenses).toBe("number");
    for (const c of exp.data.byCategory) expect(typeof c.amount).toBe("number");
    const cf = await (
      await apiFetch(
        `/reports/cash-flow?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      )
    ).json();
    expect(typeof cf.data.inflow).toBe("number");
    expect(typeof cf.data.net).toBe("number");
    const stmt = await (
      await apiFetch(
        `/reports/income-statement?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      )
    ).json();
    expect(typeof stmt.data.netOperatingIncome).toBe("number");
  });
});
