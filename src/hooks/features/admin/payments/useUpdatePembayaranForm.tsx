"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { useUpdatePayment as useUpdatePaymentApi } from "@/hooks/api/use-payments";
import { ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import type { Payment } from "@/types";

const updatePembayaranSchema = z.object({
  tanggalJatuhTempo: z
    .string()
    .min(1, "Tanggal jatuh tempo wajib diisi")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Tanggal jatuh tempo tidak valid"),
  catatan: z.string().optional(),
  financialAccountId: z.string().uuid().optional(),
});

type FieldErrors = {
  tanggalJatuhTempo?: string;
  catatan?: string;
  financialAccountId?: string;
};

export function useUpdatePembayaranForm(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editingPayment?: Payment | null,
  onSuccess?: () => void,
) {
  const { mutate, isPending } = useUpdatePaymentApi();
  const pembayaranId = editingPayment?.id ?? null;

  const [tanggalJatuhTempo, setTanggalJatuhTempoRaw] = useState("");
  const [catatan, setCatatanRaw] = useState("");
  const [financialAccountId, setFinancialAccountIdRaw] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const [initializedId, setInitializedId] = useState<string | null>(null);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) setInitializedId(null);
  }

  if (editingPayment && initializedId !== editingPayment.id) {
    setInitializedId(editingPayment.id);
    setTanggalJatuhTempoRaw(editingPayment.tanggalJatuhTempo);
    setCatatanRaw(editingPayment.catatan ?? "");
    setFinancialAccountIdRaw((editingPayment as any).financialAccountId ?? "");
    setErrors({});
    setSubmitted(false);
  }

  function validate(next: { tanggalJatuhTempo: string; financialAccountId?: string }): FieldErrors {
    const result = updatePembayaranSchema.safeParse({ ...next });
    if (result.success) return {};
    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FieldErrors;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return fieldErrors;
  }

  function update(next: { tanggalJatuhTempo?: string; financialAccountId?: string }) {
    if (next.tanggalJatuhTempo !== undefined) setTanggalJatuhTempoRaw(next.tanggalJatuhTempo);
    if (next.financialAccountId !== undefined) setFinancialAccountIdRaw(next.financialAccountId);
    if (submitted) {
      setErrors(
        validate({
          tanggalJatuhTempo: next.tanggalJatuhTempo ?? tanggalJatuhTempo,
          financialAccountId: next.financialAccountId ?? financialAccountId,
        }),
      );
    }
  }

  const setTanggalJatuhTempo = (v: string) => update({ tanggalJatuhTempo: v });
  const setCatatan = (v: string) => setCatatanRaw(v);
  const setFinancialAccountId = (v: string) => update({ financialAccountId: v });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = validate({ tanggalJatuhTempo, financialAccountId });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !pembayaranId || !editingPayment) return;

    mutate(
      {
        id: pembayaranId,
        tanggalJatuhTempo,
        ...(catatan.trim() ? { catatan: catatan.trim() } : {}),
        ...(financialAccountId.trim() ? { financialAccountId: financialAccountId.trim() } : {}),
      },
      {
        onSuccess: () => {
          toast.success(
            `Tagihan periode ${editingPayment.periodeBulan}/${editingPayment.periodeTahun} berhasil diperbarui.`,
          );
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          const detail =
            error instanceof ApiError && error.message
              ? error.message
              : "Gagal memperbarui tagihan. Silakan coba lagi.";
          toast.error(detail);
        },
      },
    );
  }

  return {
    tanggalJatuhTempo,
    setTanggalJatuhTempo,
    catatan,
    setCatatan,
    financialAccountId,
    setFinancialAccountId,
    errors,
    isPending,
    isLoading: false,
    handleSubmit,
  };
}

export type { FieldErrors };
