"use client";

import { MobileRoomSection } from "@/components/features/admin/room/MobileRoomSection";
import { DesktopRoomSection } from "@/components/features/admin/room/DesktopRoomSection";

export default function RoomsPage() {
  return (
    <div className="space-y-6">
      <MobileRoomSection />
      <DesktopRoomSection />
    </div>
  );
}
