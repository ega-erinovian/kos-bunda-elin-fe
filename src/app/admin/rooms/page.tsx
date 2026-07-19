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
import { PageHeader } from "@/components/ui/page-header";
import { Plus } from "lucide-react";

export default function RoomsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Kamar" subtitle="Kelola data kamar kos.">
        <Button>
          <Plus className="h-4 w-4" />
          Tambah Kamar
        </Button>
      </PageHeader>
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
