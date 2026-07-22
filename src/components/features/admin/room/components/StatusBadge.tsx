import type { RoomStatus } from "../types";
import { statusConfig } from "../constants";

export function StatusBadge({ status }: { status: RoomStatus }) {
  const c = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label-sm ${c.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
