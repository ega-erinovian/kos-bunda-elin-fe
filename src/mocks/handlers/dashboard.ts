import { http, HttpResponse } from "msw";
import { startOfDay } from "date-fns";
import { pembayaranList } from "../fixtures/pembayaran";
import { getEffectiveRange, computeRevenue, computeExpense } from "./report";

// ponytail: dashboard-local notification seed. Phase 2 replaces this with shared fixtures/notifications.ts
// when notification fixtures exist. Keep this until then so Phase 8 ships independently.
function getNotificationSeed(reference: Date) {
  return [
    { id: "notif-today-sent", status: "SENT" as const, createdAt: reference.toISOString() },
    {
      id: "notif-today-failed",
      status: "FAILED" as const,
      createdAt: reference.toISOString(),
    },
    {
      id: "notif-yesterday-sent",
      status: "SENT" as const,
      createdAt: new Date(reference.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "notif-old-failed",
      status: "FAILED" as const,
      createdAt: new Date(reference.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

function computeKamarSummary() {
  // ponytail: no kamar fixture yet — deterministic values matching the existing static cards.
  // Replace with real count once fixtures/kamar.ts exists.
  const total = 20;
  const terisi = 14;
  const kosong = 6;
  const occupancyRate = total > 0 ? terisi / total : 0;
  return { total, terisi, kosong, occupancyRate };
}

function computePembayaranSummary() {
  const total = pembayaranList.length;
  let lunas = 0;
  let belumBayar = 0;
  let sebagian = 0;
  let terlambat = 0;
  let outstanding = 0;

  for (const p of pembayaranList) {
    if (p.status === "LUNAS") lunas += 1;
    else if (p.status === "BELUM_BAYAR") belumBayar += 1;
    else if (p.status === "SEBAGIAN") sebagian += 1;
    else if (p.status === "TERLAMBAT") terlambat += 1;

    if (p.status !== "LUNAS") {
      const out = p.nominal - p.totalDibayar;
      if (out > 0) outstanding += out;
    }
  }

  return { total, lunas, belumBayar, sebagian, terlambat, outstanding };
}

export const dashboardHandlers = [
  http.get("*/dashboard/summary", ({ request }) => {
    const url = new URL(request.url);
    const eff = getEffectiveRange(url);
    if ("error" in eff) return HttpResponse.json({ message: eff.error }, { status: eff.status });
    const { from, to } = eff;

    const kamar = computeKamarSummary();
    const pembayaran = computePembayaranSummary();

    // finance.totalReceivables mirrors receivables summary totalOutstanding (derived, not seeded)
    const totalReceivables = pembayaran.outstanding;

    // finance.netOperatingIncomeThisMonth mirrors income-statement netOperatingIncome for the same [from,to]
    const revenue = computeRevenue(from, to);
    const expenses = computeExpense(from, to);
    const totalIncome = revenue.cashRevenue + revenue.otherIncome;
    const netOperatingIncomeThisMonth = totalIncome - expenses.totalExpenses;

    // notifications
    // Seed is anchored to real wall-clock today, not to the queried range's `to`,
    // so future ranges correctly yield 0. Subtract 1s to ensure the seed's
    // "today" timestamp is <= `to` when `to` defaults to now (avoids ms race).
    const referenceNow = new Date(Date.now() - 1000);
    const seed = getNotificationSeed(referenceNow);
    const todayStart = startOfDay(referenceNow);
    const remindersSentToday = seed.filter((n) => new Date(n.createdAt) >= todayStart).length;
    const failedMessagesCount = seed.filter(
      (n) => n.status === "FAILED" && new Date(n.createdAt) >= from && new Date(n.createdAt) <= to,
    ).length;

    return HttpResponse.json(
      {
        success: true,
        data: {
          kamar,
          pembayaran,
          finance: {
            totalReceivables,
            netOperatingIncomeThisMonth,
          },
          notifications: {
            remindersSentToday,
            failedMessagesCount,
          },
        },
      },
      { status: 200 },
    );
  }),
];
