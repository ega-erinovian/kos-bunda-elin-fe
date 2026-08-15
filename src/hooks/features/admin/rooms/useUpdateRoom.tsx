"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { useRoom, useUpdateRoom as useUpdateRoomApi } from "@/hooks/api/use-rooms";
import toast from "react-hot-toast";
import type { Room as ApiRoom } from "@/types";
import type { RoomStatus } from "@/components/features/admin/room/types";

const STATUS_MAP: Record<ApiRoom["status"], RoomStatus> = {
  KOSONG: "kosong",
  TERISI: "terisi",
  NONAKTIF: "nonaktif",
};

const updateKamarSchema = z.object({
  nomor: z.string().trim().min(1, "Nomor kamar wajib diisi"),
  lantai: z.string().trim().min(1, "Lantai wajib diisi"),
  harga: z
    .string()
    .trim()
    .min(1, "Harga wajib diisi")
    .refine((v) => Number(v) > 0, "Harga harus lebih dari 0"),
  status: z.enum(["KOSONG", "TERISI", "NONAKTIF"]).default("KOSONG"),
});

type FieldErrors = {
  nomor?: string;
  lantai?: string;
  harga?: string;
};

export function useUpdateRoom(
  open: boolean,
  roomId: string | null,
  onOpenChange: (open: boolean) => void,
) {
  const { data, isLoading } = useRoom(roomId ?? "");
  const room = data?.data;
  const { mutate, isPending } = useUpdateRoomApi();

  const [nomor, setNomorRaw] = useState("");
  const [lantai, setLantaiRaw] = useState("1");
  const [harga, setHargaRaw] = useState("");
  const [status, setStatusRaw] = useState<RoomStatus>("kosong");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const [initializedId, setInitializedId] = useState<string | null>(null);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) setInitializedId(null);
  }

  if (room && initializedId !== room.id) {
    setInitializedId(room.id);
    setNomorRaw(room.nomor);
    setLantaiRaw(room.lantai ?? "1");
    setHargaRaw(String(room.harga));
    setStatusRaw(STATUS_MAP[room.status] ?? "kosong");
    setErrors({});
    setSubmitted(false);
  }

  function validate(next: { nomor: string; lantai: string; harga: string }): FieldErrors {
    const result = updateKamarSchema.safeParse({ ...next, status: status.toUpperCase() });
    if (result.success) return {};
    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FieldErrors;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return fieldErrors;
  }

  function update(next: { nomor?: string; lantai?: string; harga?: string }) {
    if (next.nomor !== undefined) setNomorRaw(next.nomor);
    if (next.lantai !== undefined) setLantaiRaw(next.lantai);
    if (next.harga !== undefined) setHargaRaw(next.harga);
    if (submitted) {
      setErrors(
        validate({
          nomor: next.nomor ?? nomor,
          lantai: next.lantai ?? lantai,
          harga: next.harga ?? harga,
        }),
      );
    }
  }

  const setNomor = (v: string) => update({ nomor: v });
  const setLantai = (v: string) => update({ lantai: v });
  const setHarga = (v: string) => update({ harga: v });
  const setStatus = (v: RoomStatus) => setStatusRaw(v);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = validate({ nomor, lantai, harga });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !roomId) return;
    mutate(
      {
        id: roomId,
        nomor: nomor.trim(),
        lantai,
        harga: Number(harga),
        status: status.toUpperCase() as ApiRoom["status"],
      },
      {
        onSuccess: () => {
          toast.success(`Kamar ${nomor.trim()} pada lantai ${lantai} telah diperbarui.`);
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Gagal memperbarui kamar. Silakan coba lagi.");
        },
      },
    );
  }

  return {
    nomor,
    setNomor,
    lantai,
    setLantai,
    harga,
    setHarga,
    status,
    setStatus,
    errors,
    isPending,
    isLoading,
    handleSubmit,
  };
}
