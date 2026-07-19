"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

export default function RoomsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kamar</h2>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data kamar kos.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kamar
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Kamar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Kamar</TableHead>
                <TableHead>Lantai</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Penghuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                  Belum ada data kamar.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
