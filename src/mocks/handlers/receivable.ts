import { http, HttpResponse } from "msw";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import { pembayaranList } from "../fixtures/pembayaran";
import type { AgingBucket, AgingLabel, ReceivableByTenant } from "@/types";

// Mirrors BE receivable.service.ts + aging.util.ts exactly: computed on read from the
// Phase 1 bill fixture store, never separately seeded.

const AGING_LABELS: AgingLabel[] = ["current", "1-30", "31-60", "61-90", "90+"];

function outstandingOf(row: { nominal: number; totalDibayar: number }): number {
  const diff = row.nominal - row.totalDibayar;
  return diff > 0 ? diff : 0;
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

function buildList(): ReceivableByTenant[] {
  const grouped = new Map<string, ReceivableByTenant>();
  for (const row of unpaidRows()) {
    const out = outstandingOf(row);
    const existing = grouped.get(row.penyewaId);
    if (existing) {
      existing.outstanding += out;
      existing.unpaidPeriods += 1;
    } else {
      grouped.set(row.penyewaId, {
        penyewaId: row.penyewaId,
        nama: row.penyewaNama,
        outstanding: out,
        unpaidPeriods: 1,
      });
    }
  }
  return [...grouped.values()].sort((a, b) => b.outstanding - a.outstanding);
}

function buildAging(asOf: Date): AgingBucket[] {
  const map: Record<AgingLabel, AgingBucket> = {
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
    const bucket = map[bucketLabel(days)];
    bucket.outstanding += outstandingOf(row);
    bucket.count += 1;
  }
  return AGING_LABELS.map((l) => map[l]);
}

export const receivableHandlers = [
  // GET /api/receivables/summary — registered before "/" like the BE route file
  http.get("*/receivables/summary", ({ request }) => {
    const parsed = resolveAsOf(request);
    if ("error" in parsed) return HttpResponse.json({ message: parsed.error }, { status: 400 });

    let totalOutstanding = 0;
    let unpaidPeriodCount = 0;
    for (const row of unpaidRows()) {
      totalOutstanding += outstandingOf(row);
      unpaidPeriodCount += 1;
    }
    return HttpResponse.json(
      {
        success: true,
        data: {
          totalOutstanding,
          unpaidPeriodCount,
          propertyTotal: totalOutstanding,
        },
      },
      { status: 200 },
    );
  }),

  // GET /api/receivables/aging
  http.get("*/receivables/aging", ({ request }) => {
    const parsed = resolveAsOf(request);
    if ("error" in parsed) return HttpResponse.json({ message: parsed.error }, { status: 400 });

    return HttpResponse.json(
      { success: true, data: { buckets: buildAging(parsed.asOf) } },
      { status: 200 },
    );
  }),

  // GET /api/receivables
  http.get("*/receivables", ({ request }) => {
    const parsed = resolveAsOf(request);
    if ("error" in parsed) return HttpResponse.json({ message: parsed.error }, { status: 400 });

    return HttpResponse.json({ success: true, data: buildList() }, { status: 200 });
  }),
];
