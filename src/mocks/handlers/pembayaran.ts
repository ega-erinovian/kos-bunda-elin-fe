import { http, HttpResponse } from "msw";
import { pembayaranList, paymentRecords, type Pembayaran } from "../fixtures/pembayaran";
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

export const pembayaranHandlers = [
  // POST /api/pembayaran/:id/payments
  http.post("/api/pembayaran/:id/payments", async ({ request, params }) => {
    const { id } = params;
    const idempotencyKey = request.headers.get("Idempotency-Key");

    if (!idempotencyKey) {
      return HttpResponse.json({ error: "Idempotency-Key header is required" }, { status: 400 });
    }

    // Check idempotency - return cached response if key exists
    if (idempotencyStore.has(idempotencyKey)) {
      return HttpResponse.json(idempotencyStore.get(idempotencyKey), {
        status: 200,
      });
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

    // Create payment record
    const newPaymentRecord: PaymentRecord = {
      id: `payment-record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pembayaranId: pembayaran.id,
      paymentMethod: body.paymentMethod,
      paymentDate: body.paymentDate,
      amountPaid: body.amountPaid,
      referenceNumber: body.referenceNumber,
      notes: body.notes,
      financialAccountId: body.financialAccountId,
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

    // Store in idempotency cache
    idempotencyStore.set(idempotencyKey, response);

    return HttpResponse.json(response, { status: 201 });
  }),

  // GET /api/pembayaran/:id/payments
  http.get("/api/pembayaran/:id/payments", ({ params }) => {
    const { id } = params;

    const pembayaran = pembayaranList.find((p) => p.id === id);
    if (!pembayaran) {
      return HttpResponse.json({ error: "Pembayaran not found" }, { status: 404 });
    }

    const records = paymentRecords
      .filter((r) => r.pembayaranId === id)
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());

    return HttpResponse.json({ data: records }, { status: 200 });
  }),

  // GET /api/pembayaran - with status filter support
  http.get("/api/pembayaran", ({ request }) => {
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");

    let filtered = pembayaranList;

    if (statusFilter) {
      const statusMap: Record<string, Pembayaran["status"]> = {
        belum_bayar: "BELUM_BAYAR",
        sebagian: "SEBAGIAN",
        lunas: "LUNAS",
        terlambat: "TERLAMBAT",
      };

      const mappedStatus = statusMap[statusFilter.toLowerCase()];
      if (mappedStatus) {
        filtered = pembayaranList.filter((p) => p.status === mappedStatus);
      }
    }

    return HttpResponse.json({ data: filtered }, { status: 200 });
  }),
];
