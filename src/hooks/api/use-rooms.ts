"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, PaginatedResponse, Room } from "@/types";

const ROOMS_KEY = ["rooms"];

export type RoomListParams = {
  page?: number;
  limit?: number;
  status?: Room["status"];
  lantai?: string;
  search?: string;
};

export type CreateRoomInput = {
  nomor: string;
  lantai: string;
  harga: number;
  status?: Room["status"];
};

export type UpdateRoomInput = Partial<CreateRoomInput>;

export function useRooms(params?: RoomListParams) {
  return useQuery({
    queryKey: [...ROOMS_KEY, params],
    queryFn: () => api.get<PaginatedResponse<Room>>("/kamar", { params }),
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: [...ROOMS_KEY, id],
    queryFn: () => api.get<ApiResponse<Room>>(`/kamar/${id}`),
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoomInput) => api.post<Room>("/kamar", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROOMS_KEY }),
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateRoomInput & { id: string }) =>
      api.patch<Room>(`/kamar/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROOMS_KEY }),
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<Room>(`/kamar/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROOMS_KEY }),
  });
}
