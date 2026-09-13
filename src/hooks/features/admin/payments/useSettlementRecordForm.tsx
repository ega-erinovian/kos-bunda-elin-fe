"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { useCreatePaymentRecord as useAddPayment } from "@/hooks/api/use-payments";
import { ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import type { PaymentMethod } from "@/types";

const settlementRecordSchema = z.object({
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "QRIS", "E_WALLET", "OTHER"], {
    message: "Metode pembayaran harus salah satu dari: CASH, BANK_TRANSFER, QRIS, E_WALLET, OTHER",
  }),
  paymentDate: z
    .string()
    .min(1, "Tanggal bayar wajib diisi")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Tanggal bayar tidak valid")
    .refine(
      (v) => {
        const date = new Date(v);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        return date <= tomorrow;
      },
      { message: "Tanggal bayar tidak boleh lebih dari 1 hari ke depan" },
    ),
  amountPaid: z
    .string()
    .trim()
    .min(1, "Nominal dibayar wajib diisi")
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Nominal harus angka valid (maks 2 desimal)")
    .refine((v) => Number(v) > 0, "Nominal harus lebih dari 0"),
  referenceNumber: z.string().max(100, "No. referensi maksimal 100 karakter").optional(),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
  financialAccountId: z
    .string()
    .optional()
    .refine((v) => !v || z.string().uuid().safeParse(v).success, {
      message: "financialAccountId harus UUID valid",
    }),
});

type FieldErrors = {
  paymentMethod?: string;
  paymentDate?: string;
  amountPaid?: string;
  referenceNumber?: string;
  notes?: string;
  financialAccountId?: string;
};

type UseSettlementRecordFormOptions = {
  pembayaranId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nominal: number;
  totalDibayar: number;
  onSuccess?: () => void;
};

export function useSettlementRecordForm({
  pembayaranId,
  open,
  onOpenChange,
  nominal,
  totalDibayar,
  onSuccess,
}: UseSettlementRecordFormOptions) {
  const { mutate, isPending } = useAddPayment();

  const remainingBalance = Math.max(0, nominal - totalDibayar);
  const todayStr = new Date().toISOString().split("T")[0];

  const [paymentMethod, setPaymentMethodRaw] = useState<PaymentMethod>("CASH");
  const [paymentDate, setPaymentDateRaw] = useState(todayStr);
  const [amountPaid, setAmountPaidRaw] = useState(String(remainingBalance || ""));
  const [referenceNumber, setReferenceNumberRaw] = useState("");
  const [notes, setNotesRaw] = useState("");
  const [financialAccountId, setFinancialAccountIdRaw] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevPembayaranId, setPrevPembayaranId] = useState(pembayaranId);

  if (prevOpen !== open || prevPembayaranId !== pembayaranId) {
    setPrevOpen(open);
    setPrevPembayaranId(pembayaranId);
    if (open) {
      const rem = Math.max(0, nominal - totalDibayar);
      setPaymentMethodRaw("CASH");
      setPaymentDateRaw(new Date().toISOString().split("T")[0]);
      setAmountPaidRaw(String(rem || ""));
      setReferenceNumberRaw("");
      setNotesRaw("");
      setFinancialAccountIdRaw("");
      setErrors({});
      setSubmitted(false);
    }
  }

  function validate(next: {
    paymentMethod: string;
    paymentDate: string;
    amountPaid: string;
    referenceNumber?: string;
    notes?: string;
    financialAccountId?: string;
  }): FieldErrors {
    const result = settlementRecordSchema.safeParse({
      paymentMethod: next.paymentMethod,
      paymentDate: next.paymentDate,
      amountPaid: next.amountPaid,
      referenceNumber: next.referenceNumber?.trim() || undefined,
      notes: next.notes?.trim() || undefined,
      financialAccountId: next.financialAccountId?.trim() || undefined,
    });
    if (result.success) return {};
    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FieldErrors;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return fieldErrors;
  }

  function update(
    next: Partial<{
      paymentMethod: PaymentMethod;
      paymentDate: string;
      amountPaid: string;
      referenceNumber: string;
      notes: string;
      financialAccountId: string;
    }>,
  ) {
    if (next.paymentMethod !== undefined) setPaymentMethodRaw(next.paymentMethod);
    if (next.paymentDate !== undefined) setPaymentDateRaw(next.paymentDate);
    if (next.amountPaid !== undefined) setAmountPaidRaw(next.amountPaid);
    if (next.referenceNumber !== undefined) setReferenceNumberRaw(next.referenceNumber);
    if (next.notes !== undefined) setNotesRaw(next.notes);
    if (next.financialAccountId !== undefined) setFinancialAccountIdRaw(next.financialAccountId);
    if (submitted) {
      setErrors(
        validate({
          paymentMethod: next.paymentMethod ?? paymentMethod,
          paymentDate: next.paymentDate ?? paymentDate,
          amountPaid: next.amountPaid ?? amountPaid,
          referenceNumber: next.referenceNumber ?? referenceNumber,
          notes: next.notes ?? notes,
          financialAccountId: next.financialAccountId ?? financialAccountId,
        }),
      );
    }
  }

  const setPaymentMethod = (v: PaymentMethod) => update({ paymentMethod: v });
  const setPaymentDate = (v: string) => update({ paymentDate: v });
  const setAmountPaid = (v: string) => update({ amountPaid: v });
  const setReferenceNumber = (v: string) => update({ referenceNumber: v });
  const setNotes = (v: string) => update({ notes: v });
  const setFinancialAccountId = (v: string) => update({ financialAccountId: v });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = validate({
      paymentMethod,
      paymentDate,
      amountPaid,
      referenceNumber,
      notes,
      financialAccountId,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    mutate(
      {
        pembayaranId,
        paymentMethod,
        paymentDate,
        amountPaid: Number(amountPaid),
        ...(referenceNumber.trim() ? { referenceNumber: referenceNumber.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(financialAccountId.trim() ? { financialAccountId: financialAccountId.trim() } : {}),
      },
      {
        onSuccess: (data) => {
          if (data.warning === "overpaid") {
            toast.success("Pembayaran tercatat — nominal melebihi sisa tagihan (overpaid).");
          } else {
            toast.success("Pembayaran berhasil dicatat.");
          }
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            if (error.errors) {
              const hasFieldErrors = Object.values(error.errors).some(
                (msgs) => Array.isArray(msgs) && msgs.length > 0,
              );
              if (hasFieldErrors) {
                const serverFieldErrors: FieldErrors = {};
                for (const [field, msgs] of Object.entries(error.errors)) {
                  if (Array.isArray(msgs) && msgs[0]) {
                    serverFieldErrors[field as keyof FieldErrors] = msgs[0];
                  }
                }
                if (Object.keys(serverFieldErrors).length > 0) {
                  setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
                }
                const detail = Object.entries(error.errors)
                  .filter(([, msgs]) => Array.isArray(msgs) && msgs.length > 0)
                  .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
                  .join(" | ");
                toast.error(
                  detail || error.message || "Gagal mencatat pembayaran. Silakan coba lagi.",
                );
                return;
              }
            }

            if (error.issues?.length) {
              const issueDetail = error.issues
                .map((i) => (i.path ? `${i.path}: ${i.message}` : i.message))
                .join(" | ");
              toast.error(issueDetail || error.message);
              // Map issue path to field if possible
              const mapped: FieldErrors = {};
              for (const iss of error.issues) {
                const key = iss.path.split(".")[0] as keyof FieldErrors;
                if (key && !mapped[key]) mapped[key] = iss.message;
              }
              if (Object.keys(mapped).length) setErrors((prev) => ({ ...prev, ...mapped }));
              return;
            }
            if (error.formErrors?.length) {
              toast.error(error.formErrors.join(" | ") || error.message);
              return;
            }
            toast.error(error.message || "Gagal mencatat pembayaran. Silakan coba lagi.");
            return;
          }
          toast.error("Gagal mencatat pembayaran. Silakan coba lagi.");
        },
      },
    );
  }

  return {
    paymentMethod,
    setPaymentMethod,
    paymentDate,
    setPaymentDate,
    amountPaid,
    setAmountPaid,
    referenceNumber,
    setReferenceNumber,
    notes,
    setNotes,
    financialAccountId,
    setFinancialAccountId,
    remainingBalance,
    errors,
    isPending,
    handleSubmit,
  };
}

export type { FieldErrors };
export { settlementRecordSchema };
