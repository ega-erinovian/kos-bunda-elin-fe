import { AdminAuthGuard } from "@/components/features/admin/auth/AdminAuthGuard";
import { AdminLayout } from "@/components/layout/admin-layout";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthGuard>
  );
}
