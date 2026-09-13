/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse } from "msw";
import { pembayaranList, paymentRecords, type Pembayaran } from "../fixtures/pembayaran";
import {
  financeAccounts,
  createLinkedTransactionForPayment,
  resolveDefaultAccountId,
} from "../fixtures/finance";
import type { PaymentRecord, CreatePaymentRecordInput, AddPaymentResponse } from "@/types";

// Store for idempotency keys: key -> response
const idempotencyStore = new Map<string, AddPaymentResponse>();

// Helper to compute status based on the backend plan's four-branch rule
function computeStatus(
  totalDibayar: number,
  nominal: number,
  tanggalJatuhTempo: string,
): Pembayaran["status"] {
  const isOverdue = new Date(tanggalJatuhTempo) < new Date();

  if (totalDibayar <= 0 && isOverdue) {
    return "TERLAMBAT";
  }
  if (totalDibayar <= 0) {
    return "BELUM_BAYAR";
  }
  if (totalDibayar >= nominal) {
    return "LUNAS";
  }
  return "SEBAGIAN";
}

function mapPembayaranToApi(p: Pembayaran) {
  return {
    id: p.id,
    penyewaId: p.penyewaId,
    penyewa: {
      id: p.penyewaId,
      nama: p.penyewaNama,
      noHp: "081234567890",
      kamar: {
        id: p.kamarId,
        nomor: p.nomorKamar,
        lantai: null as string | null,
      },
    },
    periodeBulan: p.bulan,
    periodeTahun: p.tahun,
    tanggalJatuhTempo: new Date(p.tanggalJatuhTempo).toISOString(),
    status: p.status,
    tanggalBayar: p.tanggalBayar ? new Date(p.tanggalBayar).toISOString() : null,
    nominal: p.nominal,
    totalDibayar: p.totalDibayar,
    catatan: p.catatan ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export const pembayaranHandlers = [
  // POST /api/pembayaran/:id/payments — also creates linked FinancialTransaction (mirrors BE finance-integration.service.ts)
  http.post("*/pembayaran/:id/payments", async ({ request, params }) => {
    const { id } = params;
    const idempotencyKey = request.headers.get("Idempotency-Key");

    if (!idempotencyKey) {
      return HttpResponse.json({ error: "Idempotency-Key header is required" }, { status: 400 });
    }

    // Check idempotency - return cached response if key exists
    if (idempotencyStore.has(idempotencyKey)) {
      return HttpResponse.json(
        { success: true, data: idempotencyStore.get(idempotencyKey) },
        {
          status: 200,
        },
      );
    }

    const pembayaran = pembayaranList.find((p) => p.id === id);
    if (!pembayaran) {
      return HttpResponse.json({ error: "Pembayaran not found" }, { status: 404 });
    }

    let body: CreatePaymentRecordInput;
    try {
      body = (await request.json()) as CreatePaymentRecordInput;
    } catch {
      return HttpResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validation
    if (!body.paymentMethod) {
      return HttpResponse.json({ error: "paymentMethod is required" }, { status: 400 });
    }
    if (!body.paymentDate) {
      return HttpResponse.json({ error: "paymentDate is required" }, { status: 400 });
    }
    if (!body.amountPaid || body.amountPaid <= 0) {
      return HttpResponse.json({ error: "amountPaid must be greater than 0" }, { status: 400 });
    }

    // Validate paymentDate not > now + 1 day
    const paymentDate = new Date(body.paymentDate);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 1);
    if (paymentDate > maxDate) {
      return HttpResponse.json(
        { error: "paymentDate cannot be more than 1 day in the future" },
        { status: 400 },
      );
    }

    // Validate referenceNumber max 100 chars
    if (body.referenceNumber && body.referenceNumber.length > 100) {
      return HttpResponse.json(
        { error: "referenceNumber cannot exceed 100 characters" },
        { status: 400 },
      );
    }

    // Validate notes max 500 chars
    if (body.notes && body.notes.length > 500) {
      return HttpResponse.json({ error: "notes cannot exceed 500 characters" }, { status: 400 });
    }

    // Validate financialAccountId existence if provided (BE checks existence when given)
    if (body.financialAccountId) {
      const accExists = financeAccounts.some((a) => a.id === body.financialAccountId);
      if (!accExists) {
        return HttpResponse.json({ message: "FinancialAccount tidak ditemukan" }, { status: 404 });
      }
    }

    // Resolve account for linked transaction (mirrors BE fallback)
    const resolvedAccountId = body.financialAccountId || resolveDefaultAccountId(undefined);

    // Create payment record
    const newPaymentRecord: PaymentRecord = {
      id: `payment-record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pembayaranId: pembayaran.id,
      paymentMethod: body.paymentMethod,
      paymentDate: body.paymentDate,
      amountPaid: body.amountPaid,
      referenceNumber: body.referenceNumber,
      notes: body.notes,
      financialAccountId: resolvedAccountId,
      createdByAdmin: {
        id: "admin-1",
        nama: "Admin User",
      },
      createdAt: new Date().toISOString(),
    };

    // Add to global payment records
    paymentRecords.push(newPaymentRecord);

    // Update pembayaran
    const newTotalDibayar = pembayaran.totalDibayar + body.amountPaid;
    pembayaran.totalDibayar = newTotalDibayar;
    pembayaran.status = computeStatus(
      newTotalDibayar,
      pembayaran.nominal,
      pembayaran.tanggalJatuhTempo,
    );

    // Set tanggalBayar if this is the first payment or status becomes LUNAS
    if (
      !pembayaran.tanggalBayar ||
      pembayaran.status === "LUNAS" ||
      pembayaran.status === "SEBAGIAN"
    ) {
      pembayaran.tanggalBayar = body.paymentDate;
    }

    pembayaran.updatedAt = new Date().toISOString();

    // Add to pembayaran's payment records
    if (!pembayaran.paymentRecords) {
      pembayaran.paymentRecords = [];
    }
    pembayaran.paymentRecords.push(newPaymentRecord);

    // Create linked FinancialTransaction (BE does this inside same DB transaction)
    const linkedTrx = createLinkedTransactionForPayment({
      paymentRecordId: newPaymentRecord.id,
      pembayaranId: pembayaran.id,
      penyewaId: (pembayaran as any).penyewaId,
      accountId: resolvedAccountId,
      amount: body.amountPaid,
      paymentDate: body.paymentDate,
      referenceNumber: body.referenceNumber,
      periodeBulan: (pembayaran as any).bulan,
      periodeTahun: (pembayaran as any).tahun,
    });
    newPaymentRecord.financialTransactionId = linkedTrx.id;

    // Check for overpayment warning
    let warning: "overpaid" | undefined;
    if (newTotalDibayar > pembayaran.nominal) {
      warning = "overpaid";
    }

    const response: AddPaymentResponse = {
      paymentRecord: newPaymentRecord,
      pembayaran: {
        id: pembayaran.id,
        status: pembayaran.status,
        totalDibayar: pembayaran.totalDibayar,
        tanggalBayar: pembayaran.tanggalBayar,
      },
      warning,
    };

    // Store in idempotency cache (store inner data, wrap on return)
    idempotencyStore.set(idempotencyKey, response);

    return HttpResponse.json({ success: true, data: response }, { status: 201 });
  }),

  // GET /api/pembayaran/:id/payments
  http.get("*/pembayaran/:id/payments", ({ params }) => {
    const { id } = params;

    const pembayaran = pembayaranList.find((p) => p.id === id);
    if (!pembayaran) {
      return HttpResponse.json({ error: "Pembayaran not found" }, { status: 404 });
    }

    const records = paymentRecords
      .filter((r) => r.pembayaranId === id)
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());

    // BE wraps as {success:true, data:{data: records}} via apiSuccess with {data: records}
    return HttpResponse.json({ success: true, data: { data: records } }, { status: 200 });
  }),

  // GET /api/pembayaran/:id — detail with paymentRecords embedded (BE: mapPembayaranDetail)
  http.get("*/pembayaran/:id", ({ params }) => {
    const { id } = params as { id: string };
    // Avoid colliding with /pembayaran/:id/payments — this handler runs only for single segment; MSW ordering ensures more specific :id/payments above matches first
    if (id === "undefined" || id === "null") {
      return HttpResponse.json({ message: "Pembayaran tidak ditemukan" }, { status: 404 });
    }
    const pembayaran = pembayaranList.find((p) => p.id === id);
    if (!pembayaran) {
      return HttpResponse.json({ message: "Pembayaran tidak ditemukan" }, { status: 404 });
    }
    const detail = mapPembayaranToApi(pembayaran);
    // embed paymentRecords for detail view only
    (detail as any).paymentRecords = (pembayaran.paymentRecords ?? []).map((r) => ({
      ...r,
      financialTransactionId: (r as any).financialTransactionId,
    }));
    return HttpResponse.json({ success: true, data: detail }, { status: 200 });
  }),

  // GET /api/pembayaran - with status/period/pagination support (BE: apiPagination envelope)
  http.get("*/pembayaran", ({ request }) => {
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");
    const penyewaId = url.searchParams.get("penyewaId");
    const periodeBulan = url.searchParams.get("periodeBulan");
    const periodeTahun = url.searchParams.get("periodeTahun");
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(
        1,
        Number(url.searchParams.get("limit") || url.searchParams.get("pageSize") || "20"),
      ),
    );

    let filtered = [...pembayaranList];

    if (penyewaId) filtered = filtered.filter((p) => p.penyewaId === penyewaId);
    if (periodeBulan) filtered = filtered.filter((p) => p.bulan === Number(periodeBulan));
    if (periodeTahun) filtered = filtered.filter((p) => p.tahun === Number(periodeTahun));

    if (statusFilter) {
      const s = statusFilter.toLowerCase();
      if (s === "akan_jatuh_tempo") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const in3 = new Date(today);
        in3.setDate(today.getDate() + 3);
        filtered = filtered.filter((p) => {
          const jatuh = new Date(p.tanggalJatuhTempo);
          jatuh.setHours(0, 0, 0, 0);
          return (
            jatuh >= today &&
            jatuh <= in3 &&
            (p.status === "BELUM_BAYAR" || p.status === "TERLAMBAT")
          );
        });
      } else if (s === "menunggak") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter((p) => {
          const jatuh = new Date(p.tanggalJatuhTempo);
          jatuh.setHours(0, 0, 0, 0);
          return jatuh < today && (p.status === "BELUM_BAYAR" || p.status === "TERLAMBAT");
        });
      } else {
        const statusMap: Record<string, Pembayaran["status"]> = {
          belum_bayar: "BELUM_BAYAR",
          sebagian: "SEBAGIAN",
          lunas: "LUNAS",
          terlambat: "TERLAMBAT",
        };
        const mappedStatus = statusMap[s];
        if (mappedStatus) {
          filtered = filtered.filter((p) => p.status === mappedStatus);
        }
      }
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const slice = filtered.slice(start, start + limit);
    const data = slice.map(mapPembayaranToApi);

    return HttpResponse.json(
      {
        success: true,
        data,
        meta: { page, limit, total, totalPages },
      },
      { status: 200 },
    );
  }),
];
