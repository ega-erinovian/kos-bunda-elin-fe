import { MobileLogsSection } from "@/components/features/admin/payment/MobileLogsSection";
import { DesktopLogsSection } from "@/components/features/admin/payment/DesktopLogsSection";

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <MobileLogsSection />
      <DesktopLogsSection />
    </div>
  );
}
