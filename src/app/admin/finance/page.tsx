import Link from "next/link";
import { Wallet, Tag, FileText, Shield, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  { href: "/admin/finance/accounts", label: "Akun", desc: "Kelola akun keuangan", icon: Wallet },
  { href: "/admin/finance/categories", label: "Kategori", desc: "INCOME & EXPENSE", icon: Tag },
  {
    href: "/admin/finance/transactions",
    label: "Transaksi",
    desc: "Pemasukan & pengeluaran manual",
    icon: FileText,
  },
  {
    href: "/admin/finance/reports",
    label: "Laporan",
    desc: "Pendapatan, beban, arus kas & laba rugi",
    icon: BarChart3,
  },
  {
    href: "/admin/finance/audit-log",
    label: "Audit Log",
    desc: "OWNER only · jejak perubahan",
    icon: Shield,
  },
];

export default function FinanceOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Keuangan"
        subtitle="Ledger inti — akun, kategori, transaksi, dan audit log."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <Link key={l.href} href={l.href}>
              <Card
                variant="bordered"
                className="h-full p-0 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-heading-md">{l.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body-md text-on-surface-variant">{l.desc}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
