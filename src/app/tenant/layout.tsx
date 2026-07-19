import { TenantLayout } from "@/components/layout/tenant-layout";

export default function TenantDashboardLayout({ children }: { children: React.ReactNode }) {
  return <TenantLayout>{children}</TenantLayout>;
}
