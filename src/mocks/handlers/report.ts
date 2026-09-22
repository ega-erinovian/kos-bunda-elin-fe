import { http, HttpResponse } from "msw";
import { differenceInCalendarDays, startOfDay, startOfMonth } from "date-fns";
import { pembayaranList, paymentRecords } from "../fixtures/pembayaran";
import { financeTransactions } from "../fixtures/finance";

const MAX_REPORT_RANGE_DAYS = 1095;

function parseDateParam(v: string | null): Date | undefined | null {
  if (v === null || v === undefined || v === "") return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function getEffectiveRange(url: URL): { from: Date; to: Date } | { error: string; status: number } {
  const rawFrom = url.searchParams.get("from");
  const rawTo = url.searchParams.get("to");
  const fromParsed = parseDateParam(rawFrom);
  const toParsed = parseDateParam(rawTo);

  if (fromParsed === null) return { error: "from tidak valid", status: 400 };
  if (toParsed === null) return { error: "to tidak valid", status: 400 };

  const now = new Date();
  let from = fromParsed ?? startOfMonth(now);
  let to = toParsed ?? now;

  if (isNaN(from.getTime())) from = startOfMonth(now);
  if (isNaN(to.getTime())) to = now;

  if (from > to) return { error: "from tidak boleh setelah to", status: 400 };

  const diffDays = differenceInCalendarDays(to, from);
  const ceilDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  const effective = Math.max(diffDays, ceilDiff);
  if (effective > MAX_REPORT_RANGE_DAYS) {
    return {
      error: `Rentang laporan maksimal ${MAX_REPORT_RANGE_DAYS} hari (3 tahun)`,
      status: 400,
    };
  }
  return { from, to };
}

function monthKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthsBetween(from: Date, to: Date): string[] {
  const y1 = from.getUTCFullYear();
  const m1 = from.getUTCMonth();
  const y2 = to.getUTCFullYear();
  const m2 = to.getUTCMonth();
  const out: string[] = [];
  let y = y1;
  let m = m1;
  let guard = 0;
  while ((y < y2 || (y === y2 && m <= m2)) && guard < 60) {
    out.push(`${y}-${String(m + 1).padStart(2, "0")}`);
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    guard += 1;
  }
  return out;
}

// ── core calculators ──────────────────────────────────────────────────

function computeRevenue(from: Date, to: Date) {
  const billedRevenue = pembayaranList
    .filter((p) => {
      const d = new Date(p.tanggalJatuhTempo);
      return d >= from && d <= to;
    })
    .reduce((s, p) => s + p.nominal, 0);

  const cashRevenue = paymentRecords
    .filter((pr) => {
      const d = new Date(pr.paymentDate);
      return d >= from && d <= to;
    })
    .reduce((s, pr) => s + pr.amountPaid, 0);

  const otherIncome = financeTransactions
    .filter(
      (t) =>
        !t.deletedAt &&
        t.type === "INCOME" &&
        !["RENT_PAYMENT", "DEPOSIT"].includes(t.source) &&
        new Date(t.transactionDate) >= from &&
        new Date(t.transactionDate) <= to,
    )
    .reduce((s, t) => s + t.amount, 0);

  const expectedRevenue = billedRevenue;
  const collectionRate = billedRevenue > 0 ? cashRevenue / billedRevenue : 0;

  return { billedRevenue, cashRevenue, expectedRevenue, collectionRate, otherIncome };
}

function computeExpense(from: Date, to: Date) {
  const rows = financeTransactions.filter(
    (t) =>
      !t.deletedAt &&
      t.type === "EXPENSE" &&
      t.source !== "DEPOSIT_REFUND" &&
      new Date(t.transactionDate) >= from &&
      new Date(t.transactionDate) <= to,
  );

  const totalExpenses = rows.reduce((s, r) => s + r.amount, 0);

  const byCat = new Map<string, number>();
  for (const r of rows) {
    byCat.set(r.categoryId, (byCat.get(r.categoryId) ?? 0) + r.amount);
  }
  const byCategory = [...byCat.entries()]
    .map(([categoryId, amount]) => ({ categoryId, amount }))
    .sort((a, b) => b.amount - a.amount);

  const monthBuckets = new Map<string, number>();
  for (const r of rows) {
    const k = monthKey(new Date(r.transactionDate));
    monthBuckets.set(k, (monthBuckets.get(k) ?? 0) + r.amount);
  }
  const months = monthsBetween(from, to);
  const trend = months.map((m) => ({ month: m, amount: monthBuckets.get(m) ?? 0 }));

  return { totalExpenses, byCategory, trend };
}

function computeCashFlow(from: Date, to: Date) {
  const inflow = financeTransactions
    .filter(
      (t) =>
        !t.deletedAt &&
        t.type === "INCOME" &&
        new Date(t.transactionDate) >= from &&
        new Date(t.transactionDate) <= to,
    )
    .reduce((s, t) => s + t.amount, 0);
  const outflow = financeTransactions
    .filter(
      (t) =>
        !t.deletedAt &&
        t.type === "EXPENSE" &&
        new Date(t.transactionDate) >= from &&
        new Date(t.transactionDate) <= to,
    )
    .reduce((s, t) => s + t.amount, 0);
  return { inflow, outflow, net: inflow - outflow };
}

function computeOverdueRent(to: Date): number {
  let total = 0;
  for (const p of pembayaranList) {
    if (p.status === "LUNAS") continue;
    const due = new Date(p.tanggalJatuhTempo);
    if (due >= to) continue;
    const out = p.nominal - p.totalDibayar;
    if (out > 0) total += out;
  }
  return total;
}

function computeRevenueTrend(
  from: Date,
  to: Date,
): { month: string; billedRevenue: number; cashRevenue: number }[] {
  const billedMap = new Map<string, number>();
  for (const p of pembayaranList) {
    const d = new Date(p.tanggalJatuhTempo);
    if (d < from || d > to) continue;
    const k = monthKey(d);
    billedMap.set(k, (billedMap.get(k) ?? 0) + p.nominal);
  }
  const cashMap = new Map<string, number>();
  for (const pr of paymentRecords) {
    const d = new Date(pr.paymentDate);
    if (d < from || d > to) continue;
    const k = monthKey(d);
    cashMap.set(k, (cashMap.get(k) ?? 0) + pr.amountPaid);
  }
  const months = monthsBetween(from, to);
  return months.map((m) => ({
    month: m,
    billedRevenue: billedMap.get(m) ?? 0,
    cashRevenue: cashMap.get(m) ?? 0,
  }));
}

function computeOccupancyRate(): number {
  // ponytail: no kamar fixture yet; use deterministic 0.72. Replace with real count once fixtures/kamar.ts exists.
  return 0.72;
}

// ── receivable alias helpers (mirror receivable.ts) ────────────────────
type AgingLabel = "current" | "1-30" | "31-60" | "61-90" | "90+";
const AGING_LABELS: AgingLabel[] = ["current", "1-30", "31-60", "61-90", "90+"];

function outstandingOf(row: { nominal: number; totalDibayar: number }): number {
  const d = row.nominal - row.totalDibayar;
  return d > 0 ? d : 0;
}
function bucketLabel(days: number): AgingLabel {
  if (days <= 0) return "current";
  if (days <= 30) return "1-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  return "90+";
}
function resolveAsOf(request: Request): { asOf: Date } | { error: string } {
  const raw = new URL(request.url).searchParams.get("asOf");
  if (!raw) return { asOf: new Date() };
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return { error: "asOf tidak valid" };
  if (startOfDay(d) > startOfDay(new Date())) return { error: "asOf tidak boleh di masa depan" };
  return { asOf: d };
}
function unpaidRows() {
  return pembayaranList.filter((r) => r.status !== "LUNAS" && outstandingOf(r) > 0);
}

// ── handlers ──────────────────────────────────────────────────────────

export const reportHandlers = [
  // thin aliases for receivables (must be before generic /reports handler if any)
  http.get("*/reports/receivables/aging", ({ request }) => {
    const parsed = resolveAsOf(request as unknown as Request);
    if ("error" in parsed) return HttpResponse.json({ message: parsed.error }, { status: 400 });
    const asOf = parsed.asOf;
    const map: Record<AgingLabel, { label: AgingLabel; outstanding: number; count: number }> = {
      current: { label: "current", outstanding: 0, count: 0 },
      "1-30": { label: "1-30", outstanding: 0, count: 0 },
      "31-60": { label: "31-60", outstanding: 0, count: 0 },
      "61-90": { label: "61-90", outstanding: 0, count: 0 },
      "90+": { label: "90+", outstanding: 0, count: 0 },
    };
    for (const row of unpaidRows()) {
      const days = differenceInCalendarDays(
        startOfDay(asOf),
        startOfDay(new Date(row.tanggalJatuhTempo)),
      );
      const b = map[bucketLabel(days)];
      b.outstanding += outstandingOf(row);
      b.count += 1;
    }
    return HttpResponse.json(
      { success: true, data: { buckets: AGING_LABELS.map((l) => map[l]) } },
      { status: 200 },
    );
  }),

  http.get("*/reports/receivables", ({ request }) => {
    const parsed = resolveAsOf(request as unknown as Request);
    if ("error" in parsed) return HttpResponse.json({ message: parsed.error }, { status: 400 });
    const grouped = new Map<
      string,
      { penyewaId: string; nama: string; outstanding: number; unpaidPeriods: number }
    >();
    for (const row of unpaidRows()) {
      const out = outstandingOf(row);
      const ex = grouped.get(row.penyewaId);
      if (ex) {
        ex.outstanding += out;
        ex.unpaidPeriods += 1;
      } else {
        grouped.set(row.penyewaId, {
          penyewaId: row.penyewaId,
          nama: row.penyewaNama,
          outstanding: out,
          unpaidPeriods: 1,
        });
      }
    }
    const data = [...grouped.values()].sort((a, b) => b.outstanding - a.outstanding);
    return HttpResponse.json({ success: true, data }, { status: 200 });
  }),

  http.get("*/reports/dashboard", ({ request }) => {
    const url = new URL(request.url);
    const eff = getEffectiveRange(url);
    if ("error" in eff) return HttpResponse.json({ message: eff.error }, { status: eff.status });
    const { from, to } = eff;
    const revenue = computeRevenue(from, to);
    const expenses = computeExpense(from, to);
    const cashFlow = computeCashFlow(from, to);
    const occupancyRate = computeOccupancyRate();
    const overdueRent = computeOverdueRent(to);
    const revenueTrend = computeRevenueTrend(from, to);
    return HttpResponse.json(
      {
        success: true,
        data: { revenue, expenses, cashFlow, occupancyRate, overdueRent, revenueTrend },
      },
      { status: 200 },
    );
  }),

  http.get("*/reports/revenue", ({ request }) => {
    const url = new URL(request.url);
    const eff = getEffectiveRange(url);
    if ("error" in eff) return HttpResponse.json({ message: eff.error }, { status: eff.status });
    const { from, to } = eff;
    return HttpResponse.json({ success: true, data: computeRevenue(from, to) }, { status: 200 });
  }),

  http.get("*/reports/expenses", ({ request }) => {
    const url = new URL(request.url);
    const eff = getEffectiveRange(url);
    if ("error" in eff) return HttpResponse.json({ message: eff.error }, { status: eff.status });
    const { from, to } = eff;
    return HttpResponse.json({ success: true, data: computeExpense(from, to) }, { status: 200 });
  }),

  http.get("*/reports/cash-flow", ({ request }) => {
    const url = new URL(request.url);
    const eff = getEffectiveRange(url);
    if ("error" in eff) return HttpResponse.json({ message: eff.error }, { status: eff.status });
    const { from, to } = eff;
    return HttpResponse.json({ success: true, data: computeCashFlow(from, to) }, { status: 200 });
  }),

  http.get("*/reports/income-statement", ({ request }) => {
    const url = new URL(request.url);
    const eff = getEffectiveRange(url);
    if ("error" in eff) return HttpResponse.json({ message: eff.error }, { status: eff.status });
    const { from, to } = eff;
    const revenue = computeRevenue(from, to);
    const expenses = computeExpense(from, to);
    const totalIncome = revenue.cashRevenue + revenue.otherIncome;
    const totalExpenses = expenses.totalExpenses;
    const netOperatingIncome = totalIncome - totalExpenses;
    return HttpResponse.json(
      { success: true, data: { totalIncome, totalExpenses, netOperatingIncome } },
      { status: 200 },
    );
  }),

  http.get("*/reports/transactions", ({ request }) => {
    const url = new URL(request.url);
    const eff = getEffectiveRange(url);
    if ("error" in eff) return HttpResponse.json({ message: eff.error }, { status: eff.status });
    const { from, to } = eff;

    const type = url.searchParams.get("type");
    const categoryId = url.searchParams.get("categoryId");

    if (type && !["INCOME", "EXPENSE"].includes(type)) {
      return HttpResponse.json({ message: "type harus INCOME atau EXPENSE" }, { status: 400 });
    }
    if (categoryId) {
      // uuid format loosely checked — BE validates uuid; mock checks non-empty
      if (categoryId.length < 8)
        return HttpResponse.json({ message: "categoryId tidak valid" }, { status: 400 });
    }

    let data = financeTransactions.filter((t) => !t.deletedAt);
    data = data.filter((t) => {
      const d = new Date(t.transactionDate);
      return d >= from && d <= to;
    });
    if (type) data = data.filter((t) => t.type === type);
    if (categoryId) data = data.filter((t) => t.categoryId === categoryId);

    data.sort(
      (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
    );

    return HttpResponse.json({ success: true, data }, { status: 200 });
  }),
];
