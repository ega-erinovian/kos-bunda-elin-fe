"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { useCreatePayment as useCreatePaymentApi } from "@/hooks/api/use-payments";
import { ApiError } from "@/lib/api";
import { getMonthName } from "@/lib/utils";
import toast from "react-hot-toast";

const createPembayaranSchema = z.object({
  penyewaId: z.string().min(1, "Penghuni wajib dipilih"),
  periodeBulan: z
    .number()
    .int()
    .min(1, "Periode bulan harus antara 1-12")
    .max(12, "Periode bulan harus antara 1-12"),
  periodeTahun: z.number().int().min(2020, "Periode tahun minimal 2020"),
  tanggalJatuhTempo: z
    .string()
    .min(1, "Tanggal jatuh tempo wajib diisi")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Tanggal jatuh tempo tidak valid"),
  nominal: z
    .string()
    .trim()
    .min(1, "Nominal wajib diisi")
    .refine((v) => Number(v) > 0, "Nominal harus lebih dari 0"),
  catatan: z.string().optional(),
});

type FieldErrors = {
  penyewaId?: string;
  periodeBulan?: string;
  periodeTahun?: string;
  tanggalJatuhTempo?: string;
  nominal?: string;
  catatan?: string;
};

type FormValues = {
  penyewaId: string;
  bulan: string;
  tahun: string;
  tanggalJatuhTempo: string;
  nominal: string;
};

export function useCreatePembayaranForm(open: boolean, onOpenChange: (open: boolean) => void) {
  const { mutate, isPending } = useCreatePaymentApi();

  const now = new Date();
  const [penyewaId, setPenyewaIdRaw] = useState("");
  const [bulan, setBulanRaw] = useState(String(now.getMonth() + 1));
  const [tahun, setTahunRaw] = useState(String(now.getFullYear()));
  const [tanggalJatuhTempo, setTanggalJatuhTempoRaw] = useState("");
  const [nominal, setNominalRaw] = useState("");
  const [catatan, setCatatanRaw] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setPenyewaIdRaw("");
      setBulanRaw(String(new Date().getMonth() + 1));
      setTahunRaw(String(new Date().getFullYear()));
      setTanggalJatuhTempoRaw("");
      setNominalRaw("");
      setCatatanRaw("");
      setErrors({});
      setSubmitted(false);
    }
  }

  function validate(next: FormValues & { catatan: string }): FieldErrors {
    const result = createPembayaranSchema.safeParse({
      penyewaId: next.penyewaId,
      periodeBulan: Number(next.bulan),
      periodeTahun: Number(next.tahun),
      tanggalJatuhTempo: next.tanggalJatuhTempo,
      nominal: next.nominal,
      catatan: next.catatan.trim() || undefined,
    });
    if (result.success) return {};
    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FieldErrors;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return fieldErrors;
  }

  function update(next: Partial<FormValues> & { catatan?: string }) {
    if (next.penyewaId !== undefined) setPenyewaIdRaw(next.penyewaId);
    if (next.bulan !== undefined) setBulanRaw(next.bulan);
    if (next.tahun !== undefined) setTahunRaw(next.tahun);
    if (next.tanggalJatuhTempo !== undefined) setTanggalJatuhTempoRaw(next.tanggalJatuhTempo);
    if (next.nominal !== undefined) setNominalRaw(next.nominal);
    if (next.catatan !== undefined) setCatatanRaw(next.catatan);
    if (submitted) {
      setErrors(
        validate({
          penyewaId: next.penyewaId ?? penyewaId,
          bulan: next.bulan ?? bulan,
          tahun: next.tahun ?? tahun,
          tanggalJatuhTempo: next.tanggalJatuhTempo ?? tanggalJatuhTempo,
          nominal: next.nominal ?? nominal,
          catatan: next.catatan ?? catatan,
        }),
      );
    }
  }

  const setPenyewaId = (v: string) => update({ penyewaId: v });
  const setBulan = (v: string) => update({ bulan: v });
  const setTahun = (v: string) => update({ tahun: v });
  const setTanggalJatuhTempo = (v: string) => update({ tanggalJatuhTempo: v });
  const setNominal = (v: string) => update({ nominal: v });
  const setCatatan = (v: string) => update({ catatan: v });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = validate({ penyewaId, bulan, tahun, tanggalJatuhTempo, nominal, catatan });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    mutate(
      {
        penyewaId,
        periodeBulan: Number(bulan),
        periodeTahun: Number(tahun),
        tanggalJatuhTempo,
        nominal: Number(nominal),
        ...(catatan.trim() ? { catatan: catatan.trim() } : {}),
      },
      {
        onSuccess: () => {
          toast.success(`Tagihan periode ${getMonthName(Number(bulan))} ${tahun} berhasil dibuat.`);
          onOpenChange(false);
        },
        onError: (error) => {
          const detail =
            error instanceof ApiError && error.message
              ? error.message
              : "Gagal membuat tagihan. Silakan coba lagi.";
          toast.error(detail);
        },
      },
    );
  }

  return {
    penyewaId,
    setPenyewaId,
    bulan,
    setBulan,
    tahun,
    setTahun,
    tanggalJatuhTempo,
    setTanggalJatuhTempo,
    nominal,
    setNominal,
    catatan,
    setCatatan,
    errors,
    isPending,
    handleSubmit,
  };
}
