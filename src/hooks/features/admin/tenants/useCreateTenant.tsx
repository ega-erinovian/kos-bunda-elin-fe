"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { useCreateTenant as useCreateTenantApi } from "@/hooks/api/use-tenants";
import toast from "react-hot-toast";

const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;

const createTenantSchema = z.object({
  nama: z.string().trim().min(1, "Nama penghuni wajib diisi"),
  noHp: z.string().trim().regex(phoneRegex, "Nomor HP tidak valid (contoh: 08123456789)"),
  kamarId: z.string().uuid("Kamar wajib dipilih"),
  tanggalMulaiSewa: z.string().min(1, "Tanggal masuk wajib diisi"),
  nominalSewa: z
    .string()
    .trim()
    .min(1, "Nominal sewa wajib diisi")
    .refine((v) => Number(v) > 0, "Nominal sewa harus lebih dari 0"),
  tanggalJatuhTempo: z
    .string()
    .trim()
    .min(1, "Tanggal jatuh tempo wajib diisi")
    .refine((v) => {
      const num = Number(v);
      return num >= 1 && num <= 28;
    }, "Jatuh tempo harus antara 1-28"),
});

type FieldErrors = {
  nama?: string;
  noHp?: string;
  kamarId?: string;
  tanggalMulaiSewa?: string;
  nominalSewa?: string;
  tanggalJatuhTempo?: string;
};

export function useCreateTenant(open: boolean, onOpenChange: (open: boolean) => void) {
  const { mutate, isPending } = useCreateTenantApi();
  const [nama, setNamaRaw] = useState("");
  const [noHp, setNoHpRaw] = useState("");
  const [kamarId, setKamarIdRaw] = useState("");
  const [tanggalMulaiSewa, setTanggalMulaiSewaRaw] = useState("");
  const [nominalSewa, setNominalSewaRaw] = useState("");
  const [tanggalJatuhTempo, setTanggalJatuhTempoRaw] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setNamaRaw("");
      setNoHpRaw("");
      setKamarIdRaw("");
      setTanggalMulaiSewaRaw("");
      setNominalSewaRaw("");
      setTanggalJatuhTempoRaw("");
      setErrors({});
      setSubmitted(false);
    }
  }

  function validate(next: {
    nama: string;
    noHp: string;
    kamarId: string;
    tanggalMulaiSewa: string;
    nominalSewa: string;
    tanggalJatuhTempo: string;
  }): FieldErrors {
    const result = createTenantSchema.safeParse(next);
    if (result.success) return {};
    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FieldErrors;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return fieldErrors;
  }

  function update(next: {
    nama?: string;
    noHp?: string;
    kamarId?: string;
    tanggalMulaiSewa?: string;
    nominalSewa?: string;
    tanggalJatuhTempo?: string;
  }) {
    if (next.nama !== undefined) setNamaRaw(next.nama);
    if (next.noHp !== undefined) setNoHpRaw(next.noHp);
    if (next.kamarId !== undefined) setKamarIdRaw(next.kamarId);
    if (next.tanggalMulaiSewa !== undefined) setTanggalMulaiSewaRaw(next.tanggalMulaiSewa);
    if (next.nominalSewa !== undefined) setNominalSewaRaw(next.nominalSewa);
    if (next.tanggalJatuhTempo !== undefined) setTanggalJatuhTempoRaw(next.tanggalJatuhTempo);
    if (submitted) {
      setErrors(
        validate({
          nama: next.nama ?? nama,
          noHp: next.noHp ?? noHp,
          kamarId: next.kamarId ?? kamarId,
          tanggalMulaiSewa: next.tanggalMulaiSewa ?? tanggalMulaiSewa,
          nominalSewa: next.nominalSewa ?? nominalSewa,
          tanggalJatuhTempo: next.tanggalJatuhTempo ?? tanggalJatuhTempo,
        }),
      );
    }
  }

  const setNama = (v: string) => update({ nama: v });
  const setNoHp = (v: string) => update({ noHp: v });
  const setKamarId = (v: string) => update({ kamarId: v });
  const setTanggalMulaiSewa = (v: string) => update({ tanggalMulaiSewa: v });
  const setNominalSewa = (v: string) => update({ nominalSewa: v });
  const setTanggalJatuhTempo = (v: string) => update({ tanggalJatuhTempo: v });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = validate({
      nama,
      noHp,
      kamarId,
      tanggalMulaiSewa,
      nominalSewa,
      tanggalJatuhTempo,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    mutate(
      {
        nama: nama.trim(),
        noHp: noHp.trim(),
        kamarId,
        tanggalMulaiSewa,
        nominalSewa: Number(nominalSewa),
        tanggalJatuhTempo: Number(tanggalJatuhTempo),
      },
      {
        onSuccess: () => {
          toast.success(`Penghuni ${nama.trim()} telah ditambahkan.`);
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Gagal menambahkan penghuni. Silakan coba lagi.");
        },
      },
    );
  }

  return {
    nama,
    setNama,
    noHp,
    setNoHp,
    kamarId,
    setKamarId,
    tanggalMulaiSewa,
    setTanggalMulaiSewa,
    nominalSewa,
    setNominalSewa,
    tanggalJatuhTempo,
    setTanggalJatuhTempo,
    errors,
    isPending,
    handleSubmit,
  };
}
