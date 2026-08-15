import { MobileTenantSection } from "@/components/features/admin/tenant/MobileTenantSection";
import { DesktopTenantSection } from "@/components/features/admin/tenant/DesktopTenantSection";

export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <MobileTenantSection />
      <DesktopTenantSection />
    </div>
  );
}
