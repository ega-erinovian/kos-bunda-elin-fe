import { describe, it, expect } from "vitest";
import { pembayaranList } from "../fixtures/pembayaran";

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

describe("Phase 8 — Dashboard Expansion MSW contract", () => {
  it("GET /dashboard/summary returns shape with numbers as JSON numbers", async () => {
    const res = await apiFetch("/dashboard/summary");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    const d = json.data;
    expect(typeof d.kamar.total).toBe("number");
    expect(typeof d.kamar.terisi).toBe("number");
    expect(typeof d.kamar.kosong).toBe("number");
    expect(typeof d.kamar.occupancyRate).toBe("number");
    expect(typeof d.pembayaran.total).toBe("number");
    expect(typeof d.pembayaran.lunas).toBe("number");
    expect(typeof d.pembayaran.outstanding).toBe("number");
    expect(typeof d.finance.totalReceivables).toBe("number");
    expect(typeof d.finance.netOperatingIncomeThisMonth).toBe("number");
    expect(typeof d.notifications.remindersSentToday).toBe("number");
    expect(typeof d.notifications.failedMessagesCount).toBe("number");
  });

  it("finance.totalReceivables cross-checks against GET /receivables/summary", async () => {
    const dash = await (await apiFetch("/dashboard/summary")).json();
    const summary = await (await apiFetch("/receivables/summary")).json();
    expect(dash.data.finance.totalReceivables).toBe(summary.data.totalOutstanding);
    expect(dash.data.finance.totalReceivables).toBe(dash.data.pembayaran.outstanding);
  });

  it("finance.netOperatingIncomeThisMonth cross-checks income-statement for same range", async () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = now;
    const url = `/dashboard/summary?from=${encodeURIComponent(iso(from))}&to=${encodeURIComponent(iso(to))}`;
    const dash = await (await apiFetch(url)).json();
    const stmt = await (
      await apiFetch(
        `/reports/income-statement?from=${encodeURIComponent(iso(from))}&to=${encodeURIComponent(iso(to))}`,
      )
    ).json();
    expect(dash.data.finance.netOperatingIncomeThisMonth).toBe(stmt.data.netOperatingIncome);
  });

  it("notifications counts are live and range-aware", async () => {
    // default current month: failed today (1) counted, old failed (40d ago) not in current month
    const defaultDash = await (await apiFetch("/dashboard/summary")).json();
    expect(defaultDash.data.notifications.remindersSentToday).toBeGreaterThanOrEqual(2);
    expect(defaultDash.data.notifications.failedMessagesCount).toBe(1);

    // wide range that includes old failed (40d ago) -> failed count becomes 2
    const fromWide = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const toWide = new Date();
    const wide = await (
      await apiFetch(
        `/dashboard/summary?from=${encodeURIComponent(iso(fromWide))}&to=${encodeURIComponent(iso(toWide))}`,
      )
    ).json();
    expect(wide.data.notifications.failedMessagesCount).toBe(2);

    // narrow range: tomorrow range should have 0 failed
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const future = await (
      await apiFetch(
        `/dashboard/summary?from=${encodeURIComponent(iso(tomorrow))}&to=${encodeURIComponent(iso(dayAfter))}`,
      )
    ).json();
    expect(future.data.notifications.failedMessagesCount).toBe(0);
    // remindersSentToday is independent of from/to — always today
    expect(future.data.notifications.remindersSentToday).toBe(
      defaultDash.data.notifications.remindersSentToday,
    );
  });

  it("existing kamar/pembayaran keys are still present and unchanged", async () => {
    const res = await apiFetch("/dashboard/summary");
    const json = await res.json();
    expect(json.data.kamar).toBeDefined();
    expect(json.data.pembayaran).toBeDefined();
    expect(json.data.kamar.total).toBe(20);
  });

  it("dashboard totals move when a bill is paid (derived, not seeded)", async () => {
    const bill = pembayaranList.find((p) => p.id === "pembayaran-4");
    if (!bill) throw new Error("pembayaran-4 missing");
    const before = await (await apiFetch("/dashboard/summary")).json();
    const beforeTotal = before.data.finance.totalReceivables;

    bill.totalDibayar = bill.nominal;
    bill.status = "LUNAS";

    const after = await (await apiFetch("/dashboard/summary")).json();
    expect(after.data.finance.totalReceivables).toBe(beforeTotal - bill.nominal);
    expect(after.data.pembayaran.outstanding).toBe(beforeTotal - bill.nominal);
  });

  it("validation: from > to rejected with 400", async () => {
    const now = iso(new Date());
    const earlier = iso(new Date(Date.now() - 86400000));
    const res = await apiFetch(
      `/dashboard/summary?from=${encodeURIComponent(now)}&to=${encodeURIComponent(earlier)}`,
    );
    expect(res.status).toBe(400);
  });

  it("validation: range > 1095 days rejected with 400", async () => {
    const from = iso(new Date("2020-01-01T00:00:00Z"));
    const to = iso(new Date("2024-01-02T00:00:00Z"));
    const res = await apiFetch(
      `/dashboard/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    );
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.message).toMatch(/maksimal/i);
  });

  it("validation: invalid date rejected with 400", async () => {
    const res = await apiFetch("/dashboard/summary?from=bukan-tanggal&to=2026-01-01");
    expect(res.status).toBe(400);
  });

  it("every monetary value is a JSON number, never string", async () => {
    const json = await (await apiFetch("/dashboard/summary")).json();
    expect(typeof json.data.finance.totalReceivables).toBe("number");
    expect(typeof json.data.finance.netOperatingIncomeThisMonth).toBe("number");
    expect(typeof json.data.pembayaran.outstanding).toBe("number");
    expect(typeof json.data.kamar.occupancyRate).toBe("number");
  });
});
