import { MobilePaymentSection } from "@/components/features/admin/payment/MobilePaymentSection"
import { DesktopPaymentSection } from "@/components/features/admin/payment/DesktopPaymentSection"

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <MobilePaymentSection />
      <DesktopPaymentSection />
    </div>
  )
}
