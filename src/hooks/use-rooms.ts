"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Room } from "@/types";

const ROOMS_KEY = ["rooms"];

export function useRooms() {
  return useQuery({
    queryKey: ROOMS_KEY,
    queryFn: () => api.get<Room[]>("/rooms"),
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: [...ROOMS_KEY, id],
    queryFn: () => api.get<Room>(`/rooms/${id}`),
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Room, "id" | "createdAt" | "updatedAt">) =>
      api.post<Room>("/rooms", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROOMS_KEY }),
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Room> & { id: string }) =>
      api.put<Room>(`/rooms/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROOMS_KEY }),
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/rooms/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROOMS_KEY }),
  });
}
