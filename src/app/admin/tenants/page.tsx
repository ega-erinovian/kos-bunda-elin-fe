"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Search,
  Plus,
  Pencil,
  DoorOpen,
  Trash2,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils";

type Tenant = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  room: string;
  checkInDate: string;
  rentCost: number;
  dueDate: string;
  dueLabel: string;
  dueVariant: "default" | "secondary" | "destructive" | "outline";
};

const data: Tenant[] = [
  {
    id: "1",
    name: "Ayu Saraswati",
    initials: "AS",
    phone: "0812-3456-7890",
    room: "101",
    checkInDate: "15 Jan 2024",
    rentCost: 1500000,
    dueDate: "15 Feb 2024",
    dueLabel: "15 Feb 2024",
    dueVariant: "secondary",
  },
  {
    id: "2",
    name: "Budi Wijaya",
    initials: "BW",
    phone: "0856-7890-1234",
    room: "102",
    checkInDate: "01 Feb 2024",
    rentCost: 1500000,
    dueDate: "01 Mar 2024",
    dueLabel: "01 Mar 2024 (Telat)",
    dueVariant: "destructive",
  },
  {
    id: "3",
    name: "Citra Dewi",
    initials: "CD",
    phone: "0899-1234-5678",
    room: "201",
    checkInDate: "10 Des 2023",
    rentCost: 1800000,
    dueDate: "10 Mar 2024",
    dueLabel: "10 Mar 2024 (Lunas)",
    dueVariant: "default",
  },
  {
    id: "4",
    name: "Doni Prasetyo",
    initials: "DP",
    phone: "0813-4567-8901",
    room: "202",
    checkInDate: "20 Feb 2024",
    rentCost: 1800000,
    dueDate: "20 Mar 2024",
    dueLabel: "20 Mar 2024",
    dueVariant: "secondary",
  },
  {
    id: "5",
    name: "Eka Fitriani",
    initials: "EF",
    phone: "0821-5678-9012",
    room: "301",
    checkInDate: "05 Mar 2024",
    rentCost: 2000000,
    dueDate: "05 Apr 2024",
    dueLabel: "05 Apr 2024",
    dueVariant: "secondary",
  },
];

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredData = data.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.room.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "lunas")
      return matchesSearch && tenant.dueVariant === "default";
    if (statusFilter === "telat")
      return matchesSearch && tenant.dueVariant === "destructive";
    if (statusFilter === "menunggak")
      return matchesSearch && tenant.dueVariant === "secondary";
    return matchesSearch;
  });

  const columns: ColumnDef<Tenant>[] = [
    {
      accessorKey: "name",
      header: "Nama Penghuni",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
            {row.original.initials}
          </div>
          <span className="font-medium text-card-foreground">
            {row.original.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "No. Telepon",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.phone}</span>
      ),
    },
    {
      accessorKey: "room",
      header: "Kamar",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-medium">
          {row.original.room}
        </Badge>
      ),
    },
    {
      accessorKey: "checkInDate",
      header: "Tanggal Masuk",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.checkInDate}
        </span>
      ),
    },
    {
      accessorKey: "rentCost",
      header: "Biaya Sewa",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatCurrency(row.original.rentCost)}
        </span>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Jatuh Tempo Berikutnya",
      cell: ({ row }) => (
        <Badge variant={row.original.dueVariant}>
          {row.original.dueLabel}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: () => (
        <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary/10 hover:text-secondary"
            title="Set Keluar"
          >
            <DoorOpen className="h-4 w-4" />
          </button>
          <button
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Hapus"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-heading-lg-mobile text-on-surface md:text-heading-lg">
            Manajemen Penghuni
          </h1>
          <p className="mt-1 text-muted-foreground">
            Kelola data penghuni kos, status pembayaran, dan informasi kamar.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau kamar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-auto">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Status Bayar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="lunas">Lunas</SelectItem>
              <SelectItem value="telat">Telat</SelectItem>
              <SelectItem value="menunggak">Menunggak</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full rounded-2xl sm:w-auto">
            <Plus className="h-4 w-4" />
            Tambah Penghuni
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-border/30 bg-card shadow-ambient-md">
        <DataTable columns={columns} data={filteredData} pageSize={5} />
      </div>
    </div>
  );
}

